export default {
  command: ['restablecerdatos', 'deletedatauser', 'resetuser', 'borrardatos'],
  category: 'owner',
  isOwner: true,
  run: async ({ sock, m, text }) => {
    try {
      let user = '';

      if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
      } else if (m.quoted) {
        user = m.quoted.sender;
      } else if (text) {
        const number = text.replace(/[^0-9]/g, '');
        if (number.length > 5) user = number + '@s.whatsapp.net';
      }

      if (!user)
        return m.reply(`🚩 *Por favor, menciona a un usuario, responde a su mensaje o escribe su número.*`);

      const userNumber = user.split('@')[0];

      const selfId  = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const settings = getSettings(selfId);
      const owners  = Array.isArray(settings?.owners) ? settings.owners : [];
      if (owners.includes(userNumber))
        return m.reply(`❌ No puedes resetear los datos de un owner.`);

      let datosEliminados = false;

      const globalUser = getUser(user);
      if (globalUser) {
        deletedb('user', user);
        datosEliminados = true;
      }

      const chatUser = getChatUser(m.chat, user);
      if (chatUser) {
        deletedb('chatuser', m.chat, user);
        datosEliminados = true;
      }

      if (!datosEliminados)
        return sock.sendMessage(m.chat, {
          text: `🚩 *El usuario @${userNumber} no tiene datos registrados en mi base de datos.*`,
          mentions: [user]
        }, { quoted: m });

      await sock.sendMessage(m.chat, {
        text: `✅ *Éxito:* Se han borrado todos los registros de @${userNumber} (Inventario, experiencia y personajes).`,
        mentions: [user]
      }, { quoted: m });

    } catch (e) {
      console.error('Error al restablecer datos del usuario:', e);
      m.reply(`❌ Ocurrió un error: ${e.message}`);
    }
  }
};