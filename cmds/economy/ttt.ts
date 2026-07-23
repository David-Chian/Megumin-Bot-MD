function solveAI(board, aiSymbol) {
  const userSymbol = aiSymbol === 'X' ? 'O' : 'X'
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

  for (const line of winLines) {
    const check = line.map(i => board[i])
    if (check.filter(v => v === aiSymbol).length === 2 && check.filter(v => typeof v === 'number').length === 1)
      return line[check.findIndex(v => typeof v === 'number')]
  }

  for (const line of winLines) {
    const check = line.map(i => board[i])
    if (check.filter(v => v === userSymbol).length === 2 && check.filter(v => typeof v === 'number').length === 1)
      return line[check.findIndex(v => typeof v === 'number')]
  }

  if (typeof board[4] === 'number') return 4

  const available = board.map((v, i) => typeof v === 'number' ? i : -1).filter(i => i !== -1)
  return available[Math.floor(Math.random() * available.length)]
}

async function handleEndGame(m, sock, room, id, botId, currency) {
  const win = checkWinner(room.board)
  const tie = !win && room.board.every(v => typeof v !== 'number')

  if (!win && !tie) return false

  let msg = ''

  if (tie) {
    msg = `🤝 *¡Es un empate!* No hay ganadores.\n\n${renderBoard(room.board)}`
  } else {
    const winner = room.turn
    const loser = winner === room.p1 ? room.p2 : room.p1
    const isBotWinner = winner === botId

    if (isBotWinner) {
      msg = `🤖 *¡He ganado yo!* Mejor suerte la próxima vez.\n\n${renderBoard(room.board)}\n📉 @${loser.split('@')[0]} perdió 1000 ${currency}.`
    } else {
      msg = `🎉 *¡@${winner.split('@')[0]} ha ganado!*\n\n${renderBoard(room.board)}\n💰 Recompensa: +5000 ${currency}.`
    }

    if (!isBotWinner) {
      const winnerData = getChatUser(m.chat, winner)
      updateChatUser(m.chat, winner, 'coins', (winnerData.coins || 0) + 5000)
    }

    if (loser !== botId) {
      const loserData = getChatUser(m.chat, loser)
      updateChatUser(m.chat, loser, 'coins', Math.max(0, (loserData.coins || 0) - 1000))
    }
  }

  await sock.sendMessage(m.chat, {
    text: msg,
    mentions: [room.p1, room.p2],
    edit: room.lastMsg
  })

  delete sock.game[id]
  return true
}

function checkWinner(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  return lines.some(([a, b_idx, c]) => b[a] && b[a] === b[b_idx] && b[a] === b[c])
}

export default {
  command: ['tictactoe', 'ttt', 'treneraya'],
  category: 'game',
before: async (m: any, { sock }: any) => {
  if (!m.text) return

  sock.game = sock.game || {}

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (m.sender === botId) return

  const chatData = getChat(m.chat)
  const primaryBotId = chatData?.primaryBot
  if (primaryBotId && primaryBotId !== botId) return

  const room = Object.values(sock.game).find(r =>
    r.state === 'PLAYING' && [r.p1, r.p2].includes(m.sender)
  )

  if (!room || m.sender !== room.turn) return

  const emojiMap = {
    '1️⃣':'1','2️⃣':'2','3️⃣':'3',
    '4️⃣':'4','5️⃣':'5','6️⃣':'6',
    '7️⃣':'7','8️⃣':'8','9️⃣':'9'
  }

  let input = emojiMap[m.text.trim()] || m.text.trim()
  input = input.replace(/[^\d]/g, '')
  if (!input || isNaN(Number(input))) return

  const pos = parseInt(input) - 1
  if (pos < 0 || pos > 8 || typeof room.board[pos] !== 'number') return

  if (room.timeout) clearTimeout(room.timeout)
  room.lastActivity = Date.now()

  const currency = getSettings(botId)?.currency || 'Coins'

  room.board[pos] = room.turn === room.p1 ? 'X' : 'O'

  if (await handleEndGame(m, sock, room, room.id, botId, currency)) return

  room.turn = room.turn === room.p1 ? room.p2 : room.p1

  if (room.turn === botId) {
    const aiSymbol = room.p1 === botId ? 'X' : 'O'
    const aiPos = solveAI(room.board, aiSymbol)
    room.board[aiPos] = aiSymbol

    if (await handleEndGame(m, sock, room, room.id, botId, currency)) return

    room.turn = room.turn === room.p1 ? room.p2 : room.p1
  }

  room.timeout = setTimeout(() => {
    if (sock.game[room.id]) {
      sock.sendMessage(m.chat, {
        text: `⏰ ¡Tiempo agotado! El juego fue cancelado por inactividad de @${room.turn.split('@')[0]}`,
        mentions: [room.turn]
      })
      delete sock.game[room.id]
    }
  }, 120000)

  await sock.sendMessage(m.chat, {
    text: `Turno de @${room.turn.split('@')[0]}\n\n${renderBoard(room.board)}`,
    mentions: [room.turn],
    edit: room.lastMsg
  })
},

  run: async ({ sock, m, text, usedPrefix }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatData = getChat(m.chat)
    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    sock.game = sock.game || {}

    if (text === 'aceptar') {
      let room = Object.values(sock.game).find(r => r.state === 'WAITING' && r.p2 === m.sender)
      if (!room) return m.reply('No tienes ningún reto pendiente.')

      clearTimeout(room.timeout)
      room.state = 'PLAYING'
      room.lastActivity = Date.now()

      room.timeout = setTimeout(() => {
        if (sock.game[room.id]) {
          sock.sendMessage(m.chat, {
            text: `⏰ El juego entre @${room.p1.split('@')[0]} y @${room.p2.split('@')[0]} fue cancelado por inactividad.`,
            mentions: [room.p1, room.p2]
          })
          delete sock.game[room.id]
        }
      }, 120000)

      const msg = await sock.sendMessage(m.chat, {
        text: `🎮 *¡Juego iniciado!*\n\nTurno de @${room.turn.split('@')[0]}\n\n${renderBoard(room.board)}`,
        mentions: [room.turn]
      })
      room.lastMsg = msg.key
      return
    }

    const user = getChatUser(m.chat, m.sender)
    const remaining = (user.tttCooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    let opponent = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!opponent || opponent === m.sender) opponent = botId

    const humanRooms = Object.values(sock.game).filter(r =>
      r.p1 !== botId && r.p2 !== botId
    )

    const p1Busy = humanRooms.find(r => r.p1 === m.sender || r.p2 === m.sender)
    const p2Busy = opponent !== botId && humanRooms.find(r => r.p1 === opponent || r.p2 === opponent)

    if (p1Busy) return m.reply('Tú ya estás en una partida o tienes un reto pendiente.')
    if (p2Busy) return m.reply(`@${opponent.split('@')[0]} ya está ocupado en otra partida.`)

    const id = 'tictactoe-' + Date.now()
    sock.game[id] = {
      id,
      p1: m.sender,
      p2: opponent,
      board: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      state: opponent === botId ? 'PLAYING' : 'WAITING',
      turn: m.sender,
      lastMsg: null,
      lastActivity: Date.now()
    }

    updateChatUser(m.chat, m.sender, 'tttCooldown', Date.now() + 5 * 60000)

    if (opponent === botId) {
      const msg = await sock.sendMessage(m.chat, {
        text: `🕹️ *Juego contra el Bot*\n\nTurno de @${m.sender.split('@')[0]}\n\n${renderBoard(sock.game[id].board)}`,
        mentions: [m.sender]
      }, { quoted: m })
      sock.game[id].lastMsg = msg.key
    } else {
      sock.game[id].timeout = setTimeout(() => {
        if (sock.game[id] && sock.game[id].state === 'WAITING') {
          sock.sendMessage(m.chat, {
            text: `Reto cancelado: @${opponent.split('@')[0]} no respondió a tiempo.`,
            mentions: [opponent]
          })
          delete sock.game[id]
        }
      }, 60000)

      const str = `⚔️ @${m.sender.split('@')[0]} ha retado a @${opponent.split('@')[0]}\nPresiona el botón para aceptar.`.trim()
      sock.sendMessage(m.chat, {
        text: str,
        mentions: [m.sender, opponent],
        buttons: [{
          buttonId: `${usedPrefix}ttt aceptar`,
          buttonText: { displayText: 'Aceptar Reto' },
          type: 1
        }]
      }, { quoted: m })
    }
  }
}

function renderBoard(board) {
  const emojiNums = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']
  const res = board.map((v, i) =>
    v === 'X' ? '❌' : v === 'O' ? '⭕' : emojiNums[i]
  )
  return `${res[0]} ${res[1]} ${res[2]}\n${res[3]} ${res[4]} ${res[5]}\n${res[6]} ${res[7]} ${res[8]}`
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}