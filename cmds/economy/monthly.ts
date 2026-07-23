function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration: number) {
  const days    = Math.floor(duration / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const seconds = Math.floor((duration / 1000) % 60)
  const pad     = (n: number) => n.toString().padStart(2, '0')
  return `${pad(days)} d ${pad(hours)} h ${pad(minutes)} m y ${pad(seconds)} s`
}

export default {
  command: ['monthly', 'mensual'],
  category: 'rpg',

  run: async ({ sock, m }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const chatUser = getChatUser(chatId, sender)
    const user     = getUser(sender)
    const COOLDOWN = 30 * 24 * 60 * 60 * 1000
    const elapsed  = Date.now() - (chatUser.lastMonthly || 0)

    if (elapsed < COOLDOWN)
      return sock.reply(m.chat,`✎ Debes esperar ${msToTime(COOLDOWN - elapsed)} para volver a reclamar tu recompensa mensual.`,m,m.rcanal)

    const coins = pickRandom([500000, 550000, 600000])
    const exp   = Math.floor(Math.random() * 5000)

    updateChatUser(chatId, sender, 'lastMonthly', Date.now())
    updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + coins)
    updateUser(sender, 'exp', (user.exp || 0) + exp)

    return sock.reply(m.chat,
      `☆ ໌　۟　𝖱𝖾𝖼𝗈𝗆𝗉𝖾𝗇𝗌𝖺　ׅ　팅화　ׄ\n\n` +
      `> ✿ *Exp ›* ${exp}\n` +
      `> ⛁ *${monedas} ›* ${coins}`,m,m.rcanal
    )
  }
}
