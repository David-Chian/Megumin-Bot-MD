export default {
  command: ['setgenre'],
  category: 'profile',
    run: async ({sock, m, args, command, text, prefix}) => {
    const user = await getUser(m.sender)
    const input = args.join(' ').toLowerCase()

    if (user.genre)
      return m.reply(`ꕥ Ya tienes un género. Usa › *${prefix + command}* para eliminarlo.`)

    if (!input)
      return m.reply(
        '《✧》 Debes ingresar un género válido.',
      )

    const genre = input === 'hombre' ? 'Hombre' : input === 'mujer' ? 'Mujer' : null
    if (!genre) return m.reply(`《✧》 Elije un genero valido.`)

    user.genre = genre

    await updateUser(m.sender, 'genre', user.genre)

    return m.reply(`✎ Se ha establecido tu género como: *${user.genre}*`)
  },
};
