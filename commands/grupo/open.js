export default {
  command: ['open'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({client, m}) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const groupAnnouncement = groupMetadata.announce

      if (groupAnnouncement === false) {
        return client.reply(m.chat, `《✧》 El grupo ya está abierto.`, m)
      }

      await client.groupSettingUpdate(m.chat, 'not_announcement')
      return client.reply(m.chat, `✿ El grupo ha sido abierto correctamente.`, m)
    } catch (err) {
      console.error(err)
      return client.reply(m.chat, msgglobal, m)
    }
  },
};
