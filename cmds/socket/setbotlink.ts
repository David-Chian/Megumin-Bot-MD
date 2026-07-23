export default {
  command: ['setlink', 'setbotlink'],
  category: 'socket',
  run: async ({sock, m, args}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)

    const value = args.join(' ').trim()
    if (!value) {
      return m.reply(`✿ Ingresa un enlace válido que comience con http:// o https://`)
    }

    if (!/^https?:\/\//i.test(value)) {
      return m.reply('✿ El enlace debe comenzar con http:// o https://')
    }

    config.link = value

    await updateSettings(idBot, 'link', config.link)
    return m.reply(`✎ Se cambió el enlace del Socket correctamente.`)
  },
};
