export default {
  command: ['leave'],
  category: 'socket',
  run: async ({sock, m, args}) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await getSettings(botId)
    const owner = settings.owner
    const isSocketOwner = [
      botId,
      ...(global.mods || []).map((n) => n + '@s.whatsapp.net'),
    ].includes(m.sender)

    if (!isSocketOwner && m.sender !== owner)
      return m.reply(mess.socket)

    const groupId = args[0] || m.chat

    try {
      await sock.groupLeave(groupId)
    } catch (e) {
      return m.reply(msgglobal)
    }
  },
};
