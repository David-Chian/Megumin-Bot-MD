export default {
  command: ['dungeon', 'mazmorra'],
  category: 'rpg',
    run: async ({sock, m, args, command, text, prefix}) => {
    const chat = await getChat(m.chat)
    const user = await getChatUser(m.chat, m.sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const currency = botSettings.currency
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)    
      if (Date.now() < user.lastdungeon) {
      const restante = user.lastdungeon - Date.now()
      return m.reply(`✎ Debes esperar *${msToTime(restante)}* antes de volver a la mazmorra.`)
      }           
    const rand = Math.random()
    let cantidad = 0
    let salud = Math.floor(Math.random() * (15 - 1 + 1)) + 1
    let message
if (rand < 0.4) {
  cantidad = Math.floor(Math.random() * (15000 - 12000 + 1)) + 12000
  await updateChatUser(m.chat, m.sender, 'coins', user.coins + cantidad)
      const successMessages = [
        `Derrotaste al guardián de las ruinas y reclamaste el tesoro antiguo, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Descifraste los símbolos rúnicos y obtuviste recompensas ocultas, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Encuentras al sabio de la mazmorra, quien te premia por tu sabiduría, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El espíritu de la reina ancestral te bendice con una gema de poder, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Superas la prueba de los espejos oscuros y recibes un artefacto único, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Derrotas a un gólem de obsidiana y desbloqueas un acceso secreto, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Salvas a un grupo de exploradores perdidos y ellos te recompensan, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Consigues abrir la puerta del juicio y extraes un orbe milenario, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Triunfas sobre un demonio ilusorio que custodiaba el sello perdido, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Purificas el altar corrompido y recibes una bendición ancestral, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(successMessages)
    } else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (9000 - 7500 + 1)) + 7500
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
        `Un espectro maldito te drena energía antes de que puedas escapar, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un basilisco te sorprende en la cámara oculta, huyes herido, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Una criatura informe te roba parte de tu botín en la oscuridad, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Fracasas al invocar un portal y quedas atrapado entre dimensiones, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Pierdes el control de una reliquia y provocas tu propia caída, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un grupo de espectros te rodea y te obliga a soltar tu tesoro, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El demonio de las sombras te derrota y escapas con pérdidas, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(failMessages)
    } else {
      const neutralMessages = [
        `Activaste una trampa, pero logras evitar el daño y aprendes algo nuevo.`,
        `La sala cambia de forma y pierdes tiempo explorando en círculos.`,
        `Caes en una ilusión, fortaleces tu mente sin obtener riquezas.`,
        `Exploras pasadizos ocultos y descubres símbolos misteriosos.`,
        `Encuentras un mural antiguo que revela secretos de la mazmorra.`
      ]
      message = pickRandom(neutralMessages)
    }
    user.lastdungeon = Date.now() + 17 * 60 * 1000

   await updateChatUser(m.chat, m.sender, 'lastdungeon', user.lastdungeon)
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
