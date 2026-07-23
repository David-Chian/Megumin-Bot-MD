export default {
  command: ['mine'],
  category: 'rpg',
  run: async ({sock, m, args, command, text, prefix}) => {
    const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botSettings = await getSettings(botId)
    const monedas = botSettings?.currency || 'Coins'
    const chat = await getChat(m.chat)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)
    const user = await getChatUser(m.chat, m.sender)
    const now = Date.now()
    if (user.mineCooldown > now) {
      const remaining = user.mineCooldown - now
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para minar de nuevo.`)
    }
    const isLegendary = Math.random() < 0.02
    let reward,
      narration,
      bonusMsg = ''
    if (isLegendary) {
      reward = Math.floor(Math.random() * 50000) + 50000
      narration = '¡DESCUBRISTE UN TESORO LEGENDARIO!\n\n'
      bonusMsg = '\nꕥ Recompensa ÉPICA obtenida!'
    } else {
      reward = Math.floor(Math.random() * 5000) + 500
      const scenario = pickRandom(escenarios)
      narration = `En ${scenario}, ${pickRandom(mineria)}`
      if (Math.random() < 0.1) {
        const bonus = Math.floor(Math.random() * 3000) + 500
        reward += bonus
        bonusMsg = `\n✿ ¡Bonus de aventura! Ganaste *${bonus.toLocaleString()}* ${monedas} extra`
      }
    }
    user.coins += reward
    user.mineCooldown = now + 10 * 60000    
    await updateChatUser(m.chat, m.sender, 'coins', user.coins)
    await updateChatUser(m.chat, m.sender, 'mineCooldown', user.mineCooldown)
    let msg = `「✿」 ${narration} *${reward.toLocaleString()} ${monedas}*`
    if (bonusMsg) msg += `\n${bonusMsg}`
    await sock.reply(m.chat, msg, m, m.rcanal)
  },
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const escenarios = [
  'una cueva oscura y húmeda',
  'la cima de una montaña nevada',
  'un bosque misterioso lleno de raíces',
  'un río cristalino y caudaloso',
  'una mina abandonada de carbón',
  'las ruinas de un antiguo castillo',
  'una playa desierta con arena dorada',
  'un valle escondido entre colinas',
  'un arbusto espinoso al borde del camino',
  'un tronco hueco en medio del bosque',
]

const mineria = [
  'encontraste un antiguo cofre con',
  'hallaste una bolsa llena de',
  'descubriste un saco de',
  'desenterraste monedas antiguas que contienen',
  'rompiste una roca y adentro estaba',
  'cavando profundo, hallaste',
  'entre las raíces, encontraste',
  'dentro de una caja olvidada, hallaste',
  'bajo unas piedras, descubriste',
  'entre los escombros de un lugar viejo, encontraste',
]
