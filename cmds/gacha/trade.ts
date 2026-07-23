const findCharacterByName = (name, characters) => {
  return characters.find((p) => p.name?.toLowerCase() === name.toLowerCase())
}

export default {
  command: ['trade', 'cambiar'],
  category: 'gacha',
  run: async ({sock, m, args, command, text, prefix}) => {
    const chatId = m.chat
    const userId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    if (chatConfig.timeTrade && chatConfig.timeTrade - Date.now() > 0)
      return sock.reply(m.chat,'《✤》 Ya hay un intercambio en curso. Espera a que se complete o expire.',m,m.rcanal)

    const partes = args
      .join(' ')
      .split('/')
      .map((s) => s.trim())
      
    if (partes.length !== 2)
      return sock.reply(m.chat,
        `✎ Usa el formato correcto:\n› *${prefix}trade Tu personaje / Personaje del otro usuario*`,m,m.rcanal 
      )

    try {
      const [personaje1Nombre, personaje2Nombre] = partes
      
      const userData = await getChatUser(chatId, userId)
      const personaje1 = findCharacterByName(personaje1Nombre, userData.characters || [])

      const chatUsers = await getChatUser(chatId)
      
      let personaje2UserId = null
      let personaje2 = null
      
      for (const user of chatUsers) {
        if (user.user_id === userId) continue
        const found = findCharacterByName(personaje2Nombre, user.characters || [])
        if (found) {
          personaje2UserId = user.user_id
          personaje2 = found
          break
        }
      }

      if (!personaje1) 
        return sock.reply(m.chat,`✐ No tienes el personaje *${personaje1Nombre}*.`,m,m.rcanal)
        
      if (!personaje2)
        return sock.reply(m.chat,`✐ El personaje *${personaje2Nombre}* no está disponible para intercambio.`,m,m.rcanal)

      let intercambios = chatConfig.intercambios || []
      if (!Array.isArray(intercambios)) {
        try {
          if (typeof intercambios === 'string') intercambios = JSON.parse(intercambios)
          else intercambios = []
        } catch {
          intercambios = []
        }
      }
      
      intercambios.push({
        solicitante: userId,
        personaje1,
        personaje2,
        destinatario: personaje2UserId,
        expiracion: Date.now() + 60000,
      })

      await updateChat(chatId, 'intercambios', intercambios)
      await updateChat(chatId, 'timeTrade', Date.now() + 60000)

      const solicitudMessage = `✐ @${personaje2UserId.split('@')[0]}, @${userId.split('@')[0]} te ha enviado una solicitud de intercambio

✿ *${personaje2.name}* ⇄ *${personaje1.name}*
> ❖ Para aceptar, usa › *${prefix}accepttrade* dentro de 1 minuto.

${dev}`

      await sock.reply(
        chatId,
        solicitudMessage,
        m,
        { mentions: [userId, personaje2UserId] }
      )

    } catch (e) {
      m.reply(msgglobal + e)
    }
  }
};
