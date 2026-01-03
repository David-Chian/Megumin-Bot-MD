export default {
  command: ['closet'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({client, m}) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const groupAnnouncement = groupMetadata.announce

      if (groupAnnouncement === true) {
        return client.reply(m.chat, `《✧》 El grupo ya está cerrado.`, m)
      }

      await client.groupSettingUpdate(m.chat, 'announcement')
      return client.reply(m.chat, `✿ El grupo ha sido cerrado correctamente.`, m)
    } catch (err) {
      console.error(err)
      return client.reply(m.chat, msgglobal, m)
    }
  },
};
