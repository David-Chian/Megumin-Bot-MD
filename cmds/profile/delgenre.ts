export default {
  command: ['delgenre'],
  category: 'profile',
  run: async ({sock, m}) => {
    const user = await getUser(m.sender)
    if (!user.genre) return m.reply(`ꕥ No tienes un género asignado.`)

    user.genre = ''

    await updateUser(m.sender, 'genre', user.genre)
    return m.reply(`✐ Tu género ha sido eliminado.`)
  },
};
