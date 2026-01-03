export default {
  command: ['leave'],
  category: 'socket',
  run: async (client, m, args) => {
    const db = global.db.data
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const owner = db.settings[botId]?.owner
    const isSocketOwner = [
      botId,
      ...(global.mods || []).map((n) => n + '@s.whatsapp.net'),
    ].includes(m.sender)

    if (!isSocketOwner && m.sender !== owner)
      return m.reply(mess.socket)

    const groupId = args[0] || m.chat

    try {
      await client.groupLeave(groupId)
    } catch (e) {
      return m.reply(msgglobal)
    }
  },
};
