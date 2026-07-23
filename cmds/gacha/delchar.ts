export default {
  command: ['delchar', 'delwaifu', 'deletechar', 'delp'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const userId = m.sender

    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const userData = await getChatUser(chatId, userId)

    if (!userData?.characters?.length)
      return sock.reply(m.chat,'《✤》 No tienes personajes reclamados en tu inventario.',m,m.rcanal)

    if (!args[0])
      return sock.reply(m.chat,'✐ Debes especificar el nombre del personaje que deseas eliminar.',m,m.rcanal)

    const characterName = args.join(' ').toLowerCase()
    const characterIndex = userData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return sock.reply(m.chat,`《✤》 El personaje *${args.join(' ')}* no está en tu inventario.`,m,m.rcanal)

    const removed = userData.characters.splice(characterIndex, 1)[0]
    
    await updateChatUser(chatId, userId, 'characters', userData.characters)

    return sock.reply(m.chat,
      `✎ El personaje *${removed.name}* ha sido eliminado exitosamente de tu inventario.`,
    m,m.rcanal)
  },
}
