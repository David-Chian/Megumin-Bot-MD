const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function msToTime(duration: number) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  const m = minutes < 10 ? '0' + minutes : String(minutes)
  const s = seconds < 10 ? '0' + seconds : String(seconds)
  if (m === '00') return `${s} segundo${seconds > 1 ? 's' : ''}`
  return `${m} minuto${minutes > 1 ? 's' : ''}, ${s} segundo${seconds > 1 ? 's' : ''}`
}

const ROWS        = 8
const MULTIPLIERS = [5.6, 2.1, 1.1, 0.5, 0.3, 0.5, 1.1, 2.1, 5.6]

function simulatePath() {
  const path = [0]
  let pos = 0
  for (let row = 0; row < ROWS; row++) {
    pos += Math.random() < 0.5 ? 0 : 1
    path.push(pos)
  }
  return path
}

function buildBoard(ballPath: number[], currentRow: number, finalSlot: number) {
  const lines: string[] = []

  for (let row = 0; row <= ROWS; row++) {
    const pegs   = row + 1
    const spaces = ROWS - row
    let line     = ' '.repeat(spaces)

    for (let peg = 0; peg < pegs; peg++) {
      const isBall = row === currentRow && ballPath[row] === peg
      line += isBall ? '🔵' : '⚪'
      if (peg < pegs - 1) line += ' '
    }

    lines.push(line)
  }

  lines.push('')

  const slotLine = MULTIPLIERS.map((val, i) =>
    currentRow === ROWS && i === finalSlot ? `[${val}x]` : ` ${val}x `
  ).join('')

  lines.push(slotLine)
  return lines.join('\n')
}

export default {
  command: ['plinko'],
  category: 'game',

  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const user      = getChatUser(chatId, m.sender)
    const remaining = (user.plinkoCooldown || 0) - Date.now()

    if (remaining > 0)
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`)

    const amount = parseInt(text)

    if (isNaN(amount) || amount < 100)
      return m.reply(`🎯 *Uso:* ${usedPrefix + command} <apuesta>\n⚠️ Mínimo *100* ${monedas}.`)

    if (amount > 5000)
      return m.reply(`🚀 *Uso:* ${usedPrefix + command} <apuesta>\n⚠️ Máximo *5000* ${monedas}.`)

    if ((user.coins || 0) < amount)
      return m.reply(`❌ No tienes suficientes ${monedas}. Saldo: *${user.coins || 0}*`)

    updateChatUser(chatId, m.sender, 'coins',          (user.coins || 0) - amount)
    updateChatUser(chatId, m.sender, 'plinkoCooldown',  Date.now() + 30 * 60000)

    const ballPath   = simulatePath()
    const finalSlot  = ballPath[ROWS]
    const multiplier = MULTIPLIERS[finalSlot]
    const prize      = Math.floor(amount * multiplier)

    const { key } = await sock.sendMessage(
      chatId,
      { text: `🎯 *PLINKO*\n\n${buildBoard(ballPath, 0, finalSlot)}\n\n💰 Apuesta: ${amount} ${monedas}` },
      { quoted: m }
    )

    for (let row = 1; row <= ROWS; row++) {
      await delay(500)
      await sock.sendMessage(chatId, {
        text: `🎯 *PLINKO*\n\n${buildBoard(ballPath, row, finalSlot)}\n\n💰 Apuesta: ${amount} ${monedas}`,
        edit: key
      })
    }

    await delay(600)

    const freshUser = getChatUser(chatId, m.sender)
    const newCoins  = (freshUser.coins || 0) + prize
    updateChatUser(chatId, m.sender, 'coins', newCoins)

    let resultLine: string
    if (multiplier === 0.3 || multiplier === 0.5) {
      resultLine = `💥 *${multiplier}x — Perdiste ${amount - prize} ${monedas}*`
    } else if (prize === amount) {
      resultLine = `➡️ *${multiplier}x — Devuelto*`
    } else {
      resultLine = `✅ *${multiplier}x — Ganaste +${prize - amount} ${monedas}!*`
    }

    await sock.sendMessage(chatId, {
      text:
        `🎯 *PLINKO*\n\n${buildBoard(ballPath, ROWS, finalSlot)}\n\n` +
        `${resultLine}\n` +
        `💰 Recibiste: ${prize} ${monedas}\n` +
        `Saldo: ${newCoins} ${monedas}`,
      edit: key
    })
  }
}