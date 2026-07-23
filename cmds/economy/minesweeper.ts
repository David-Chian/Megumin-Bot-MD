if (!global._mineSessions) global._mineSessions = new Map()

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export const DIFFICULTIES: Record<string, { size: number; mines: number; multipliers: number[] }> = {
  facil: {
    size: 5,
    mines: 4,
    multipliers: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.2]
  },
  medio: {
    size: 7,
    mines: 12,
    multipliers: [1.0, 1.15, 1.3, 1.45, 1.6, 1.75, 1.90, 2.05, 2.20, 2.35, 2.50, 2.65, 3.0]
  },
  dificil: {
    size: 8,
    mines: 20,
    multipliers: [
      1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6,
      2.8, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.2, 4.5, 5.0
    ]
  }
}

export function generateBoard(size: number, mineCount: number): boolean[] {
  const cells = Array(size * size).fill(false)
  let placed = 0
  while (placed < mineCount) {
    const idx = Math.floor(Math.random() * cells.length)
    if (!cells[idx]) { cells[idx] = true; placed++ }
  }
  return cells
}

export function countAdjacentMines(mines: boolean[], row: number, col: number, size: number): number {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = row + dr, nc = col + dc
      if (nr >= 0 && nr < size && nc >= 0 && nc < size)
        if (mines[nr * size + nc]) count++
    }
  }
  return count
}

const ADJ_EMOJIS = ['⬜', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']

export const NUM_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

export function renderBoard(session: any, revealAll = false, hitIndex: number | null = null): string {
  const { mines, revealed, size } = session
  const colHeader = '     ' + Array.from({ length: size }, (_, i) => NUM_EMOJIS[i] || `${i + 1}️⃣`).join('')
  const lines = [colHeader]

  for (let row = 0; row < size; row++) {
    let line = String(row + 1).padStart(2) + '  '
    for (let col = 0; col < size; col++) {
      const idx = row * size + col
      if (revealAll) {
        if (mines[idx]) line += idx === hitIndex ? '💥' : '💣'
        else {
          const adj = countAdjacentMines(mines, row, col, size)
          line += revealed[idx] ? ADJ_EMOJIS[adj] : '🟦'
        }
      } else {
        if (revealed[idx]) {
          const adj = countAdjacentMines(mines, row, col, size)
          line += ADJ_EMOJIS[adj]
        } else {
          line += '🟦'
        }
      }
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export function getMultiplier(session: any): number {
  const { multipliers } = DIFFICULTIES[session.difficulty]
  return multipliers[Math.min(session.safeRevealed, multipliers.length - 1)]
}

export function buildPlayingMessage(session: any): string {
  const { amount, currency, usedPrefix, safeRevealed, difficulty, size } = session
  const mult      = getMultiplier(session)
  const potential = Math.floor(amount * mult)
  const totalSafe = size * size - DIFFICULTIES[difficulty].mines
  const mineCount = DIFFICULTIES[difficulty].mines
  const board     = renderBoard(session)

  return (
    `💣 *BUSCAMINAS* — ${difficulty.toUpperCase()}\n` +
    `📐 Tablero: ${size}×${size} | 💣 Minas: ${mineCount}\n\n` +
    `${board}\n\n` +
    `🔓 Destapadas: *${safeRevealed}/${totalSafe}* | Multiplicador: *${mult}x*\n` +
    `💰 Potencial: *${potential.toLocaleString()} ${currency}*\n\n` +
    `Envía la coordenada (columna fila)\n` +
    `Ejemplo: *35* = columna 3, fila 5\n\n` +
    `> *${usedPrefix}minecobrar* — Cobrar (${potential.toLocaleString()} ${currency})`
  )
}

export default {
  command: ['minesweeper', 'buscaminas', 'minecobrar'],
  category: 'rpg',
before: async (m: any, { sock }: any) => {
  if (!m.text || !global._mineSessions) return

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (m.sender === botId) return

  const session = global._mineSessions.get(m.sender)
  if (!session || session.chat !== m.chat) return

  const input = m.text.trim().replace(/[^\d]/g, '')
  if (!input || input.length < 2) return

  const { size, mines: mineCount } = DIFFICULTIES[session.difficulty]

  const col = parseInt(input[0]) - 1
  const row = parseInt(input[1]) - 1

  if (col < 0 || col >= size || row < 0 || row >= size) return

  const idx = row * size + col

  if (session.revealed[idx]) {
    await sock.sendMessage(m.chat, { text: `⚠️ Esa celda ya fue destapada. Elige otra.` }, { quoted: m })
    return
  }

  const { mines, usedPrefix, amount, currency } = session

  if (mines[idx]) {
    const board = renderBoard(session, true, idx)
    await sock.sendMessage(m.chat, {
      text:
        `💣 *BUSCAMINAS* — ${session.difficulty.toUpperCase()}\n\n` +
        `${board}\n\n` +
        `💥 *¡Pisaste una mina!*\n` +
        `📉 Perdiste: *${amount.toLocaleString()} ${currency}*\n\n` +
        `_Escribe_ *${usedPrefix}minesweeper ${amount} ${session.difficulty}* _para volver a jugar._`,
      edit: session.key
    })
    global._mineSessions.delete(m.sender)
    return
  }

  session.revealed[idx] = true
  session.safeRevealed++

  const totalSafe = size * size - mineCount

  if (session.safeRevealed >= totalSafe) {
    const chatId   = m.chat
    const chatUser = getChatUser(chatId, m.sender)
    const { multipliers } = DIFFICULTIES[session.difficulty]
    const mult  = multipliers[multipliers.length - 1]
    const prize = Math.floor(amount * mult)

    updateChatUser(chatId, m.sender, 'coins', (chatUser.coins || 0) + prize)
    global._mineSessions.delete(m.sender)

    const board = renderBoard(session)
    await sock.sendMessage(m.chat, {
      text:
        `💣 *BUSCAMINAS* — ${session.difficulty.toUpperCase()}\n\n` +
        `${board}\n\n` +
        `🏆 *¡Despejaste todo el tablero!*\n` +
        `💰 Ganaste: *${prize.toLocaleString()} ${currency}*`,
      edit: session.key
    })
    return
  }

  await sock.sendMessage(m.chat, {
    text: buildPlayingMessage(session),
    edit: session.key
  })
},
  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const chatUser = getChatUser(chatId, sender)

    if (command === 'minecobrar') {
      const session = global._mineSessions.get(sender)
      if (!session || session.chat !== chatId)
        return m.reply(`⚠️ No tienes ninguna partida en curso.`)

      if (session.safeRevealed === 0)
        return m.reply(`⚠️ Debes destapar al menos una celda antes de cobrar.`)

      const mult  = getMultiplier(session)
      const prize = Math.floor(session.amount * mult)

      updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + prize)
      global._mineSessions.delete(sender)

      const board = renderBoard(session)
      return sock.sendMessage(chatId, {
        text:
          `💣 *BUSCAMINAS* — ${session.difficulty.toUpperCase()}\n\n` +
          `${board}\n\n` +
          `✅ *¡Cobraste!*\n` +
          `🔓 Destapadas: *${session.safeRevealed}* | *${mult}x*\n` +
          `💰 Ganaste: *${prize.toLocaleString()} ${monedas}*`,
        edit: session.key
      })
    }

    if (global._mineSessions.has(sender)) {
      const session = global._mineSessions.get(sender)
      return m.reply(
        `⚠️ Ya tienes una partida en curso (${session.difficulty.toUpperCase()}).\n` +
        `Envía coordenadas para destapar o *${usedPrefix}minecobrar* para cobrar.`
      )
    }

    const remaining = (chatUser.mineweperCooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    const parts     = (text || '').trim().toLowerCase().split(/\s+/)
    const amountArg = parts.find((p: string) => /^\d+$/.test(p))
    const diffArg   = parts.find((p: string) => p in DIFFICULTIES) || 'medio'
    const amount    = parseInt(amountArg || '')

    if (!amount || amount < 100)
      return m.reply(
        `💣 *Uso:* ${usedPrefix}${command} <apuesta> [facil|medio|dificil]\n` +
        `⚠️ Mínimo *100 ${monedas}*\n\n` +
        `📋 *Dificultades:*\n` +
        `› *facil*   — 5×5,  3 minas\n` +
        `› *medio*   — 7×7, 12 minas\n` +
        `› *dificil* — 9×9, 20 minas`
      )
    if (!amount || amount > 15000)
      return m.reply(
        `💣 *Uso:* ${usedPrefix}${command} <apuesta> [facil|medio|dificil]\n` +
        `⚠️ Máximo *15000 ${monedas}*\n\n` +
        `📋 *Dificultades:*\n` +
        `› *facil*   — 5×5,  3 minas\n` +
        `› *medio*   — 7×7, 12 minas\n` +
        `› *dificil* — 9×9, 20 minas`
      )


    if ((chatUser.coins || 0) < amount)
      return m.reply(`❌ No tienes suficientes *${monedas}*. Saldo: *${(chatUser.coins || 0).toLocaleString()}*`)

    const { size, mines: mineCount } = DIFFICULTIES[diffArg]

    updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) - amount)
    updateChatUser(chatId, sender, 'mineweperCooldown', Date.now() + 40 * 60000)

    const session: any = {
      amount,
      currency:     monedas,
      usedPrefix,
      difficulty:   diffArg,
      size,
      mines:        generateBoard(size, mineCount),
      revealed:     Array(size * size).fill(false),
      safeRevealed: 0,
      chat:         chatId,
      key:          null
    }

    global._mineSessions.set(sender, session)

    const msg = buildPlayingMessage(session)
    const { key } = await sock.sendMessage(chatId, { text: msg }, { quoted: m })
    session.key = key
  }
}
