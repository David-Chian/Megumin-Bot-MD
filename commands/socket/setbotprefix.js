export default {
  command: ['setbotprefix'],
  category: 'socket',
  run: async ({client, m, args}) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) return m.reply('💣 Envía el nuevo prefijo o prefijos para el socket.')
    const allowedChars = /^[\/#+\-\.!]+$/
    if (!allowedChars.test(value)) {
      return m.reply('💣 Solo se permiten: `/`, `#`, `+`, `-`, `.`, `!`.')
    }
    const prefijos = [...value].map(c => c)
    config.prefijo = prefijos
    return m.reply(`💥 Se cambiaron los prefijos del bot a *${value}*`)
  },
};