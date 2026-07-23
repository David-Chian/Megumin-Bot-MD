import { resolveLidToRealJid } from '../../core/utils.ts'

export default {
  command: ['steal', 'rob', 'robar'],
  category: 'rpg',
  run: async ({ sock, m }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botSettings = getSettings(botId)
    const monedas     = botSettings?.currency || 'Monedas'
    const chatData    = getChat(chatId)

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const mentioned = m.mentionedJid || []
    const who2      = mentioned[0] || (m.quoted ? m.quoted.sender : null)

    if (!who2)
      return m.reply(`《✧》 Debes mencionar a quien quieras robarle *${monedas}*.`)

    const target = await resolveLidToRealJid(who2, sock, chatId)
    if (!target)
      return m.reply('《✧》 No se pudo obtener el usuario correctamente.')

    if (target === sender)
      return m.reply('《✧》 No puedes robarte a ti mismo.')

    const senderData = getChatUser(chatId, sender)
    const targetData = getChatUser(chatId, target)
    const na         = getUser(target)

    if (!targetData)
      return m.reply('《✧》 El usuario *mencionado* no está *registrado* en el bot.')

    if ((targetData.coins || 0) < 50)
      return m.reply(
        `《✧》 *${na?.name || target.split('@')[0]}* no tiene suficiente *${monedas}* para robarle.`
      )

    const now           = Date.now()
    const cooldown      = 30 * 60 * 1000
    const remainingTime = (senderData.roboCooldown || 0) - now

    if (remainingTime > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remainingTime)}* antes de intentar robar nuevamente.`)

    const success = Math.random() < 0.70

    if (!success) {
      const fine         = Math.floor((senderData.coins || 0) * 0.15)
      const newCoins     = Math.max(0, (senderData.coins || 0) - fine)
      const newCooldown  = now + cooldown * 2

      updateChatUser(chatId, sender, 'coins',       newCoins)
      updateChatUser(chatId, sender, 'roboCooldown', newCooldown)

      return sock.sendMessage(chatId, {
        text:     `🚔 ¡FBI OPEN UP!\n\nꕥ *@${sender.split('@')[0]}* intentó robar a *${na?.name || target.split('@')[0]}* pero fue atrapado.\n\n💸 Multa: *-${fine.toLocaleString()} ${monedas}*`,
        mentions: [sender, target]
      }, { quoted: m })
    }

    const cantidadRobada = Math.min(
      Math.floor(Math.random() * 5000) + 50,
      targetData.coins || 0
    )

    updateChatUser(chatId, sender, 'coins',        (senderData.coins || 0) + cantidadRobada)
    updateChatUser(chatId, sender, 'roboCooldown',  now + cooldown)
    updateChatUser(chatId, target, 'coins',         Math.max(0, (targetData.coins || 0) - cantidadRobada))

    return sock.sendMessage(chatId, {
      text:     `ꕥ Le robaste *${cantidadRobada.toLocaleString()} ${monedas}* a *${na?.name || target.split('@')[0]}*.`,
      mentions: [target]
    }, { quoted: m })
  }
}

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}