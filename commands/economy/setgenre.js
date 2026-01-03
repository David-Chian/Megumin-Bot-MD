export default {
  command: ['setgenre'],
  category: 'rpg',
  run: async ({client, m, args}) => {
    const user = global.db.data.users[m.sender]
    const input = args.join(' ').toLowerCase()

    if (user.genre)
      return m.reply(`《✧》 Ya tienes un género. Usa › *${prefa}delgenre* para eliminarlo.`)

    if (!input)
      return m.reply(
        '《✧》 Debes ingresar un género válido.',
      )

    const genre = input === 'hombre' ? 'Hombre' : input === 'mujer' ? 'Mujer' : null
    if (!genre) return m.reply(`《✧》 Elije un genero valido.`)

    user.genre = genre
    return m.reply(`✎ Se ha establecido tu género como: *${user.genre}*`)
  },
};
