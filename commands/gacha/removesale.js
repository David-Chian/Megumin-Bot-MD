export default {
  command: ['removesale', 'removerventa'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const characterName = args.join(' ')?.trim()?.toLowerCase()

    if (db.chats[chatId].adminonly || !db.chats[chatId].gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    if (!characterName) return m.reply('✎ Especifica el nombre del personaje que deseas cancelar.')

    const chatData = db.chats[chatId]
    const userData = chatData?.users?.[userId]

    if (!userData) return m.reply('《✧》 No se encontraron datos del usuario en este grupo.')

    if (!userData.personajesEnVenta?.length) return m.reply('《✧》 No tienes personajes en venta.')

    const index = userData.personajesEnVenta.findIndex(
      (p) => p.name?.toLowerCase() === characterName,
    )
    if (index === -1)
      return m.reply(`《✧》 No se encontró el personaje *${characterName}* en tu lista de ventas.`)

    const personajeCancelado = userData.personajesEnVenta.splice(index, 1)[0]
    // userData.characters ||= []
    userData.characters.push(personajeCancelado)

    await client.sendMessage(
      chatId,
      {
        text: `✎ Tu personaje *${personajeCancelado.name}* ha sido retirado de la venta.`,
      },
      { quoted: m },
    )
  },
};
