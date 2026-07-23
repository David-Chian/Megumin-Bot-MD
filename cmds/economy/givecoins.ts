import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  run: async ({sock, m, args}) => {

    try {
    const chatId = m.chat
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency || 'coins'
    const chatData = await getChat(m.chat)

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const [cantidadInputRaw, ...rest] = args
    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || args.find(arg => arg.includes('@s.whatsapp.net'))
    const who = await resolveLidToRealJid(who2, sock, m.chat);
    if (!who2) return m.reply(`《✤》 Debes mencionar a quien quieras transferir *${monedas}*.`)

    const senderData = await getChatUser(m.chat, m.sender)
    const targetData = await getChatUser(m.chat, who)

    if (!targetData) return m.reply(`「✿」 El usuario mencionado no está registrado en el bot.`)

    const cantidadInput = cantidadInputRaw?.toLowerCase()
    const cantidad = cantidadInput === 'all'
      ? senderData.coins
      : parseInt(cantidadInput)

    if (!cantidadInput || isNaN(cantidad) || cantidad <= 0)
      return m.reply(`ꕥ Ingresa una cantidad válida de *${monedas}* para transferir.`)

    if (senderData.coins < cantidad)
      return m.reply(`ꕥ No tienes suficientes *${monedas}* para transferir ${cantidad}.`)

    senderData.coins -= cantidad
    targetData.coins += cantidad

   await updateChatUser(m.chat, m.sender, 'coins', senderData.coins)
   await updateChatUser(m.chat, who, 'coins', targetData.coins)

      const cantidadFormatted = cantidad.toLocaleString()
      const textoTransferencia = `*¥${cantidadFormatted} ${monedas}*`

await sock.reply(
  chatId,
  `「✿」 Transferiste ${textoTransferencia} a *@${who.split('@')[0]}*.`,
  m,
  { mentions: [who] }
)
    } catch (e) {
      await m.reply(msgglobal + e)
    }
  }
};
