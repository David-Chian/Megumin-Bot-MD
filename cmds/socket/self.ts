export default {
  command: ['self'],
  category: 'socket',
  run: async ({sock, m, args}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
   const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [
      idBot,
      ...globalThis.owner.map((number) => number + '@s.whatsapp.net'),
    ].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) {
      return m.reply(mess.socket)
    }
    const chat = config
    const estado = chat.self ?? 0

    if (args[0] === 'enable' || args[0] === 'on') {
      if (estado) return m.reply('✿ El modo *Self* ya estaba activado.')
      chat.self = 1

      await updateSettings(idBot, 'self', chat.self)
      return m.reply('✿ Has *Activado* el modo *Self*.')
    }

    if (args[0] === 'disable' || args[0] === 'off') {
      if (!estado) return m.reply('✿ El modo *Self* ya estaba desactivado.')
      chat.self = 0

      await updateSettings(idBot, 'self', chat.self)
      return m.reply('✿ Has *Desactivado* el modo *Privado*.')
    }

    return m.reply(
      `*☆ Self (✿❛◡❛)*\n➮ *Estado ›* ${estado ? '✓ Activado' : '✗ Desactivado'}\n\n❀ Puedes cambiarlo con:\n> ● _Activar ›_ *self enable*\n> ● _Desactivar ›_ *self disable*`,
    )
  },
};
