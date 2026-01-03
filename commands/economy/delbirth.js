export default {
  command: ['delbirth'],
  category: 'rpg',
  run: async ({client, m}) => {
    const user = global.db.data.users[m.sender]
    if (!user.birth) return m.reply(`《✧》 No tienes una fecha de nacimiento establecida.`)

    user.birth = ''
    return m.reply(`✎ Tu fecha de nacimiento ha sido eliminada.`)
  },
};
