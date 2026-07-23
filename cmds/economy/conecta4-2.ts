import {
  buildMessage as buildC4Message,
  COLS,
  DISCS,
  isColFull,
  dropDisc,
  checkWin,
  isBoardFull,
  renderBoard,
  getBotMove,
} from './conecta4.ts'

export async function beforeC4(m: any, { sock }: any) {
  if (!m.text || !global._connect4Sessions) return

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (m.sender === botId) return

  const session = [...global._connect4Sessions.values()].find(
    (s: any) => s.chat === m.chat &&
                s.state === 'PLAYING' &&
                (s.p1 === m.sender || s.p2 === m.sender)
  ) as any
  if (!session) return
  if (session.turn !== m.sender) return

  const input = m.text.trim().replace(/[^\d]/g, '')
  if (!input) return

  const col = parseInt(input[0]) - 1
  if (isNaN(col) || col < 0 || col >= COLS) return

  if (isColFull(session.board, col))
    return sock.sendMessage(m.chat, { text: `⚠️ Esa columna está llena, elige otra.` }, { quoted: m })

  const disc  = session.turn === session.p1 ? DISCS.p1 : DISCS.p2
  const isBot = session.p2 === session.botId

  dropDisc(session.board, col, disc)

  if (checkWin(session.board, disc)) {
    await endC4Game(sock, session, session.turn, botId)
    return
  }

  if (isBoardFull(session.board)) {
    await endC4Game(sock, session, null, botId)
    return
  }

  session.turn = session.turn === session.p1 ? session.p2 : session.p1

  await sock.sendMessage(m.chat, {
    text: buildC4Message(session),
    mentions: [session.p1, session.p2],
    edit: session.lastMsg
  })

  if (session.turn === botId) {
    await doBotTurnC4(m, sock, session, botId)
  }
}

async function doBotTurnC4(m: any, sock: any, session: any, botId: string) {
  await new Promise(r => setTimeout(r, 1200))

  const oppDisc = DISCS.p1
  const botDisc = DISCS.bot
  const col     = getBotMove(session.board, botDisc, oppDisc)

  dropDisc(session.board, col, botDisc)

  if (checkWin(session.board, botDisc)) {
    await endC4Game(sock, session, botId, botId)
    return
  }

  if (isBoardFull(session.board)) {
    await endC4Game(sock, session, null, botId)
    return
  }

  session.turn = session.p1

  await sock.sendMessage(m.chat, {
    text: `🤖 *Bot juega columna ${col + 1}*\n\n` + buildC4Message(session),
    mentions: [session.p1],
    edit: session.lastMsg
  })
}

export async function before(m: any, ctx: any) {
  await beforeC4(m, ctx)
}

async function endC4Game(sock: any, session: any, winner: string | null, botId: string) {
  const { p1, p2, scores, board, chat } = session
  const isBot   = p2 === botId
  const monedas = getSettings(botId)?.currency || 'Coins'

  const boardFinal = renderBoard(board)

  let text = `🔴🟡 *FIN DE CONECTA 4*\n\n${boardFinal}\n\n`

  if (!winner) {
    text += `🤝 *¡Empate!* Nadie gana monedas.`
  } else if (winner === p1) {
    text += `🏆 *¡@${p1.split('@')[0]} gana!*\n💰 +3000 ${monedas}`
    const wd = getChatUser(chat, p1)
    updateChatUser(chat, p1, 'coins', (wd.coins || 0) + 3000)
    if (!isBot) {
      const ld = getChatUser(chat, p2)
      updateChatUser(chat, p2, 'coins', Math.max(0, (ld.coins || 0) - 1000))
    }
  } else if (winner === botId) {
    text += `🤖 *¡El bot gana!* Mejor suerte la próxima.\n📉 -1000 ${monedas}`
    const ld = getChatUser(chat, p1)
    updateChatUser(chat, p1, 'coins', Math.max(0, (ld.coins || 0) - 1000))
  } else {
    text += `🏆 *¡@${p2.split('@')[0]} gana!*\n💰 +3000 ${monedas}`
    const wd = getChatUser(chat, p2)
    updateChatUser(chat, p2, 'coins', (wd.coins || 0) + 3000)
    const ld = getChatUser(chat, p1)
    updateChatUser(chat, p1, 'coins', Math.max(0, (ld.coins || 0) - 1000))
  }

  await sock.sendMessage(chat, {
    text,
    mentions: [p1, p2],
    edit: session.lastMsg
  })

  global._connect4Sessions.delete(session.id)
}
