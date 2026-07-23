export default {
  command: ['pescar', 'fish'],
  category: 'rpg',
  run: async ({sock, m, args, command, text, prefix}) => {
    const chat = await getChat(m.chat)
    const user = await getChatUser(m.chat, m.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const currency = botSettings.currency
   if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const remainingTime = user.lastfish - Date.now()
    if (remainingTime > 0) {
      return m.reply(`✐ Debes esperar *${msToTime(remainingTime)}* antes de volver a pescar.`)
    }

    const rand = Math.random()
    let cantidad
    let message
    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000
      user.coins += cantidad

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
      const successMessages = [
        `¡Has pescado un Salmón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Trucha! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado una Sirena! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Caballito de Mar! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Totoaba! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Tiburón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Ballena! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pez Payaso! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has atrapado una Anguila Dorada! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado un Mero Gigante! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pulpo azul! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Sacaste una Carpa Real! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has conseguido un Pez Dragón! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`
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
        `El anzuelo se enredó y perdiste parte de tu equipo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Una corriente fuerte arrastró tu caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `La policía te atrapo pescando ilegalmente, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Todo el día solo has capturado únicamente... ¡Plastico!?, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un pez grande rompió tu línea y dañó tu aparejo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu bote se golpeó contra las rocas y tuviste que reparar, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez escapó y arruinó tu red, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez mordió el anzuelo pero se soltó y dañó tu carrete, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Te robaron la cubeta lleno de peces!, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu cubeta se volcó y los peces atrapados se perdieron, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(failMessages)
    } else {
      const neutralMessages = [
        `Pasaste la tarde pescando y observando cómo los peces nadaban cerca.`,
        `Un oso estaba cerca en tu lugar de pesca, por lo que decidiste no pescar.`,
        `Yorman, Mist y Alex portaron tanta seriedad que los peces no se acercaron, saquen a esos desgraciados!.`,
        `El agua estuvo tranquila y los peces se acercaban sin morder el anzuelo.`,
        `Tu jornada de pesca fue serena, los peces nadaban alrededor sin ser atrapados.`,
        `Se te olvido llevar la caña de pescar en tu casa.`,
        `El olor a protector solar se impregnó en el anzuelo, haciendo que los peces desconfiaran.`,
        `Los peces se mostraron esquivos, pero la experiencia de pesca fue agradable.`,
        `Yorman y Alexander estuvieron jodiendo a los peces y se negaron a ser atrapados.`,
        `El río estuvo lleno de peces curiosos que se acercaban sin ser capturados.`
      ]
      message = pickRandom(neutralMessages)
    }
    user.lastfish = Date.now() + 8 * 60 * 1000

   await updateChatUser(m.chat, m.sender, 'lastfish', user.lastfish)
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
