if (!global._memorySessions) global._memorySessions = new Map()

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export const MEM_DIFFICULTIES: Record<string, { cols: number; rows: number; label: string }> = {
  facil:   { cols: 4, rows: 3, label: '4×3 (6 pares)'  },
  normal:  { cols: 4, rows: 4, label: '4×4 (8 pares)'  },
  dificil: { cols: 6, rows: 4, label: '6×4 (12 pares)' },
  extremo: { cols: 6, rows: 6, label: '6×6 (18 pares)' },
}

const EMOJI_POOL = [
  '🔥','🌊','⚡','🌸','🍀','🎯','🎲','🎸','🏆','👑',
  '💎','🌈','🦋','🐉','🍕','🚀','🌙','🎭','🦊','💡',
  '🍓','🐬','🌺','🎪','🎨','🦁','🌴','⭐','🎻','🦄',
  '🍦','🐙','🌻','🎠','🎵','🦅','🌵','💫','🎺','🐺',
]

const NUM_EMOJI: Record<number, string> = {
  1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
  6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣',
}

export function generateMemoryBoard(cols: number, rows: number): string[] {
  const pairs = cols * rows / 2
  const pool  = [...EMOJI_POOL].sort(() => Math.random() - 0.5).slice(0, pairs)
  const cards = [...pool, ...pool].sort(() => Math.random() - 0.5)
  return cards
}

export function renderMemoryBoard(session: any): string {
  const { cards, revealed, matched, cols } = session
  const rows = cards.length / cols
  const lines: string[] = []

  const header = '　 ' + Array.from({ length: cols }, (_, i) => NUM_EMOJI[i + 1] || `${i+1}`).join('')
  lines.push(header)

  for (let r = 0; r < rows; r++) {
    let line = (NUM_EMOJI[r + 1] || `${r+1}`) + ' '
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      line += (revealed[idx] || matched[idx]) ? cards[idx] : '🟦'
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export function buildMemoryMessage(session: any): string {
  const { p1, p2, turn, scores, cols, cards, difficulty, usedPrefix, botId } = session
  const rows   = cards.length / cols
  const pairs  = cards.length / 2
  const board  = renderMemoryBoard(session)
  const isBot  = p2 === botId
  const p1Tag  = `@${p1.split('@')[0]}`
  const p2Tag  = isBot ? '🤖 Bot' : `@${p2.split('@')[0]}`
  const turnTag = turn === p1 ? p1Tag : (isBot && turn === p2 ? '🤖 Bot' : `@${turn.split('@')[0]}`)

  return (
    `🧠 *MEMORIA* — ${difficulty.toUpperCase()}\n` +
    `📐 ${cols}×${rows} | ${pairs} pares\n\n` +
    `${board}\n\n` +
    `🏅 ${p1Tag}: *${scores[p1]}* pares | ${p2Tag}: *${scores[p2]}* pares\n\n` +
    `🎯 Turno de *${turnTag}*\n` +
    `Envía la coordenada (columna fila) — Ej: *24* = col 2, fila 4\n\n` +
    `> *${usedPrefix}memcancelar* — Abandonar`
  )
}

export function buildTurnNotice(session: any): { text: string; mentions: string[] } {
  const { p1, p2, turn, botId } = session
  const isBot   = p2 === botId
  const turnTag = turn === p1
    ? `@${p1.split('@')[0]}`
    : isBot && turn === p2
    ? '🤖 Bot'
    : `@${turn.split('@')[0]}`

  return {
    text: `🎯 Turno de *${turnTag}*`,
    mentions: [p1, p2],
  }
}
async function doBotTurn(m: any, sock: any, session: any, botId: string) {
  await new Promise(r => setTimeout(r, 1200))

  const { cards, matched, revealed, botMemory, cols } = session

  const available = cards
    .map((_: any, i: number) => i)
    .filter((i: number) => !matched[i] && !revealed[i])

  let pick1 = -1, pick2 = -1
  const knownPairs: Record<string, number[]> = {}
  for (const [idxStr, emoji] of Object.entries(botMemory) as [string, string][]) {
    const i = parseInt(idxStr)
    if (matched[i]) continue
    if (!knownPairs[emoji]) knownPairs[emoji] = []
    knownPairs[emoji].push(i)
  }

  for (const [, indices] of Object.entries(knownPairs)) {
    if (indices.length >= 2) {
      pick1 = indices[0]
      pick2 = indices[1]
      break
    }
  }

  if (pick1 === -1) {
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    pick1 = shuffled[0]
    pick2 = shuffled.find((i: number) =>
      i !== pick1 && !(botMemory[i] && botMemory[pick1] && botMemory[i] === botMemory[pick1] && false)
    ) ?? shuffled[1]
  }

  session.revealed[pick1] = true
  session.botMemory[pick1] = cards[pick1]
  await sock.sendMessage(m.chat, {
    text: `🤖 *Bot destapa:* col ${(pick1 % cols) + 1}, fila ${Math.floor(pick1 / cols) + 1}\n\n` +
          buildMemoryMessage(session),
    mentions: [session.p1, session.p2],
    edit: session.lastMsg
  })

  await new Promise(r => setTimeout(r, 1200))

  session.revealed[pick2] = true
  session.botMemory[pick2] = cards[pick2]
  await sock.sendMessage(m.chat, {
    text: `🤖 *Bot destapa:* col ${(pick2 % cols) + 1}, fila ${Math.floor(pick2 / cols) + 1}\n\n` +
          buildMemoryMessage(session),
    mentions: [session.p1, session.p2],
    edit: session.lastMsg
  })

  await new Promise(r => setTimeout(r, 1500))

  const isMatch = cards[pick1] === cards[pick2]

  if (isMatch) {
    session.matched[pick1] = true
    session.matched[pick2] = true
    session.revealed[pick1] = false
    session.revealed[pick2] = false
    session.scores[session.botId]++

    const totalPairs = cards.length / 2
    const foundPairs = Object.values(session.scores as Record<string, number>).reduce((a, b) => a + b, 0)

    if (foundPairs >= totalPairs) {
      await endMemoryGame(m, sock, session, botId)
      return
    }

    await sock.sendMessage(m.chat, {
      text: `🤖 *¡El bot encontró un par!* ${cards[pick1]}\n\n` + buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })

    await doBotTurn(m, sock, session, botId)

  } else {
    session.revealed[pick1] = false
    session.revealed[pick2] = false
    session.turn = session.p1

    const updatedMsg = await sock.sendMessage(m.chat, {
      text: `🤖 *El bot falló:* ${cards[pick1]} ≠ ${cards[pick2]}\n\n` + buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })
    session.lastMsg = updatedMsg?.key ?? session.lastMsg

    const notice = buildTurnNotice(session)
    await sock.sendMessage(m.chat, {
      text: notice.text,
      mentions: notice.mentions,
      quoted: { key: session.lastMsg, message: {} }
    })
  }
}

async function endMemoryGame(m: any, sock: any, session: any, botId: string) {
  const { p1, p2, scores, cards, chat } = session
  const isBot   = p2 === botId
  const s1      = scores[p1]
  const s2      = scores[p2]
  const total   = cards.length / 2

  const board   = renderMemoryBoard({ ...session, matched: Array(cards.length).fill(true), revealed: Array(cards.length).fill(false) })
  const monedas = getSettings(botId)?.currency || 'Coins'

  let winner: string | null = null
  let text = `🧠 *FIN DE LA PARTIDA*\n\n${board}\n\n`
  text += `📊 *Resultado:*\n`
  text += `› @${p1.split('@')[0]}: *${s1}/${total}* pares\n`
  text += `› ${isBot ? '🤖 Bot' : '@' + p2.split('@')[0]}: *${s2}/${total}* pares\n\n`

  if (s1 > s2) {
    winner = p1
    text += `🏆 *¡@${p1.split('@')[0]} gana!*\n💰 +5000 ${monedas}`
  } else if (s2 > s1) {
    winner = isBot ? null : p2
    text += isBot
      ? `🤖 *¡El bot gana!* Mejor suerte la próxima vez.\n📉 -1000 ${monedas}`
      : `🏆 *¡@${p2.split('@')[0]} gana!*\n💰 +5000 ${monedas}`
  } else {
    text += `🤝 *¡Empate!* Nadie gana monedas.`
  }

  if (winner) {
    const wd = getChatUser(chat, winner)
    updateChatUser(chat, winner, 'coins', (wd.coins || 0) + 5000)
  }

  if (s2 > s1 && isBot) {
    const ld = getChatUser(chat, p1)
    updateChatUser(chat, p1, 'coins', Math.max(0, (ld.coins || 0) - 1000))
  }

  if (s1 > s2 && !isBot) {
    const ld = getChatUser(chat, p2)
    updateChatUser(chat, p2, 'coins', Math.max(0, (ld.coins || 0) - 1000))
  }

  await sock.sendMessage(chat, {
    text,
    mentions: [p1, p2],
    edit: session.lastMsg
  })

  global._memorySessions.delete(session.id)
}
export default {
  command: ['memory', 'memoria', 'memcancelar', 'aceptarmem'],
  category: 'rpg',
  before: async (m: any, { sock }: any) => {
  if (!m.text || !global._memorySessions) return

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  if (m.sender === botId) return

  const session = [...global._memorySessions.values()].find(
    (s: any) => s.chat === m.chat &&
                s.state === 'PLAYING' &&
                (s.p1 === m.sender || s.p2 === m.sender)
  ) as any
  if (!session) return
  if (session.turn !== m.sender) return

  const input = m.text.trim().replace(/[^\d]/g, '')
  if (!input || input.length < 2) return

  const col = parseInt(input[0]) - 1
  const row = parseInt(input[1]) - 1
  const { cols, cards } = session
  const rows = cards.length / cols

  if (col < 0 || col >= cols || row < 0 || row >= rows) return

  const idx = row * cols + col

  if (session.matched[idx] || session.revealed[idx]) {
    await sock.sendMessage(m.chat, { text: `⚠️ Esa celda ya está destapada o emparejada.` }, { quoted: m })
    return
  }

  session.revealed[idx] = true

  if (session.p2 === session.botId) {
    session.botMemory[idx] = cards[idx]
  }

  if (session.firstPick === null) {
    session.firstPick = idx
    await sock.sendMessage(m.chat, {
      text: buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })
    return
  }

  const first  = session.firstPick
  const second = idx
  session.firstPick = null

  const isMatch = cards[first] === cards[second]

  if (isMatch) {
    session.matched[first]  = true
    session.matched[second] = true
    session.revealed[first]  = false
    session.revealed[second] = false
    session.scores[session.turn]++

    const totalPairs  = cards.length / 2
    const foundPairs  = Object.values(session.scores as Record<string, number>).reduce((a, b) => a + b, 0)

    if (foundPairs >= totalPairs) {
      await endMemoryGame(m, sock, session, botId)
      return
    }

    const updatedMsg = await sock.sendMessage(m.chat, {
      text: `✅ *¡Par encontrado!* ${cards[first]}\n\n` + buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })
    session.lastMsg = updatedMsg?.key ?? session.lastMsg

    if (session.turn === session.botId) {
      await doBotTurn(m, sock, session, botId)
    }

  } else {

    const updatedMsg = await sock.sendMessage(m.chat, {
      text: `❌ *No coinciden:* ${cards[first]} ≠ ${cards[second]}\n\n` + buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })
    session.lastMsg = updatedMsg?.key ?? session.lastMsg

    await new Promise(r => setTimeout(r, 2000))
    session.revealed[first]  = false
    session.revealed[second] = false

    session.turn = session.turn === session.p1 ? session.p2 : session.p1

    await sock.sendMessage(m.chat, {
      text: buildMemoryMessage(session),
      mentions: [session.p1, session.p2],
      edit: session.lastMsg
    })

    if (session.turn === session.botId) {
      await doBotTurn(m, sock, session, botId)
    }
  }
},
  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    sock.memoryRooms = sock.memoryRooms || {}

    const chatUser = getChatUser(chatId, sender)

    if (command === 'memcancelar') {
      const session = [...global._memorySessions.values()].find(
        s => s.chat === chatId && (s.p1 === sender || s.p2 === sender)
      )
      if (!session) return m.reply(`⚠️ No tienes ninguna partida en curso.`)

      global._memorySessions.delete(session.id)
      return sock.sendMessage(chatId, {
        text: `🚫 @${sender.split('@')[0]} abandonó la partida.`,
        mentions: [sender]
      })
    }

    if (command === 'aceptarmem') {
      const session = [...global._memorySessions.values()].find(
        s => s.chat === chatId && s.p2 === sender && s.state === 'WAITING'
      )
      if (!session) return m.reply(`❌ No tienes ningún reto pendiente.`)

      clearTimeout(session.timeout)
      session.state = 'PLAYING'

      const msg = await sock.sendMessage(chatId, {
        text: buildMemoryMessage(session),
        mentions: [session.p1, session.p2]
      })
      session.lastMsg = msg.key
      global._memorySessions.set(session.id, session)
      return
    }

    const inGame = [...global._memorySessions.values()].find(
      s => s.chat === chatId && (s.p1 === sender || s.p2 === sender)
    )
    if (inGame)
      return m.reply(
        `⚠️ Ya tienes una partida en curso.\n` +
        `Envía coordenadas o *${usedPrefix}memcancelar* para abandonar.`
      )

    const remaining = (chatUser.memoryCooldown || 0) - Date.now()
    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    const parts    = (text || '').trim().toLowerCase().split(/\s+/)
    const diffArg  = parts.find((p: string) => p in MEM_DIFFICULTIES) || 'normal'
    const { cols, rows } = MEM_DIFFICULTIES[diffArg]

    let opponent = m.mentionedJid?.[0] || m.quoted?.sender || null
    if (!opponent || opponent === sender) opponent = botId

    if (opponent !== botId) {
      const opBusy = [...global._memorySessions.values()].find(
        s => s.chat === chatId && (s.p1 === opponent || s.p2 === opponent)
      )
      if (opBusy) return m.reply(`❌ Ese usuario ya está en una partida.`)
    }

    updateChatUser(chatId, sender, 'memoryCooldown', Date.now() + 10 * 60000)

    const cards   = generateMemoryBoard(cols, rows)
    const id      = `mem-${Date.now()}`
    const session: any = {
      id,
      chat:     chatId,
      p1:       sender,
      p2:       opponent,
      botId,
      turn:     sender,
      state:    opponent === botId ? 'PLAYING' : 'WAITING',
      difficulty: diffArg,
      cols,
      cards,
      revealed:   Array(cards.length).fill(false),
      matched:    Array(cards.length).fill(false),
      scores:     { [sender]: 0, [opponent]: 0 },
      firstPick:  null,
      usedPrefix,
      lastMsg:    null,
      botMemory:  {},
      timeout:    null,
    }

    global._memorySessions.set(id, session)

    if (opponent === botId) {
      const msg = await sock.sendMessage(chatId, {
        text: buildMemoryMessage(session),
        mentions: [sender]
      }, { quoted: m })
      session.lastMsg = msg.key
    } else {
      session.timeout = setTimeout(() => {
        if (global._memorySessions.has(id)) {
          global._memorySessions.delete(id)
          sock.sendMessage(chatId, {
            text: `⏰ El reto de @${sender.split('@')[0]} a @${opponent.split('@')[0]} expiró sin respuesta.`,
            mentions: [sender, opponent]
          })
        }
      }, 60000)

      await sock.sendMessage(chatId, {
        text:
          `🧠 *¡RETO DE MEMORIA!*\n\n` +
          `🎯 @${sender.split('@')[0]} reta a @${opponent.split('@')[0]}\n` +
          `📐 Dificultad: *${diffArg.toUpperCase()}* — ${MEM_DIFFICULTIES[diffArg].label}\n\n` +
          `@${opponent.split('@')[0]}, tienes *1 minuto* para responder.\n\n` +
          `> *${usedPrefix}aceptarmem* para Aceptar`,
        mentions: [sender, opponent],
        buttons: [{
          buttonId: `${usedPrefix}aceptarmem`,
          buttonText: { displayText: 'Aceptar Reto' },
          type: 1
        }]
      }, { quoted: m })
    }
  }
}
