export default {
  command: ['sell', 'vender'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const userId = m.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botSettings = await getSettings(botId)
    const currency = botSettings.currency
    const botname = botSettings.namebot2

    const chatData = await getChat(chatId)
    if (chatData.adminonly || !chatData.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    try {
      const precioCoins = parseInt(args[0])
      const personajeNombre = args.slice(1).join(' ').trim().toLowerCase()

      if (!personajeNombre || isNaN(precioCoins))
        return sock.reply(m.chat,'《✤》 Especifica el valor y el nombre de la waifu a vender.',m,m.rcanal)

      const userData = await getChatUser(chatId, userId)
      if (!userData?.characters?.length) return sock.reply(m.chat,'✐ No tienes personajes en tu inventario.',m ,m.rcanal)

      const characterIndex = userData.characters.findIndex(
        (c) => c.name?.toLowerCase() === personajeNombre,
      )
      if (characterIndex === -1)
        return sock.reply(m.chat,`✎ No tienes el personaje *${personajeNombre}* en tu inventario.`,m,m.rcanal)

      if (precioCoins < 5000)
        return sock.reply(m.chat,`✎ El precio mínimo para vender un personaje es de *¥5,000 ${currency}*.`,m,m.rcanal)

      if (precioCoins > 20000000)
        return sock.reply(m.chat,
          `✎ El precio máximo para vender un personaje es de *¥20,000,000 ${currency}*.`,m,m.rcanal
        )

      const character = userData.characters[characterIndex]
      const expira = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

      if (!Array.isArray(userData.personajesEnVenta)) {
        userData.personajesEnVenta = []
      }

      userData.personajesEnVenta.push({
        ...character,
        precio: precioCoins,
        vendedor: userId,
        expira,
      })

      userData.characters.splice(characterIndex, 1)

      await updateChatUser(chatId, userId, 'personajesEnVenta', userData.personajesEnVenta)
      await updateChatUser(chatId, userId, 'characters', userData.characters)

      const mensaje = `❒ *${character.name}* ha sido puesto a la venta!

> 𖣣ֶㅤ֯⌗ ✿  ׄ ⬭ Vendedor › *@${userId.split('@')[0]}*
> 𖣣ֶㅤ֯⌗ ⛀  ׄ ⬭ Valor › *${precioCoins.toLocaleString()} ${currency}*
> 𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Expira en › *3 días*

${dev}`

      await sock.reply(chatId, mensaje, m, { mentions: [userId] })
    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  },
}

setInterval(async () => {
  try {
    const allChats = await getChat()
    
    for (const chat of allChats) {
      const chatUsers = await getChatUser(chat.id)
      
      for (const user of chatUsers) {
        if (Array.isArray(user.personajesEnVenta) && user.personajesEnVenta.length > 0) {
          const validos = []
          for (const p of user.personajesEnVenta) {
            const exp = new Date(p.expira)
            const expired = Date.now() > exp
            if (expired) {
              if (!user.characters) user.characters = []
              user.characters.push(p)
              await updateChatUser(chat.id, user.user_id, 'characters', user.characters)
            } else {
              validos.push(p)
            }
          }

          if (validos.length !== user.personajesEnVenta.length) {
            await updateChatUser(chat.id, user.user_id, 'personajesEnVenta', validos)
          }
        }
      }
    }
  } catch (e) {
    console.error('Error en intervalo de ventas:', e)
  }
}, 60 * 60 * 1000)
