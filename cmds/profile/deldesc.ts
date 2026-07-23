export default {
  command: ['deldescription', 'deldesc'],
  category: 'profile',
  run: async ({sock, m}) => {
    const user = await getUser(m.sender)
    if (!user.description) return m.reply(`ꕥ No tienes una descripción establecida.`)

    user.description = ''

    await updateUser(m.sender, 'description', user.description)
    return m.reply(`✐ Tu descripción ha sido eliminada.`)
  },
};
