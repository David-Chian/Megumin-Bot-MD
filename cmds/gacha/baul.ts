export default {
  command: ['guardar', 'sacar'],
  category: 'rpg',

  run: async ({ sock, m, text, command }) => {
    const chatId   = m.chat
    const userId   = m.sender
    const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = getSettings(botId)
    const currency = settings?.currency || 'Monedas'

    const personajeNombre = text?.trim().toLowerCase()
    if (!personajeNombre)
      return sock.reply(m.chat,`Por favor, proporciona el nombre del personaje.\nEjemplo: */${command} Megumin*`,m,m.rcanal)

    const user = getChatUser(chatId, userId)
    if (!user?.characters?.length)
      return sock.reply(m.chat,'No tienes personajes en tu inventario.',m,m.rcanal)

    const characterIndex = user.characters.findIndex(
      (p: any) => p.name.toLowerCase() === personajeNombre
    )
    if (characterIndex === -1)
      return sock.reply(m.chat,`No tienes el personaje *"${personajeNombre}"* en tu inventario.`,m,m.rcanal)

    const character = user.characters[characterIndex]

    if (command === 'guardar') {
      if (character.vaulted)
        return sock.reply(m.chat,`El personaje *"${character.name}"* ya está guardado en la bóveda.`,m,m.rcanal)

      const costo = Math.ceil(character.value / 1) * 15

      if ((user.coins || 0) < costo)
        return sock.reply(m.chat,`No tienes suficientes *${currency}*. Necesitas *${costo.toLocaleString()}* ${currency} para guardar a *"${character.name}"*.`,m,m.rcanal)

      const nuevosChars = [...user.characters]
      nuevosChars[characterIndex] = { ...character, vaulted: true }

      updateChatUser(chatId, userId, 'characters', nuevosChars)
      updateChatUser(chatId, userId, 'coins', (user.coins || 0) - costo)

      return sock.reply(m.chat,
        `✨ *Personaje Guardado en la Bóveda* ✨\n` +
        `- Nombre: *${character.name}*\n` +
        `- Género: *${character.gender}*\n` +
        `- Fuente: *${character.source}*\n` +
        `- Valor: *${character.value}*\n` +
        `- Costo: *${costo.toLocaleString()}* ${currency}\n` +
        `- ${currency} restantes: *${((user.coins || 0) - costo).toLocaleString()}*`
      ,m,m.rcanal)
    }

    if (command === 'sacar') {
      if (!character.vaulted)
        return sock.reply(m.chat,`El personaje *"${character.name}"* no está en la bóveda.`,m,m.rcanal)

      const nuevosChars = [...user.characters]
      nuevosChars[characterIndex] = { ...character, vaulted: false }

      updateChatUser(chatId, userId, 'characters', nuevosChars)

      return sock.sendMessage(m.chat, {
        image:   { url: character.url },
        caption:
          `✨ *Personaje Sacado de la Bóveda* ✨\n` +
          `- Nombre: *${character.name}*\n` +
          `- Género: *${character.gender}*\n` +
          `- Fuente: *${character.source}*\n` +
          `- Valor: *${character.value}*`
      }, { quoted: m })
    }
  }
}