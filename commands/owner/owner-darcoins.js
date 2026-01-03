export default {
  command: ['darplata'],
  category: 'Owner',
  isOwner:true,
  run: async ({client, m, text, usedPrefix, args, command}) => {

  let [cantidadInput, ...rest] = text.split(' ');
  let texto = await m.mentionedJid;
  let who = texto.length > 0 ? texto[0] : false;

  let botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
  let botSettings = globalThis.db.data.settings[botId];
  let monedas = botSettings?.currency

  if (!cantidadInput)
    return m.reply(`✧ Ingresa una cantidad de *${monedas}* que quieras dar.\n\n📌 Ejemplo:\n> *${usedPrefix + command} 1000 @usuario*`);

  if (!who)
    return m.reply(`✧ Debes mencionar a quien quieras otorgar *${monedas}*.\n\n📌 Ejemplo:\n> *${usedPrefix + command} 1000 @usuario*`);

  let cantidad = parseInt(cantidadInput);
  if (isNaN(cantidad) || cantidad <= 0)
    return m.reply(`✧ Ingresa una cantidad válida de *${monedas}*.`);

    let targetUser = globalThis.db.data.chats[m.chat].users[who];
  if (!targetUser)
    return m.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);

  targetUser.coins = (targetUser.coins || 0) + cantidad;

  let cantidadFormatted = cantidad.toLocaleString();
  await client.reply(m.chat, `✅ Has otorgado *¥${cantidadFormatted} ${monedas}* a *@${who.split('@')[0]}*.`, m, { mentions: [who] });
  }}
