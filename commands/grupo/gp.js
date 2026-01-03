import ws from 'ws';
import fs from 'fs';

export default {
  command: ['gp', 'groupinfo'],
  category: 'grupo',
  run: async ({client, m, args}) => {
    const from = m.chat
    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch((e) => {}) : ''
    const groupName = groupMetadata.subject;
    const groupCreator = groupMetadata.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Desconocido';

    const totalParticipants = groupMetadata.participants.length;
    const chatId = m.chat;
    const chat = global.db.data.chats[chatId] || {};
    const chatUsers = chat.users || {};

    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = global.db.data.settings[botId];

    const botname = botSettings.namebot2;
    const monedas = botSettings.currency;

    let totalCoins = 0;
    let registeredUsersInGroup = 0;
    let totalClaimedWaifus = 0;

const resolvedUsers = await Promise.all(
  groupMetadata.participants.map(async (participant) => {
    return { ...participant, phoneNumber: participant.phoneNumber, jid: participant.jid };
  })
);

    resolvedUsers.forEach((participant) => {
  const fullId = participant.phoneNumber || participant.jid || participant.id;
  const user = chatUsers[fullId];
  if (user) {
    registeredUsersInGroup++;
    totalCoins += Number(user.coins) || 0;
    const personagens = Array.isArray(user.characters) ? user.characters : [];
    totalClaimedWaifus += personagens.length;
  }
});

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net')
      ? `@${rawPrimary.split('@')[0]}`
      : 'Aleatorio';

    const settings = {
      bot: chat.bannedGrupo ? '✘ Desactivado' : '✓ Activado',
      antiLinks: chat.antilinks ? '✓ Activado' : '✘ Desactivado',
      welcomes: chat.welcome ? '✓ Activado' : '✘ Desactivado',
      alerts: chat.alerts ? '✓ Activado' : '✘ Desactivado',
      gacha: chat.gacha ? '✓ Activado' : '✘ Desactivado',
      rpg: chat.rpg ? '✓ Activado' : '✘ Desactivado',
      nsfw: chat.nsfw ? '✓ Activado' : '✘ Desactivado',
      adminMode: chat.adminonly ? '✓ Activado' : '✘ Desactivado',
      botprimary: botprimary
    };

    try {
      let message = `*「✿」Grupo ◢ ${groupName} ◤*\n\n`;
      message += `➪ *Creador ›* ${groupCreator}\n`;
      message += `❖ Bot Principal › *${settings.botprimary}*\n`;
      message += `❒ Usuarios › *${totalParticipants}*\n`;
      message += `ꕥ Registrados › *${registeredUsersInGroup}*\n`;
      message += `✿ Claims › *${totalClaimedWaifus}*\n`;
      message += `⛁ Dinero › *${totalCoins.toLocaleString()} ${monedas}*\n\n`;
      message += `➪ *Configuraciones:*\n`;
      message += `✐ ${botname} › *${settings.bot}*\n`;
      message += `✐ AntiLinks › *${settings.antiLinks}*\n`;
      message += `✐ Bienvenidas › *${settings.welcomes}*\n`;
      message += `✐ Alertas › *${settings.alerts}*\n`;
      message += `✐ Gacha › *${settings.gacha}*\n`;
      message += `✐ Economía › *${settings.rpg}*\n`;
      message += `✐ Nsfw › *${settings.nsfw}*\n`;
      message += `✐ ModoAdmin › *${settings.adminMode}*`;

      const mentionOw = groupMetadata.owner ? groupMetadata.owner : '';
      const mentions = [rawPrimary, mentionOw].filter(Boolean);

      await client.reply(m.chat, message.trim(), m, { mentions });
    } catch (e) {
      await m.reply(msgglobal);
    }
  }
};
