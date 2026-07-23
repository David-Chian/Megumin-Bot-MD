function getLastActive(usedTime) {
  if (!usedTime) return 0;
  if (typeof usedTime === 'number') return usedTime;
  if (usedTime instanceof Date) return usedTime.getTime();
  if (typeof usedTime === 'string') {
    try {
      return new Date(JSON.parse(usedTime)).getTime();
    } catch {
      return new Date(usedTime).getTime();
    }
  }
  return 0;
}

function msToTime(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  return `${day}d ${hour % 24}h ${min % 60}m ${sec % 60}s`;
}

async function deleteUser(userId) {
  try {
    const result = await deletedb('user', userId);
    return result;
  } catch (e) {
    return false;
  }
}

async function deleteChatUser(chatId, userId) {
  try {
    const result = await deletedb('chatuser', chatId, userId);
    return result;
  } catch (e) {
    return false;
  }
}

export default {
  command: ['inactivos'],
  category: 'grupo',
  run: async ({sock, m, command, args}) => {
    const chatData = await getChat(m.chat);
    if (!chatData) return m.reply('ꕥ No se encontraron datos del grupo');

    const metadata = await sock.groupMetadata(m.chat);
    const isAdmin = m.isGroup && metadata.participants.find(p => p.id === m.sender)?.admin;
    const text = m.text.toLowerCase();
    const isDeleteMode = text.includes('delete');
    const isViewMode = text.includes('view');
    const isFullDeleteMode = text.includes('full') || text.includes('complete');

    if (!isAdmin && !isViewMode) return m.reply('ꕥ Este comando solo puede ser usado por administradores');

    try {
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      let userList = [];
      let mentions = [];
      let totalWaifus = 0;
      let totalDinero = 0;
      let count = 0;
      let deletedUsers = [];

      const chatUsers = await getChatUser(m.chat);
      
      for (const user of chatUsers) {
        const jid = user.user_id;
        const lastActive = getLastActive(user.usedTime);
        const inactiveTime = now - lastActive;

        const isValidTime = typeof lastActive === 'number' && lastActive > 0;
        const isInactive = isValidTime && inactiveTime > THIRTY_DAYS_MS;

        if (isViewMode && isValidTime) {
          const userData = await getUser(jid);
          const displayName = userData?.name || jid.split('@')[0];
          const waifus = user.characters?.length || 0;
          const dinero = user.coins || 0;
          const formattedTime = msToTime(inactiveTime);

          userList.push(`*${displayName} [${waifus}] →* hace ${formattedTime}`);
          mentions.push(jid);
          totalWaifus += waifus;
          totalDinero += dinero;
        } else if (isInactive) {
          const userData = await getUser(jid);
          const displayName = userData?.name || jid.split('@')[0];
          const waifus = user.characters?.length || 0;
          const dinero = user.coins || 0;
          const formattedTime = msToTime(inactiveTime);

          userList.push(`*${displayName} [${waifus}] →* hace ${formattedTime}`);
          mentions.push(jid);
          totalWaifus += waifus;
          totalDinero += dinero;

          if (isDeleteMode && !isViewMode) {
            if (isFullDeleteMode) {
              const userDeleted = await deleteUser(jid);
              const chatUserDeleted = await deleteChatUser(m.chat, jid);
              
              if (userDeleted || chatUserDeleted) {
                deletedUsers.push(jid);
                count++;
              }
            } else {
              const deleted = await deleteChatUser(m.chat, jid);
              if (deleted) count++;
            }
          }
        }
      }

      if (userList.length === 0) {
        if (isViewMode) {
          return m.reply('ꕥ No hay usuarios con actividad registrada en este grupo');
        } else {
          return m.reply('ꕥ No hay usuarios inactivos en este grupo');
        }
      }

      const botSettings = await getSettings('bot');
      const currency = botSettings?.currency || 'Diamantes 💎';
      let details = '';

      if (isDeleteMode) {
        if (isFullDeleteMode) {
          details += '*✰ Delete Users Completos ღゝ◡╹ )ノ*\n\n';
          details += `> ✿ *Claims eliminadas ›* ${totalWaifus.toLocaleString()}\n`;
          details += `> ⛁ *${currency} eliminados ›* ${totalDinero.toLocaleString()}\n`;
          details += `> ✩ *Usuarios eliminados completamente ›* ${count.toLocaleString()}\n`;
          details += `> ❒ *Tiempo límite ›* 30 días\n\n`;
        } else {
          details += '*✰ Delete Users Inactivos (●´ϖ`●)*\n\n';
          details += `> ✿ *Claims eliminadas ›* ${totalWaifus.toLocaleString()}\n`;
          details += `> ⛁ *${currency} eliminados ›* ${totalDinero.toLocaleString()}\n`;
          details += `> ✩ *Usuarios inactivos ›* ${count.toLocaleString()}\n`;
          details += `> ❒ *Tiempo límite ›* 30 días\n\n`;
        }
      } else if (isViewMode) {
        details += '*✰ Users Info (●´ϖ`●)*\n\n';
        details += `> ✿ *Claims ›* ${totalWaifus.toLocaleString()}\n`;
        details += `> ⛁ *${currency} ›* ${totalDinero.toLocaleString()}\n`;
        details += `> ❒ *Usuarios encontrados ›* ${userList.length}\n\n`;
      } else {
        details += '*✰ Users Inactivos (●´ϖ`●)*\n\n';
        details += `> ✿ *Claims ›* ${totalWaifus.toLocaleString()}\n`;
        details += `> ⛁ *${currency} ›* ${totalDinero.toLocaleString()}\n`;
        details += `> ❒ *Usuarios inactivos ›* ${userList.length}\n\n`;
      }

      userList = userList.map((line, i) => `${i + 1}. ${line}`);
      details += userList.join('\n');
      
      if (isFullDeleteMode && deletedUsers.length > 0) {
        details += '\n\n*✿ Usuarios eliminados completamente (●´ϖ`●):*\n';
        for (let i = 0; i < Math.min(10, deletedUsers.length); i++) {
          const jid = deletedUsers[i];
          const userData = await getUser(jid);
          const name = userData?.name || jid.split('@')[0];
          details += `${i + 1}. *${name}* (${jid})\n`;
        }
        if (deletedUsers.length > 10) {
          details += `... y ${deletedUsers.length - 10} más\n`;
        }
      }

      if (isDeleteMode) {
        clearCache('chatuser', m.chat);
      }

      await sock.reply(m.chat, details, m);
    } catch (e) {
    //  console.error('Error en comando clear:', e);
      m.reply(msgglobal + e);
    }
  }
};
