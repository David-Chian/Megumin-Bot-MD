export default {
  command: ['setdescription', 'setdesc'],
  category: 'profile',
    run: async ({sock, m, args, command, text, prefix}) => {
    const user = await getUser(m.sender)
    const input = args.join(' ')

    if (user.description)
      return m.reply(
        `✐ Ya tienes una descripción. Usa › *${prefix}deldescription* para eliminarla.`,
      )

    if (!input)
      return m.reply(
        '《✧》 Debes especificar una descripción válida.',
      )

    user.description = input

    await updateUser(m.sender, 'description', user.description)

    return m.reply(`✐ Se ha establecido tu descripción:\n> *${user.description}*`)
  },
};
