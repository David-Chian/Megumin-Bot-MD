export default {
  command: ['kick'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({sock, m, args, command, text, usedPrefix}) => {
    const groupInfo = await sock.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net';
    const ownerBot = global.owner + '@s.whatsapp.net';
    const participants = groupInfo.participants;
    const botId = sock.decodeJid(sock.user.id);    
    if (args[0] === 'num' || args[0] === 'listnum') {
      if (!args[1]) return m.reply(`ꕤ Ingrese algún prefijo de un país\n> ✎ Ejemplo: *${usedPrefix + command} num +54*`);
      const prefix = args[1].replace(/[+]/g, '');
      const allUsersWithPrefix = participants.map(p => p.phoneNumber).filter(phoneNumber => phoneNumber !== botId && phoneNumber.startsWith(prefix));
      if (allUsersWithPrefix.length === 0) return m.reply(`ꕤ Aquí no hay ningún número con el prefijo +${prefix}`);
      if (args[0] === 'listnum') {
        const numeros = allUsersWithPrefix.map(v => '⭔ @' + v.replace(/@.+/, ''));
        return sock.reply(m.chat, `✎ *Lista de usuarios con prefijo +${prefix}* (${allUsersWithPrefix.length})\n\n${numeros.join('\n')}`, m, { mentions: allUsersWithPrefix });
      }
      const usersToKick = allUsersWithPrefix.filter(user => {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) return false;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') return false;
        if (user === ownerGroup) return false;
        if (user === ownerBot) return false;
        return true;
      });
      if (usersToKick.length === 0) {
        return m.reply(`ꕤ Hay usuarios con prefijo +${prefix} pero todos son admins.`);
      }
      await m.reply(`ꕤ *Eliminando usuarios con prefijo +${prefix}* (${usersToKick.length} de ${allUsersWithPrefix.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of usersToKick) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(m.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      }
      return m.reply(mensajeFinal);
    }    
    if (args[0] === 'all') {
      const allUsers = participants.map(p => p.id);
      const usersToKick = allUsers.filter(user => {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) return false;
        if (user === botId) return false;
        if (user === ownerGroup) return false;
        if (user === ownerBot) return false;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') return false;
        return true;
      });
      if (usersToKick.length === 0) {
        return m.reply('ꕤ No hay usuarios para eliminar (todos son admis).');
      }
      await m.reply(`ꕤ *Eliminando todos los usuarios* (${usersToKick.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of usersToKick) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(m.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      }
      return m.reply(mensajeFinal);
    }    
    if (args[0] === 'inactive' || args[0] === 'listinactive') {
      const allChatUsers = await getChatUser(m.chat);
      const now = new Date();
      let daysArg = 30;
      const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000);
      let sider = [];
      for (const participant of participants) {
        const user = participant.id;
        if (user === botId) continue;
        if (user === ownerGroup) continue;
        if (user === ownerBot) continue;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') continue;
        const userStats = allChatUsers.find(u => {
          const participantFound = participants.find(p => p.phoneNumber === u.user_id || p.jid === u.user_id || p.id === u.user_id || p.lid === u.user_id);
          return participantFound?.id === user;
        });
        if (userStats) {
          const days = Object.entries(userStats.stats || {}).filter(([date]) => new Date(date) >= cutoff);
          const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
          if (totalMsgs === 0) {
            sider.push(user);
          }
        } else {
          sider.push(user);
        }
      }
      if (sider.length === 0) return m.reply('ꕤ Este grupo es activo, no tiene inactivos.');
      if (args[0] === 'listinactive') {
        return sock.reply(m.chat, `✎ *Lista de inactivos* (${sider.length})\n\n${sider.map(v => '⭔ @' + v.replace(/@.+/, '')).join('\n')}`, m, { mentions: sider });
      }
      await m.reply(`ꕤ *Eliminando inactivos* (${sider.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      let errores = [];
      for (const user of sider) {
        const participant = participants.find(p => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
        if (!participant) continue;
        try {
          await sock.groupParticipantsUpdate(m.chat, [user], 'remove');
          eliminados++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (e) {
          errores.push(`@${user.split('@')[0]}: ${e.message}`);
        }
      }
      let mensajeFinal = `✎ Proceso completado. usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) {
        mensajeFinal += `\n> Errores: *[${errores.join('\n')}]*`;
      }
      return m.reply(mensajeFinal);
    }    
    if (!m.mentionedJid[0] && !m.quoted) {
      return m.reply(`《✤》 Por favor, Etiqueta o responde al *mensaje* de la *persona* que quieres eliminar.\n\n✎ *Opciones especiales:*\n> *${usedPrefix + command} num +57* - Eliminar todos los usuarios con prefijo +57\n> *${usedPrefix + command} listnum +56* - Listar usuarios con prefijo +56\n> *${usedPrefix + command} all* - Eliminar todos los usuarios\n> *${usedPrefix + command} inactive* - Eliminar usuarios inactivos últimos (30 días)\n> *${usedPrefix + command} listinactive* - Listar usuarios inactivos`);
    }    
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;
    const participant = groupInfo.participants.find((p) => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user);
    if (!participant) {
      return sock.reply(m.chat, `✎ @${user.split('@')[0]} ya no está en el grupo.`, m, { mentions: [user] });
    }
    if (user === sock.decodeJid(sock.user.id)) {
      return m.reply('ꕤ No puedo eliminar al *bot* del grupo');
    }
    if (user === ownerGroup) {
      return m.reply('ꕤ No puedo eliminar al *propietario* del grupo');
    }
    if (user === ownerBot) {
      return m.reply('ꕤ No puedo eliminar al *propietario* del bot');
    }
    try {
      await sock.groupParticipantsUpdate(m.chat, [user], 'remove');
      sock.reply(m.chat, `✎ @${user.split('@')[0]} *eliminado* correctamente`, m, { mentions: [user] });
    } catch (e) {
      return m.reply(msgglobal);
    }
  },
};
