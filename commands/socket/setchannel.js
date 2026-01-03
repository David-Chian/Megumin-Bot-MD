export default {
  command: ['setchannel', 'setbotchannel'],
  category: 'socket',
  run: async ({client, m, args}) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()
    if (!value) {
      return m.reply(`💣 Ingresa el enlace o el ID de un canal de WhatsApp.`)
    }
    let info, ch
    if (/@newsletter$/i.test(value)) {
      ch = value.trim()
      info = await client.newsletterMetadata("jid", ch)
    } else {
      const channelUrl = value.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
      if (!channelUrl) return m.reply('💣 El enlace o ID proporcionado no es válido.')
      info = await client.newsletterMetadata("invite", channelUrl)
      ch = info?.id
    }
    if (!info) return m.reply('ꕥ No se pudo obtener información del canal.')
    config.id = info.id
    config.nameid = info.thread_metadata.name.text || "Canal sin nombre"
    return m.reply(`💥 Se cambió el canal del Socket a *"${config.nameid}"* correctamente.`)
  },
};
