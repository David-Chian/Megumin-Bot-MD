if (!global._memorySessions) global._memorySessions = new Map()

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export const MULTIPLIERS = [
  1.0, 1.1, 1.25, 1.4, 1.6, 1.85, 2.1, 2.4, 2.75, 3.2
]

export const TOTAL_CASILLAS = 10
const REVEAL_DELAY_MS = 300
const HIDE_DELAY_MS = 300

const EMPTY_CELL = '⬛'
const NUM_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

export function getMultiplier(session: any): number {
  const idx = Math.max(0, session.round - 1)
  return MULTIPLIERS[Math.min(idx, MULTIPLIERS.length - 1)]
}

export function renderEmptyBoard(): string {
  return Array(TOTAL_CASILLAS).fill(EMPTY_CELL).join('')
}

export function renderBoardWithDigit(digitIndex: number, posIndex: number): string {
  const cells = Array(TOTAL_CASILLAS).fill(EMPTY_CELL)
  cells[posIndex] = NUM_EMOJIS[digitIndex]
  return cells.join('')
}

export function buildHeaderMsg(session: any): string {
  const potential = Math.floor(session.amount * getMultiplier(session))
  return (
    `🧠 *MEMORIA* — Ronda ${session.round}/${TOTAL_CASILLAS}\n` +
    `💰 Apuesta: *${session.amount.toLocaleString()} ${session.currency}*\n` +
    `📈 Multiplicador: *${getMultiplier(session)}x* | Potencial: *${potential.toLocaleString()} ${session.currency}*\n\n`
  )
}

export function buildWaitingInputMessage(session: any): string {
  return (
    buildHeaderMsg(session) +
    `${renderEmptyBoard()}\n\n` +
    `✏️ Memoriza la secuencia y envíala completa.\n` +
    `Ejemplo: si viste 4, 9, 1 → escribe *491*\n\n` +
    `> *${session.usedPrefix}simoncobrar* — Cobrar ahora`
  )
}

function generarSecuencia(length: number): { digits: number[]; positions: number[] } {
  const digits: number[] = []
  const positions: number[] = []
  for (let i = 0; i < length; i++) {
    digits.push(Math.floor(Math.random() * 9) + 1)
    positions.push(Math.floor(Math.random() * TOTAL_CASILLAS))
  }
  return { digits, positions }
}

export async function reproducirSecuencia(sock: any, chatId: string, session: any) {
  const { digits, positions } = generarSecuencia(session.round)
  session.secuenciaActual = digits

  for (let i = 0; i < digits.length; i++) {
    const showBoard = renderBoardWithDigit(digits[i] - 1, positions[i])
    await sock.sendMessage(chatId, {
      text: buildHeaderMsg(session) + `${showBoard}\n\n_Memoriza..._`,
      edit: session.key
    })
    await new Promise(r => setTimeout(r, REVEAL_DELAY_MS))

    await sock.sendMessage(chatId, {
      text: buildHeaderMsg(session) + `${renderEmptyBoard()}\n\n_Memoriza..._`,
      edit: session.key
    })
    await new Promise(r => setTimeout(r, HIDE_DELAY_MS))
  }

  await sock.sendMessage(chatId, {
    text: buildWaitingInputMessage(session),
    edit: session.key
  })

  session.esperandoInput = true
}

export default {
  command: ['simon', 'simoncobrar'],
  category: 'rpg',
before: async (m: any, { sock }: any) => {
  if (!m.text || !global._memorySessions) return

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (m.sender === botId) return

  const session = global._memorySessions.get(m.sender)
  if (!session || session.chat !== m.chat) return
  if (!session.esperandoInput) return

  const input = m.text.trim().replace(/[^\d]/g, '')
  if (!input) return

  const { secuenciaActual, amount, currency, usedPrefix } = session
  const esperado = secuenciaActual.join('')

//  if (input.length !== esperado.length) return

  if (input !== esperado) {
    global._memorySessions.delete(m.sender)
    return sock.sendMessage(m.chat, {
      text:
        `🧠 *MEMORIA*\n\n` +
        `💥 *¡Te equivocaste!*\n` +
        `🔢 La secuencia era: *${esperado}*\n` +
        `📉 Perdiste: *${amount.toLocaleString()} ${currency}*\n\n` +
        `_Escribe_ *${usedPrefix}simon ${amount}* _para volver a jugar._`,
      edit: session.key
    })
  }

  session.esperandoInput = false

  if (session.round >= TOTAL_CASILLAS) {
    const chatUser = getChatUser(m.chat, m.sender)
    const mult  = MULTIPLIERS[MULTIPLIERS.length - 1]
    const prize = Math.floor(amount * mult)

    updateChatUser(m.chat, m.sender, 'coins', (chatUser.coins || 0) + prize)
    global._memorySessions.delete(m.sender)

    return sock.sendMessage(m.chat, {
      text:
        `🧠 *MEMORIA*\n\n` +
        `🏆 *¡Completaste las ${TOTAL_CASILLAS} rondas!*\n` +
        `💰 Ganaste: *${prize.toLocaleString()} ${currency}*`,
      edit: session.key
    })
  }

  session.round++

  await sock.sendMessage(m.chat, {
    text: buildHeaderMsg(session) + `✅ *¡Correcto!* Preparando siguiente ronda...`,
    edit: session.key
  })

  await new Promise(r => setTimeout(r, 1200))

  await reproducirSecuencia(sock, m.chat, session)
},
  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply('✎ Estos comandos están desactivados en este grupo.')

    const chatUser = getChatUser(chatId, sender)

    if (command === 'simoncobrar') {
      const session = global._memorySessions.get(sender)
      if (!session || session.chat !== chatId)
        return m.reply('⚠️ No tienes ninguna partida en curso.')

      if (session.round <= 1 || !session.esperandoInput)
        return m.reply('⚠️ Debes completar al menos una ronda antes de cobrar.')

      const ronda = session.round - 1
      const mult  = MULTIPLIERS[Math.min(ronda - 1, MULTIPLIERS.length - 1)]
      const prize = Math.floor(session.amount * mult)

      updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + prize)
      global._memorySessions.delete(sender)

      return sock.sendMessage(chatId, {
        text:
          `🧠 *MEMORIA*\n\n` +
          `✅ *¡Cobraste!*\n` +
          `🏆 Rondas superadas: *${ronda}* | *${mult}x*\n` +
          `💰 Ganaste: *${prize.toLocaleString()} ${monedas}*`,
        edit: session.key
      })
    }

    if (global._memorySessions.has(sender)) {
      const session = global._memorySessions.get(sender)
      return m.reply(
        `⚠️ Ya tienes una partida en curso (Ronda ${session.round}).\n` +
        `Envía la secuencia que memorizaste o *${usedPrefix}simoncobrar* para cobrar.`
      )
    }

    const remaining = (chatUser.simonCooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    const amount = parseInt((text || '').trim())

    if (!amount || amount < 100)
      return m.reply(
        `🧠 *Uso:* ${usedPrefix}${command} <apuesta>\n` +
        `⚠️ Mínimo *100 ${monedas}*\n\n` +
        `📋 Memoriza la secuencia de números que aparece y envíala completa.\n` +
        `Cada ronda añade un número más. ¡10 rondas en total!`
      )
    if (!amount || amount > 5000)
      return m.reply(
        `🧠 *Uso:* ${usedPrefix}${command} <apuesta>\n` +
        `⚠️ Máximo *5000 ${monedas}*\n\n` +
        `📋 Memoriza la secuencia de números que aparece y envíala completa.\n` +
        `Cada ronda añade un número más. ¡10 rondas en total!`
      )

    if ((chatUser.coins || 0) < amount)
      return m.reply(`❌ No tienes suficientes *${monedas}*. Saldo: *${(chatUser.coins || 0).toLocaleString()}*`)

    updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) - amount)
    updateChatUser(chatId, sender, 'simonCooldown', Date.now() + 20 * 60000)

    const session: any = {
      amount,
      currency: monedas,
      usedPrefix,
      round: 1,
      chat: chatId,
      key: null,
      secuenciaActual: [],
      esperandoInput: false
    }

    global._memorySessions.set(sender, session)

    const { key } = await sock.sendMessage(chatId, {
      text: buildHeaderMsg(session) + `${renderEmptyBoard()}\n\n_Preparando secuencia..._`
    }, { quoted: m })
    session.key = key

    await reproducirSecuencia(sock, chatId, session)
  }
}
