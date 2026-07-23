function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

const COLORS = [
  'red', 'red', 'red', 'red', 'red', 'red',
  'black', 'black', 'black', 'black', 'black', 'black',
  'green',
  'orange',
  'white',
]

const COLOR_EMOJI: Record<string, string> = {
  red: '🔴', black: '⚫', green: '🟢', orange: '🟠', white: '⚪'
}
const BETTABLE = ['red', 'black', 'green']

export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'rpg',

  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const user      = getChatUser(chatId, sender)
    const remaining = (user.rtCooldown || 0) - Date.now()

    if (remaining > 0)
      return m.reply(`⏳ Debes esperar *${msToTime(remaining)}* antes de volver a girar la ruleta 🎰`)

    const args = text?.trim().split(' ') ?? []
    if (args.length !== 2)
      return m.reply(`ꕥ Ingresa una cantidad y un color.\n🎲 *Ejemplo ›* ${usedPrefix + command} 200 black`)

    const amount = parseInt(args[0])
    const color  = args[1].toLowerCase()

    if (isNaN(amount))  return m.reply(`⚠️ Ingresa una cantidad válida.`)
    if (amount < 200)   return m.reply(`💰 La apuesta mínima es *200 ${monedas}*.`)
    if (amount > 10000) return m.reply(`🚫 No puedes apostar más de *10,000 ${monedas}* por ronda.`)

    if (!BETTABLE.includes(color))
      return m.reply(`🎨 Colores disponibles:\n🔴 red\n⚫ black\n🟢 green`)

    if ((user.coins || 0) < amount)
      return m.reply(`🚫 No tienes suficientes *${monedas}* para esta apuesta.`)

    updateChatUser(chatId, sender, 'rtCooldown', Date.now() + 10 * 60000)

    const result = COLORS[Math.floor(Math.random() * COLORS.length)]
    const emoji  = COLOR_EMOJI[result]

    if (result === 'orange') {
      updateChatUser(chatId, sender, 'coins', (user.coins || 0) - amount)
      return m.reply(
        `🎰 *RULETA ESPECIAL*\n\nLa bola cayó en ${emoji} *${result.toUpperCase()}*\n` +
        `😵 ¡Color maldito! 💸 Perdiste *${amount.toLocaleString()} ${monedas}*`
      )
    }

    if (result === 'white') {
      const total = user.coins || 0
      updateChatUser(chatId, sender, 'coins', 0)
      return m.reply(
        `🎰 *RULETA FATAL*\n\nLa bola cayó en ${emoji} *${result.toUpperCase()}*\n` +
        `☠️ ¡Desastre total! Perdiste *todo tu dinero (${total.toLocaleString()} ${monedas})*`
      )
    }

    if (result === color) {
      const reward = amount * (result === 'green' ? 14 : 2)
      updateChatUser(chatId, sender, 'coins', (user.coins || 0) + reward)
      return m.reply(
        `🎰 *RULETA*\n\nLa bola cayó en ${emoji} *${result.toUpperCase()}*\n\n` +
        `✨ ¡Ganaste *${reward.toLocaleString()} ${monedas}*!`
      )
    }

    updateChatUser(chatId, sender, 'coins', (user.coins || 0) - amount)
    return m.reply(
      `🎰 *RULETA*\n\nLa bola cayó en ${emoji} *${result.toUpperCase()}*\n\n` +
      `💸 Perdiste *${amount.toLocaleString()} ${monedas}*`
    )
  }
}