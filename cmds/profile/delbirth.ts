export default {
  command: ['delbirth'],
  category: 'profile',
  run: async ({sock, m}) => {
    const user = await getUser(m.sender)
    if (!user.birth) return m.reply(`ꕥ No tienes una fecha de nacimiento establecida.`)

    user.birth = ''

   await updateUser(m.sender, 'birth', user.birth)
    return m.reply(`✐ Tu fecha de nacimiento ha sido eliminada.`)
  },
};
