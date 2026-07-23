export default {
  command: ['setusername'],
  category: 'socket',
    run: async ({sock, m, args, command, text, prefix}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) return m.reply(`✿ Debes escribir un nombre de usuario valido.\n> Ejemplo: *${prefix + command} Sherry Barnet*`)
    await sock.updateProfileName(value)
    return m.reply(`✿ El nombre de usuario del bot ha sido actualizado a *${value}*!`)
  },
};
