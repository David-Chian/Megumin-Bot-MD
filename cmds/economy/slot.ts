import { delay } from "@whiskeysockets/baileys"

export default {
  command: ['slot'],
  category: 'rpg',

  run: async ({ sock, m, args, command, text, prefix }) => {
    const chat = await getChat(m.chat)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = await getSettings(botId)
    const currency = bot.currency
    const user = await getChatUser(m.chat, m.sender)

    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const remainingTime = user.lastslot - Date.now()
    if (remainingTime > 0) {
      return sock.reply(m.chat, `ꕥ Debes esperar *${formatTime(remainingTime)}* antes de volver a jugar.`, m)
    }

    if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
      return m.reply(`《✤》 Por favor, ingresa la cantidad que deseas apostar.`)
    }

    const apuesta = parseInt(args[0])

    if (apuesta < 500) {
      return m.reply(`《✤》 El mínimo para apostar es de 500 *${currency}*.`)
    }

    if (user.coins < apuesta) {
      return m.reply(`「✿」 Tus *${currency}* no son suficientes para apostar esa cantidad.`)
    }

    user.coins -= apuesta
    await updateChatUser(m.chat, m.sender, 'coins', user.coins)

    const emojis = ['🍒', '🦕', '🍉']

    const getRandomEmojis = () => {
      const x = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const y = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      const z = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)])
      return { x, y, z }
    }

    const initialText = 'ꕤ | *SLOTS* \n────────\n'
    let { key } = await sock.sendMessage(m.chat, { text: initialText }, { quoted: m })

    const animateSlots = async () => {
      for (let i = 0; i < 5; i++) {
        const { x, y, z } = getRandomEmojis()

        const animationText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────`

        await sock.sendMessage(m.chat, { text: animationText, edit: key }, { quoted: m })
        await delay(300)
      }
    }

    await animateSlots()

    const { x, y, z } = getRandomEmojis()
    let resultado

    if (x[0] === y[0] && y[0] === z[0]) {
      const premio = apuesta * 2
      resultado = `「✿」 Ganaste! *¥${premio.toLocaleString()} ${currency}*.`
      user.coins += premio

      await updateChatUser(m.chat, m.sender, 'coins', user.coins)
    } else if (x[0] === y[0] || x[0] === z[0] || y[0] === z[0]) {
      const premio = 10
      resultado = `「✎」 Casi lo logras. *Toma ¥${premio.toLocaleString()} ${currency}* por intentarlo.`
      user.coins += premio

      await updateChatUser(m.chat, m.sender, 'coins', user.coins)
    } else {
      resultado = `「✿」 Perdiste *¥${apuesta.toLocaleString()} ${currency}*.`

      await updateChatUser(m.chat, m.sender, 'coins', user.coins)
    }

    user.lastslot = Date.now() + 10 * 60 * 1000
    await updateChatUser(m.chat, m.sender, 'lastslot', user.lastslot)

    const finalText = `ꕤ | *SLOTS* 
────────
${x[0]} : ${y[0]} : ${z[0]}
${x[1]} : ${y[1]} : ${z[1]}
${x[2]} : ${y[2]} : ${z[2]}
────────
${resultado}`

    await sock.sendMessage(m.chat, { text: finalText, edit: key }, { quoted: m })
  }
}

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const parts = []

  if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`)
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`)

  return parts.join(' ')
}