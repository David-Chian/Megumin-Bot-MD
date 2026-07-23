if (!global._connect4Sessions) global._connect4Sessions = new Map()

export const ROWS = 6
export const COLS = 7
export const NUM_EMOJI = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']
export const EMPTY  = '⬛'
export const DISCS  = { p1: '🔴', p2: '🟡', bot: '🟡' }

export function toNumEmoji(n: number): string {
  return String(n).split('').map(d => NUM_EMOJI[parseInt(d)]).join('')
}

export function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export function createBoard(): string[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY))
}

export function dropDisc(board: string[][], col: number, disc: string): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = disc
      return r
    }
  }
  return -1
}

export function isColFull(board: string[][], col: number): boolean {
  return board[0][col] !== EMPTY
}

export function checkWin(board: string[][], disc: string): boolean {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if ([0,1,2,3].every(i => board[r][c+i] === disc)) return true
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      if ([0,1,2,3].every(i => board[r+i][c] === disc)) return true
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if ([0,1,2,3].every(i => board[r+i][c+i] === disc)) return true
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 3; c < COLS; c++)
      if ([0,1,2,3].every(i => board[r+i][c-i] === disc)) return true
  return false
}

export function isBoardFull(board: string[][]): boolean {
  return board[0].every(cell => cell !== EMPTY)
}

export function renderBoard(board: string[][]): string {
  const header = Array.from({ length: COLS }, (_, i) => toNumEmoji(i + 1)).join('')
  const rows   = board.map(row => row.join('')).join('\n')
  return header + '\n' + rows
}

export function buildMessage(session: any): string {
  const { p1, p2, turn, scores, board, usedPrefix, botId } = session
  const isBot   = p2 === botId
  const p1Tag   = `@${p1.split('@')[0]}`
  const p2Tag   = isBot ? '🤖 Bot' : `@${p2.split('@')[0]}`
  const turnTag = turn === p1 ? p1Tag : (isBot ? '🤖 Bot' : p2Tag)
  const disc    = turn === p1 ? DISCS.p1 : DISCS.p2

  return (
    `🔴🟡 *CONECTA 4*\n\n` +
    `${renderBoard(board)}\n\n` +
    `🏅 ${p1Tag} ${DISCS.p1}: *${scores[p1]}* | ${p2Tag} ${DISCS.p2}: *${scores[p2]}*\n\n` +
    `${disc} Turno de *${turnTag}*\n` +
    `Envía el número de columna (1-${COLS})\n\n` +
    `> *${usedPrefix}c4cancelar* — Abandonar`
  )
}

function scoreWindow(window: string[], disc: string, oppDisc: string): number {
  const mine = window.filter(c => c === disc).length
  const opp  = window.filter(c => c === oppDisc).length
  const empty = window.filter(c => c === EMPTY).length
  if (mine === 4) return 100
  if (mine === 3 && empty === 1) return 5
  if (mine === 2 && empty === 2) return 2
  if (opp === 3 && empty === 1) return -4
  return 0
}

function scoreBoard(board: string[][], disc: string, oppDisc: string): number {
  let score = 0
  const centerCol = board.map(r => r[Math.floor(COLS / 2)])
  score += centerCol.filter(c => c === disc).length * 3
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += scoreWindow([0,1,2,3].map(i => board[r][c+i]), disc, oppDisc)
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      score += scoreWindow([0,1,2,3].map(i => board[r+i][c]), disc, oppDisc)
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += scoreWindow([0,1,2,3].map(i => board[r+i][c+i]), disc, oppDisc)
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 3; c < COLS; c++)
      score += scoreWindow([0,1,2,3].map(i => board[r+i][c-i]), disc, oppDisc)
  return score
}

function minimax(
  board: string[][], depth: number, alpha: number, beta: number,
  maximizing: boolean, botDisc: string, oppDisc: string
): { score: number; col: number } {
  const validCols = Array.from({ length: COLS }, (_, i) => i).filter(c => !isColFull(board, c))

  if (checkWin(board, botDisc)) return { score: 100000 + depth, col: -1 }
  if (checkWin(board, oppDisc)) return { score: -100000 - depth, col: -1 }
  if (isBoardFull(board) || depth === 0)
    return { score: scoreBoard(board, botDisc, oppDisc), col: -1 }

  let bestCol = validCols[Math.floor(validCols.length / 2)]

  if (maximizing) {
    let best = -Infinity
    for (const col of validCols) {
      const copy = board.map(r => [...r])
      dropDisc(copy, col, botDisc)
      const { score } = minimax(copy, depth - 1, alpha, beta, false, botDisc, oppDisc)
      if (score > best) { best = score; bestCol = col }
      alpha = Math.max(alpha, best)
      if (alpha >= beta) break
    }
    return { score: best, col: bestCol }
  } else {
    let best = Infinity
    for (const col of validCols) {
      const copy = board.map(r => [...r])
      dropDisc(copy, col, oppDisc)
      const { score } = minimax(copy, depth - 1, alpha, beta, true, botDisc, oppDisc)
      if (score < best) { best = score; bestCol = col }
      beta = Math.min(beta, best)
      if (alpha >= beta) break
    }
    return { score: best, col: bestCol }
  }
}

export function getBotMove(board: string[][], botDisc: string, oppDisc: string): number {
  const { col } = minimax(board, 5, -Infinity, Infinity, true, botDisc, oppDisc)
  return col === -1
    ? Array.from({ length: COLS }, (_, i) => i).filter(c => !isColFull(board, c))[0]
    : col
}

export default {
  command: ['conecta4', 'c4', 'connect4', 'c4cancelar', 'aceptarc4'],
  category: 'rpg',

  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    if (command === 'c4cancelar') {
      const session = [...global._connect4Sessions.values()].find(
        (s: any) => s.chat === chatId && (s.p1 === sender || s.p2 === sender)
      ) as any
      if (!session) return m.reply(`⚠️ No tienes ninguna partida en curso.`)
      global._connect4Sessions.delete(session.id)
      return sock.sendMessage(chatId, {
        text: `🚫 @${sender.split('@')[0]} abandonó la partida.`,
        mentions: [sender]
      })
    }

    if (command === 'aceptarc4') {
      const session = [...global._connect4Sessions.values()].find(
        (s: any) => s.chat === chatId && s.p2 === sender && s.state === 'WAITING'
      ) as any
      if (!session) return m.reply(`❌ No tienes ningún reto pendiente.`)
      clearTimeout(session.timeout)
      session.state = 'PLAYING'
      const msg = await sock.sendMessage(chatId, {
        text: buildMessage(session),
        mentions: [session.p1, session.p2]
      })
      session.lastMsg = msg.key
      global._connect4Sessions.set(session.id, session)
      return
    }

    const inGame = [...global._connect4Sessions.values()].find(
      (s: any) => s.chat === chatId && (s.p1 === sender || s.p2 === sender)
    )
    if (inGame)
      return m.reply(`⚠️ Ya tienes una partida en curso.\nEnvía el número de columna o *${usedPrefix}c4cancelar* para abandonar.`)

    const chatUser  = getChatUser(chatId, sender)
    const remaining = (chatUser.c4Cooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    let opponent = m.mentionedJid?.[0] || m.quoted?.sender || null
    if (!opponent || opponent === sender) opponent = botId

    if (opponent !== botId) {
      const opBusy = [...global._connect4Sessions.values()].find(
        (s: any) => s.chat === chatId && (s.p1 === opponent || s.p2 === opponent)
      )
      if (opBusy) return m.reply(`❌ Ese usuario ya está en una partida.`)
    }

    updateChatUser(chatId, sender, 'c4Cooldown', Date.now() + 10 * 60000)

    const id      = `c4-${Date.now()}`
    const session: any = {
      id,
      chat:      chatId,
      p1:        sender,
      p2:        opponent,
      botId,
      turn:      sender,
      state:     opponent === botId ? 'PLAYING' : 'WAITING',
      board:     createBoard(),
      scores:    { [sender]: 0, [opponent]: 0 },
      usedPrefix,
      lastMsg:   null,
      timeout:   null,
    }

    global._connect4Sessions.set(id, session)

    if (opponent === botId) {
      const msg = await sock.sendMessage(chatId, {
        text: buildMessage(session),
        mentions: [sender]
      }, { quoted: m })
      session.lastMsg = msg.key
    } else {
      session.timeout = setTimeout(() => {
        if (global._connect4Sessions.has(id)) {
          global._connect4Sessions.delete(id)
          sock.sendMessage(chatId, {
            text: `⏰ El reto de @${sender.split('@')[0]} a @${opponent.split('@')[0]} expiró sin respuesta.`,
            mentions: [sender, opponent]
          })
        }
      }, 60000)

      await sock.sendMessage(chatId, {
        text:
          `🔴🟡 *¡RETO CONECTA 4!*\n\n` +
          `🎯 @${sender.split('@')[0]} reta a @${opponent.split('@')[0]}\n\n` +
          `@${opponent.split('@')[0]}, tienes *1 minuto* para responder.\n\n` +
          `> *${usedPrefix}aceptarc4* para Aceptar`,
        mentions: [sender, opponent],
        buttons: [{
          buttonId: `${usedPrefix}aceptarc4`,
          buttonText: { displayText: 'Aceptar Reto' },
          type: 1
        }]
      }, { quoted: m })
    }
  }
}