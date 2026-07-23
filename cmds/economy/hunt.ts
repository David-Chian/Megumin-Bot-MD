export default {
  command: ['cazar', 'hunt'],
  category: 'rpg',
    run: async ({sock, m, args, command, text, prefix}) => {
    const chat = await getChat(m.chat)
    const user = await getChatUser(m.chat, m.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const currency = botSettings.currency
    if (chat.adminonly || !chat.rpg)
     return m.reply(mess.comandooff)        

    if (user.coins == null) user.coins = 0
    if (Date.now() < user.lasthunt) {
      const restante = user.lasthunt - Date.now()
      return m.reply(`✿ Debes esperar *${msToTime(restante)}* antes de volver a cazar.`)
    }        
    const rand = Math.random()
    let cantidad = 0
    let message    
    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (13000 - 10000 + 1)) + 10000
      user.coins += cantidad

   await updateChatUser(m.chat, m.sender, 'coins', user.coins)
      const successMessages = [
        `¡Con gran valentía, lograste cazar un Oso con tu Arco! Ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Tigre feroz con tu Arco! Tras una persecución electrizante, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Lograste cazar un Elefante con astucia y persistencia usando tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Panda con tu Arco! La caza fue tranquila, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Cazaste un Jabalí tras un rastreo emocionante con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Con gran destreza, atrapaste un Cocodrilo con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `¡Has cazado un Ciervo robusto con tu Arco! Ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Con paciencia lograste cazar un Zorro plateado con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Localizaste un grupo de peces en el río y atrapaste varios con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Te internaste en la niebla del bosque y cazaste un jabalí salvaje con tu Arco, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(successMessages)
    } else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000
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
        `Tu presa se escapó y no lograste cazar nada con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tropezaste mientras apuntabas con tu Arco y la presa huyó, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un rugido te distrajo y no lograste dar en el blanco con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu Arco se rompió justo en el momento crucial, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un aguacero repentino arruinó tu ruta de caza con tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un jabalí te embistió y tuviste que huir perdiendo el control de tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un tigre te sorprendió y escapaste con pérdidas dañando tu Arco, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(failMessages)
    } else {
      const neutralMessages = [
        `Pasaste la tarde cazando con tu Arco y observando cómo los animales se movían en silencio.`,
        `El bosque estuvo tranquilo y los animales se mostraron esquivos a tu Arco.`,
        `Tu jornada de caza fue serena con tu Arco, los animales se acercaban sin ser atrapados.`,
        `Los animales se mostraron cautelosos ante tu Arco, pero la experiencia de caza fue agradable.`,
        `Exploraste nuevas rutas de caza con tu Arco y descubriste huellas frescas.`
      ]
      message = pickRandom(neutralMessages)
    }
    user.lasthunt = Date.now() + 15 * 60 * 1000

   await updateChatUser(m.chat, m.sender, 'lasthunt', user.lasthunt)
    await sock.sendMessage(m.chat, { text: `「✿」 ${message}` }, { quoted: m })
  },
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
