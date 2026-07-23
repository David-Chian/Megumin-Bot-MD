export default {
  command: ['accepttrade', 'aceptarintercambio'],
  category: 'gacha',
  run: async ({sock, m}) => {
    const chatId = m.chat
    const userId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    let intercambios = chatConfig.intercambios || []
    if (!Array.isArray(intercambios)) {
      try {
        if (typeof intercambios === 'string') intercambios = JSON.parse(intercambios)
        else intercambios = []
      } catch {
        intercambios = []
      }
    }
    
    const intercambio = intercambios.find(
      (i) => i.expiracion > Date.now() && i.destinatario === userId
    )

    if (!intercambio) 
      return sock.reply(m.chat,'《✤》 No tienes ninguna solicitud de intercambio activa.', m,m.rcanal)

    const solicitante = await getChatUser(chatId, intercambio.solicitante)
    const destinatario = await getChatUser(chatId, intercambio.destinatario)

    solicitante.characters = [
      ...(solicitante.characters || []).filter((c) => c.name !== intercambio.personaje1.name),
      intercambio.personaje2,
    ]

    destinatario.characters = [
      ...(destinatario.characters || []).filter((c) => c.name !== intercambio.personaje2.name),
      intercambio.personaje1,
    ]

    await updateChatUser(chatId, intercambio.solicitante, 'characters', solicitante.characters)
    await updateChatUser(chatId, intercambio.destinatario, 'characters', destinatario.characters)

    intercambios = intercambios.filter((i) => i !== intercambio)
    await updateChat(chatId, 'intercambios', intercambios)
    await updateChat(chatId, 'timeTrade', 0)

    const solicitanteGlobal = await getUser(intercambio.solicitante)
    const destinatarioGlobal = await getUser(intercambio.destinatario)
    
    const nombreSolicitante = solicitanteGlobal?.name || intercambio.solicitante.split('@')[0]
    const nombreDestinatario = destinatarioGlobal?.name || intercambio.destinatario.split('@')[0]

    const mensajeConfirmacion = `ꕥ *Intercambio realizado exitosamente (✿❛◡❛)*\n\n✎ *${intercambio.personaje1.name}* ahora pertenece a *${nombreDestinatario}*\n✎ *${intercambio.personaje2.name}* ahora pertenece a *${nombreSolicitante}*

${dev}`

    await sock.reply(chatId, mensajeConfirmacion, m, m.rcanal)
  }
};
