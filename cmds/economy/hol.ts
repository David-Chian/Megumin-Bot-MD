if (!global._holSessions) global._holSessions = new Map()

const SUITS       = ['♠️', '♥️', '♦️', '♣️']
const VALUES      = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const MULTIPLIERS = [1.0, 1.2, 1.5, 2.0, 2.5, 3.5, 5.0]

function msToTime(duration: number) {
  let seconds: any = Math.floor((duration / 1000) % 60)
  let minutes: any = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

function randomCard() {
  const suit       = SUITS[Math.floor(Math.random() * SUITS.length)]
  const valueIndex = Math.floor(Math.random() * VALUES.length)
  return { suit, value: VALUES[valueIndex], index: valueIndex }
}

function cardDisplay(card: { value: string; suit: string }) {
  return `*${card.value}${card.suit}*`
}

function buildProgress(streak: number) {
  const max    = MULTIPLIERS.length - 1
  const filled = Math.min(streak, max)
  return '🟨'.repeat(filled) + '⬜'.repeat(max - filled)
}

function currentMultiplier(streak: number) {
  return MULTIPLIERS[Math.min(streak, MULTIPLIERS.length - 1)]
}

function buildMessage(session: any, state = 'playing') {
  const { currentCard, streak, amount, currency, usedPrefix } = session
  const mult       = currentMultiplier(streak)
  const potential  = Math.floor(amount * mult)
  const progress   = buildProgress(streak)

  const header        = `🃏 *HIGHER OR LOWER*`
  const cardLine      = `\n\nCarta actual: ${cardDisplay(currentCard)}`
  const streakLine    = `🔥 Racha: *${streak}* | Multiplicador: *${mult}x*`
  const potentialLine = `💰 Potencial: *${potential} ${currency}*`

  if (state === 'playing') {
    const hint = `\n¿La siguiente carta será más alta o más baja?\n\n> *${usedPrefix}higher* — Más alta\n> *${usedPrefix}lower* — Más baja\n> *${usedPrefix}holcobrar* — Cobrar (${potential} ${currency})`
    return `${header}${cardLine}\n\n${streakLine}\n${progress}\n${potentialLine}${hint}`
  }
  if (state === 'win')
    return `${header}${cardLine}\n\n${streakLine}\n${progress}\n${potentialLine}`
  if (state === 'cashout')
    return `${header}\n\n✅ *¡Cobraste!*\n${streakLine}\n${progress}\n💰 Ganaste: *${potential} ${currency}*`
  if (state === 'lose')
    return `${header}${cardLine}\n\n💥 *¡Fallaste!*\nRacha: *${streak}*\n📉 Perdiste: *${amount} ${currency}*`
  if (state === 'equal')
    return `${header}${cardLine}\n\n➡️ *¡Empate! La carta fue igual*\nRacha se mantiene en *${streak}*\n${progress}\n${potentialLine}`
}

export default {
  command: ['higherorlower', 'hol', 'higher', 'lower', 'holcobrar'],
  category: 'game',

  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    if (command === 'higher' || command === 'lower') {
      const session = global._holSessions.get(sender)
      if (!session || session.chat !== chatId)
        return m.reply(`⚠️ No tienes ninguna partida en curso. Escribe *${usedPrefix}hol <apuesta>* para empezar.`)

      const nextCard      = randomCard()
      const prev          = session.currentCard
      const isHigher      = nextCard.index > prev.index
      const isLower       = nextCard.index < prev.index
      const isEqual       = nextCard.index === prev.index
      const guessedHigher = command === 'higher'
      const correct       = (guessedHigher && isHigher) || (!guessedHigher && isLower)

      session.currentCard = nextCard

      if (isEqual) {
        const msg =
          buildMessage(session, 'equal') +
          `\n\nNueva carta: ${cardDisplay(nextCard)}\n\n> *${usedPrefix}higher* — Más alta\n> *${usedPrefix}lower* — Más baja\n> *${usedPrefix}holcobrar* — Cobrar`
        await sock.sendMessage(chatId, { text: msg, edit: session.key })
        return
      }

      if (!correct) {
        const user = getChatUser(chatId, sender)
        const msg =
          buildMessage(session, 'lose') +
          `\nCarta siguiente era: ${cardDisplay(nextCard)}\nSaldo: ${user.coins || 0} ${monedas}\n\n_Escribe_ *${usedPrefix}hol ${session.amount}* _para volver a jugar._`
        await sock.sendMessage(chatId, { text: msg, edit: session.key })
        global._holSessions.delete(sender)
        return
      }

      session.streak++
      const potential = Math.floor(session.amount * currentMultiplier(session.streak))

      if (session.streak >= MULTIPLIERS.length - 1) {
        const user     = getChatUser(chatId, sender)
        const newCoins = (user.coins || 0) + potential
        updateChatUser(chatId, sender, 'coins', newCoins)
        const msg =
          buildMessage(session, 'win') +
          `\n\n🏆 *¡Racha máxima alcanzada!*\n💰 Ganaste: *+${potential - session.amount} ${monedas}*\nSaldo: ${newCoins} ${monedas}\n\nNueva carta era: ${cardDisplay(nextCard)}`
        await sock.sendMessage(chatId, { text: msg, edit: session.key })
        global._holSessions.delete(sender)
        return
      }

      const msgCorrect = buildMessage(session, 'playing') + `\n\n✅ ¡Correcto! Nueva carta: ${cardDisplay(nextCard)}`
      await sock.sendMessage(chatId, { text: msgCorrect, edit: session.key })
      await new Promise(r => setTimeout(r, 1200))
      await sock.sendMessage(chatId, { text: buildMessage(session, 'playing'), edit: session.key })
      return
    }

    if (command === 'holcobrar') {
      const session = global._holSessions.get(sender)
      if (!session || session.chat !== chatId)
        return m.reply('⚠️ No tienes ninguna partida en curso.')
      if (session.streak === 0)
        return m.reply('⚠️ Debes acertar al menos una carta antes de cobrar.')

      const prize    = Math.floor(session.amount * currentMultiplier(session.streak))
      const user     = getChatUser(chatId, sender)
      const newCoins = (user.coins || 0) + prize
      updateChatUser(chatId, sender, 'coins', newCoins)

      const msg = buildMessage(session, 'cashout') + `\nSaldo: ${newCoins} ${monedas}`
      await sock.sendMessage(chatId, { text: msg, edit: session.key })
      global._holSessions.delete(sender)
      return
    }

    if (global._holSessions.has(sender))
      return m.reply(`⚠️ Ya tienes una partida en curso.\n\n> *${usedPrefix}higher* / *${usedPrefix}lower* para jugar\n> *${usedPrefix}holcobrar* para cobrar`)

    const user      = getChatUser(chatId, sender)
    const remaining = (user.holCooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    const amount = parseInt(text)
    if (isNaN(amount) || amount < 100)
      return m.reply(`🃏 *Uso:* ${usedPrefix + command} <apuesta>\n⚠️ Mínimo *100* ${monedas}.`)
    if (amount > 5000)
      return m.reply(`🃏 *Uso:* ${usedPrefix + command} <apuesta>\n⚠️ Máximo *5000* ${monedas}.`)
    if ((user.coins || 0) < amount)
      return m.reply(`❌ No tienes suficientes ${monedas}. Saldo: *${user.coins || 0}*`)

    updateChatUser(chatId, sender, 'coins',       (user.coins || 0) - amount)
    updateChatUser(chatId, sender, 'holCooldown',  Date.now() + 30 * 60000)

    const firstCard = randomCard()
    const session: any = {
      amount,
      currency:    monedas,
      usedPrefix,
      currentCard: firstCard,
      streak:      0,
      chat:        chatId,
      key:         null
    }

    global._holSessions.set(sender, session)

    const { key } = await sock.sendMessage(chatId, { text: buildMessage(session, 'playing') }, { quoted: m })
    session.key = key
  }
}