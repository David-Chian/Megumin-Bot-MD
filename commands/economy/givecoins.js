import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency || 'coins'
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const [cantidadInputRaw, ...rest] = args
    const mentioned = m.mentionedJid || []
    const who2 = mentioned[0] || args.find(arg => arg.includes('@s.whatsapp.net'))
    const who = await resolveLidToRealJid(who2, client, m.chat);
    if (!who2) return m.reply(`《✧》 Debes mencionar a quien quieras transferir *${monedas}*.`)

    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[who]

    if (!targetData) return m.reply(`《✧》 El usuario mencionado no está registrado en el bot.`)

    const cantidadInput = cantidadInputRaw?.toLowerCase()
    const cantidad = cantidadInput === 'all'
      ? senderData.coins
      : parseInt(cantidadInput)

    if (!cantidadInput || isNaN(cantidad) || cantidad <= 0)
      return m.reply(`《✧》 Ingresa una cantidad válida de *${monedas}* para transferir.`)

    if (senderData.coins < cantidad)
      return m.reply(`《✧》 No tienes suficientes *${monedas}* para transferir ${cantidad}.`)

    senderData.coins -= cantidad
    targetData.coins += cantidad

    try {
      const cantidadFormatted = cantidad.toLocaleString()
      const textoTransferencia = `*¥${cantidadFormatted} ${monedas}*`

      await client.sendMessage(
        chatId,
        {
          text: `✎ Transferiste ${textoTransferencia} a *@${who.split('@')[0]}*.`,
          mentions: [who],
        },
        { quoted: m }
      )
    } catch (e) {
      await m.reply(`《✧》 Error al enviar la confirmación de transferencia.`)
    }
  }
};