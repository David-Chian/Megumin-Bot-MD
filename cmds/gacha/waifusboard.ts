export default {
  command: ['waifusboard', 'waifustop', 'topwaifus', 'toprw'],
  category: 'gacha',
  use: '[página]',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const chatData = await getChat(chatId)

    if (chatData.adminonly || !chatData.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const chatUsers = await getChatUser(chatId)

    const users = []
    for (const user of chatUsers || []) {
      if (user.characters?.length > 5) {
        const userData = await getUser(user.user_id) || {}
        users.push({
          ...user,
          userId: user.user_id,
          name: userData.name || 'Desconocido'
        })
      }
    }

    if (users.length === 0)
      return sock.reply(m.chat,'✿ No hay usuarios en el grupo con más de 5 waifus.',m,m.rcanal)

    const sorted = users.sort(
      (a, b) => (b.characters?.length || 0) - (a.characters?.length || 0)
    )

    const page = parseInt(args[0]) || 1
    const pageSize = 10
    const totalPages = Math.ceil(sorted.length / pageSize)

    if (isNaN(page) || page < 1 || page > totalPages)
      return sock.reply(m.chat,`✐ La página *${page}* no existe. Hay un total de *${totalPages}* páginas.`,m,m.rcanal)

    const startIndex = (page - 1) * pageSize
    const list = sorted.slice(startIndex, startIndex + pageSize)

    let message = `❑ Usuarios con más waifus\n\n`
    message += list.map((u, i) =>
      `✩ ${startIndex + i + 1} › *${u.name}*\n     Waifus → *${u.characters.length}*`
    ).join('\n\n')

    message += `\n\n> ⌦ Página *${page}* de *${totalPages}*`
    if (page < totalPages)
      message += `\n> Para ver la siguiente página › *waifusboard ${page + 1}*`

    await m.reply(message)
  }
}
