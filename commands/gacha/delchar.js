export default {
  command: ['delchar', 'delwaifu', 'deletechar'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]
    const userData = chatData?.users[userId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    if (!userData?.characters?.length)
      return m.reply('《✧》 No tienes personajes reclamados en tu inventario.')

    if (!args[0])
      return m.reply(
        '✎ Debes especificar el nombre del personaje que deseas eliminar.',
      )

    const characterName = args.join(' ').toLowerCase()
    const characterIndex = userData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return m.reply(`《✧》 El personaje *${args.join(' ')}* no está en tu inventario.`)

    const removed = userData.characters.splice(characterIndex, 1)[0]

    return m.reply(
      `✐ El personaje *${removed.name}* ha sido eliminado exitosamente de tu inventario.`,
    )
  },
};
