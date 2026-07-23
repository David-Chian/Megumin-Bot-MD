export default {
  command: ['divorce'],
  category: 'rpg',
  run: async ({sock, m}) => {
    const user = await getUser(m.sender)
    const partnerId = user.marry
    const user2 = await getUser(partnerId)

    if (!partnerId) return m.reply('ꕥ Tú no estás casado con nadie.')

    user.marry = ''
    user2.marry = ''

    await updateUser(m.sender, 'marry', user.marry)
    await updateUser(partnerId, 'marry', user2.marry)

    return m.reply(
      `✐ *${m.pushName || userId.split('@')[0]}* te has divorciado de *${user2.name || partnerId.split('@')[0]}*.`,
    )
  },
};
