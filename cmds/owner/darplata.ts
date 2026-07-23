export default {
  command: ['darplata'],
  category: 'Owner',
  isOwner: true,
  run: async ({ sock, m, text, usedPrefix, args, command }) => {
    const bot = sock;

    const [cantidadInput] = text.split(' ');
    const who = m.mentionedJid?.[0] || false;

    const selfId   = bot.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = getSettings(selfId);
    const monedas  = settings?.currency || 'Diamantes 💎';

    if (!cantidadInput)
      return m.reply(`✧ Ingresa una cantidad de *${monedas}* que quieras dar.\n\n📌 Ejemplo:\n> *${usedPrefix + command} 1000 @usuario*`);

    if (!who)
      return m.reply(`✧ Debes mencionar a quien quieras otorgar *${monedas}*.\n\n📌 Ejemplo:\n> *${usedPrefix + command} 1000 @usuario*`);

    const cantidad = parseInt(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0)
      return m.reply(`✧ Ingresa una cantidad válida de *${monedas}*.`);

    if (cantidad > 5000000)
      return m.reply(`😑 No te exedas puta.\n⚠️ Máximo *5000000* ${monedas}.`)
    const targetUser = getChatUser(m.chat, who);
    if (!targetUser)
      return m.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);

    const newCoins = (targetUser.coins || 0) + cantidad;
    updateChatUser(m.chat, who, 'coins', newCoins);

    const cantidadFormatted = cantidad.toLocaleString();
    await bot.sendMessage(m.chat, {
      text: `✅ Has otorgado *¥${cantidadFormatted} ${monedas}* a *@${who.split('@')[0]}*.`,
      mentions: [who],
    }, { quoted: m });
  },
};
