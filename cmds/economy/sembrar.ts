export default {
  command: ['plantar', 'sembrar'],
  category: 'rpg',
  run: async ({sock, m, args, command, text, prefix}) => {
    const chat = await getChat(m.chat)
    const user = await getChatUser(m.chat, m.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const currency = botSettings.currency
   if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const remainingTime = user.lastplant - Date.now()
    if (remainingTime > 0) {
      return m.reply(`🌱 Debes esperar *${msToTime(remainingTime)}* antes de volver a sembrar.`)
    }

    const rand = Math.random()
    let cantidad
    let message
    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000
      user.coins += cantidad

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
const successMessages = [
  `¡Tus tomates crecieron enormes! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡La cosecha de zanahorias fue un éxito! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Tus fresas dieron abundantes frutos! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡La plantación de maíz produjo una excelente cosecha! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Tus sandías crecieron gigantes! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Las papas salieron de excelente calidad! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Tu huerto de lechugas prosperó! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Las calabazas crecieron enormes! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Tus árboles frutales dieron una gran cosecha! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Los pimientos crecieron saludables! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Una lluvia perfecta hizo florecer toda tu granja! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡La tierra fue muy fértil y obtuviste una excelente cosecha! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Tus plantas crecieron fuertes y saludables! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Vendiste toda tu cosecha en el mercado! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
  `¡Los vecinos compraron todas tus verduras! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`
]
      message = pickRandom(successMessages)
    } else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (6500 - 5000 + 1)) + 5000
      const total = user.coins + user.bank
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad
   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
        } else {
          const restante = cantidad - user.coins
          user.coins = 0
          user.bank -= restante
   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
   await updateChatUser(m.chat, m.sender, 'bank', user.bank)
        }
      } else {
        cantidad = total
        user.coins = 0
        user.bank = 0

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
   await updateChatUser(m.chat, m.sender, 'bank', user.bank)
      }
const failMessages = [
  `Una plaga de insectos destruyó tu cultivo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Una fuerte sequía acabó con tus plantas, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Una tormenta arrasó con toda tu cosecha, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Olvidaste regar las plantas y terminaron secándose, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Los pájaros se comieron todas las semillas, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Una helada inesperada mató tus cultivos, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Un hongo infectó tus plantas y hubo que destruirlas, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `El exceso de lluvia pudrió las raíces de tus cultivos, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Un rebaño de vacas invadió tu huerto y arrasó con todo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Compraste semillas de mala calidad y nunca germinaron, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Los conejos devoraron tus cultivos durante la noche, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
  `Las malas hierbas invadieron el terreno y echaron a perder la cosecha, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
]
      message = pickRandom(failMessages)
    } else {
const neutralMessages = [
  `Sembraste las semillas y ahora solo queda esperar a que crezcan.`,
  `Regaste cuidadosamente el cultivo. Todo parece ir bien por ahora.`,
  `Las plantas apenas comenzaron a brotar.`,
  `El clima estuvo agradable y tus cultivos siguen creciendo.`,
  `Pasaste el día quitando malas hierbas del huerto.`,
  `Hoy solo preparaste la tierra para futuras cosechas.`,
  `Tus plantas aún son pequeñas y necesitan más tiempo.`,
  `Fertilizar el suelo tomó todo el día, no hubo cosecha todavía.`,
  `El espantapájaros hizo bien su trabajo y protegió el cultivo.`,
  `Observaste algunos brotes verdes. La cosecha promete, pero todavía falta.`,
  `Plantaste nuevas semillas y esperas que den buenos frutos.`,
  `La tierra quedó perfectamente preparada para el próximo crecimiento.`
]
      message = pickRandom(neutralMessages)
    }
    user.lastplant = Date.now() + 8 * 60 * 1000

   await updateChatUser(m.chat, m.sender, 'lastplant', user.lastplant)
   await sock.sendMessage(m.chat, { text: `「✿」 ${message}` }, { quoted: m })
  }
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const min = minutes < 10 ? '0' + minutes : minutes
  const sec = seconds < 10 ? '0' + seconds : seconds
  return min === '00' ? `${sec} segundo${sec > 1 ? 's' : ''}` : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}