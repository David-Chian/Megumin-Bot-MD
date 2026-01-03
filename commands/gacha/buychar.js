export default {
  command: ['buycharacter', 'buychar', 'buyc'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const chatData = db.chats[chatId]
    const user = chatData.users[userId]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const personajeNombre = args.join(' ')?.trim()?.toLowerCase()
    if (!personajeNombre)
      return m.reply(
        `✎ Especifica el nombre del personaje que deseas comprar.`,
      )

    if (!chatData.users)
      return m.reply(`《✧》 No hay personajes disponibles para comprar en este chat.`)

    const personajesEnVenta = Object.entries(chatData.users).flatMap(
      ([_, userData]) => userData.personajesEnVenta || [],
    )

    const personaje = personajesEnVenta.find((p) => p.name.toLowerCase() === personajeNombre)
    if (!personaje)
      return m.reply(`✎ No se encontró el personaje *${personajeNombre}* en la lista de ventas.`)

    if (user.coins < personaje.precio)
      return m.reply(
        `ꕥ No tienes suficientes *${monedas}* para comprar *${personaje.name}*. Necesitas *¥${personaje.precio.toLocaleString()}*.`,
      )

    user.coins -= personaje.precio

    const vendedorId = personaje.vendedor
    const vendedor = chatData.users[vendedorId]
    //vendedor.coins ||= 0
    vendedor.coins += personaje.precio

    // user.characters ||= []
    user.characters.push({ name: personaje.name, ...personaje })

    vendedor.personajesEnVenta = vendedor.personajesEnVenta?.filter(
      (p) => p.name.toLowerCase() !== personajeNombre,
    )

    const nombreComprador = db.users[userId]?.name || userId.split('@')[0]
    const nombreVendedor = db.users[vendedorId]?.name || vendedorId.split('@')[0]

    const mensaje = `ꕥ *${personaje.name}* ha sido comprado por *${nombreComprador}*.\n\n> Se han transferido *${personaje.precio.toLocaleString()} ${monedas}* a *${nombreVendedor}*.`

    await client.sendMessage(chatId, { text: mensaje }, { quoted: m })
  },
};
