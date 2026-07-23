export default {
  command: ['link'],
  category: 'grupo',
  botAdmin: true,
  run: async ({sock, m}) => {
    try {
      const code = await sock.groupInviteCode(m.chat)
      const link = `https://chat.whatsapp.com/${code}`
      await sock.reply(m.chat, `${link}`, m)
    } catch (e) {
      await sock.reply(m.chat, msgglobal, m)
    }
  },
};
