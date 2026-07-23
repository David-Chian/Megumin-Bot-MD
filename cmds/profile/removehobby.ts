export default {
  command: ['delpasatiempo', 'removehobby'],
  category: 'profile',
  run: async ({sock, m, args}) => {
    const user = await getUser(m.sender)

    if (!user.pasatiempo || user.pasatiempo === 'No definido') {
      return m.reply('ꕥ No tienes ningún pasatiempo establecido.')
    }

    const pasatiempoAnterior = user.pasatiempo

    user.pasatiempo = 'No definido'

    await updateUser(m.sender, 'pasatiempo', user.pasatiempo)
    return m.reply(`✐ Se ha eliminado tu pasatiempo.`)
  },
};
