function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

function determineWinner(userChoice: string, botChoice: string) {
  if (userChoice === botChoice) return 'tie'
  if (
    (userChoice === 'piedra' && botChoice === 'tijera') ||
    (userChoice === 'papel'  && botChoice === 'piedra') ||
    (userChoice === 'tijera' && botChoice === 'papel')
  ) return 'win'
  return 'lose'
}

function deductCoins(user: any, amount: number) {
  if (user.coins >= amount) {
    user.coins -= amount
    return amount
  }
  const fromCoins = user.coins
  let remainder   = amount - fromCoins
  user.coins      = 0

  if (user.bank >= remainder) {
    user.bank -= remainder
    return amount
  }

  const fromBank = user.bank
  user.bank      = 0
  return fromCoins + fromBank
}

const OPTIONS = ['piedra', 'papel', 'tijera']

export default {
  command: ['ppt'],
  category: 'rpg',

  run: async ({ sock, m, text, usedPrefix, command }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Coins'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const chatUser  = getChatUser(chatId, sender)
    const user      = getUser(sender)
    const remaining = (chatUser.pptCooldown || 0) - Date.now()

    if (remaining > 0)
      return m.reply(`✿ Debes esperar *${msToTime(remaining)}* antes de jugar nuevamente.`)

    if (!text?.trim())
      return m.reply(`✿ Uso correcto: *${usedPrefix}${command} <piedra|papel|tijera>*`)

    const userChoice = text.trim().toLowerCase()
    if (!OPTIONS.includes(userChoice))
      return m.reply(`✿ Uso correcto: *${usedPrefix}${command} <piedra|papel|tijera>*`)

    const botChoice = OPTIONS[Math.floor(Math.random() * OPTIONS.length)]
    const result    = determineWinner(userChoice, botChoice)

    let replyText: string

    if (result === 'win') {
      const reward = Math.floor(Math.random() * 3000)
      const exp    = Math.floor(Math.random() * 1000)
      updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + reward)
      updateUser(sender, 'exp', (user.exp || 0) + exp)
      replyText =
        `✧ Ganaste.\n\n` +
        `> ✿ *Tu elección ›* ${userChoice}\n` +
        `> ❀ *Elección del bot ›* ${botChoice}\n` +
        `> ✰ *${monedas} ›* +¥${reward.toLocaleString()}\n` +
        `> ✱ *Exp ›* +${exp}`

    } else if (result === 'lose') {
      const loss     = Math.floor(Math.random() * 1000)
      const deducted = deductCoins(chatUser, loss)
      updateChatUser(chatId, sender, 'coins', chatUser.coins)
      updateChatUser(chatId, sender, 'bank',  chatUser.bank)
      replyText =
        `✿ Perdiste.\n\n` +
        `> ✿ *Tu elección ›* ${userChoice}\n` +
        `> ❀ *Elección del bot ›* ${botChoice}\n` +
        `> ✰ *${monedas} ›* -¥${deducted.toLocaleString()}`

    } else {
      const reward = Math.floor(Math.random() * 100)
      const exp    = Math.floor(Math.random() * 100)
      updateChatUser(chatId, sender, 'coins', (chatUser.coins || 0) + reward)
      updateUser(sender, 'exp', (user.exp || 0) + exp)
      replyText =
        `❀ Empate.\n\n` +
        `> ✿ *Tu elección ›* ${userChoice}\n` +
        `> ❀ *Elección del bot ›* ${botChoice}\n` +
        `> ✰ *${monedas} ›* +¥${reward.toLocaleString()}\n` +
        `> ✱ *Exp ›* +${exp}`
    }

    updateChatUser(chatId, sender, 'pptCooldown', Date.now() + 10 * 60000)
    return m.reply(replyText)
  }
}