
const pickRandom = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

const msToTime = (duration: number) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours   = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days    = Math.floor(duration / (1000 * 60 * 60 * 24))
  const pad     = (n: number) => n.toString().padStart(2, '0')
  return `${days} d y ${pad(hours)} h ${pad(minutes)} m y ${pad(seconds)} s`
}

export default {
  command: ['weekly', 'semanal'],
  category: 'rpg',

  run: async ({ sock, m }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatData    = getChat(chatId)
    const botSettings = getSettings(botId)
    const currency    = botSettings?.currency || 'Monedas'

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const chatUser = getChatUser(chatId, sender)
    const user     = getUser(sender)

    const cooldown  = 7 * 24 * 60 * 60 * 1000
    const lastClaim = chatUser.lastWeekly || 0
    const elapsed   = Date.now() - lastClaim

    if (elapsed < cooldown)
      return sock.sendMessage(chatId, {
        text: `ꕥ Debes esperar *${msToTime(cooldown - elapsed)}* para volver a reclamar tu recompensa semanal.`
      }, { quoted: m })

    const coins = pickRandom([100000, 125000, 150000, 175000, 200000])
    const exp   = Math.floor(Math.random() * 1000)

    updateChatUser(chatId, sender, 'lastWeekly', Date.now())
    updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + coins)
    updateUser(sender, 'exp', (user.exp || 0) + exp)

    return sock.sendMessage(chatId, {
      text: `☆ ໌　۟　𝖱𝖾𝖼𝗈𝗆𝗉𝖾𝗇𝗌𝖺　ׅ　팅화　ׄ\n\n> ✩ *Exp ›* ${exp}\n> ⛁ *${currency} ›* ${coins.toLocaleString()}`,
      mentions: [sender]
    }, { quoted: m })
  }
}