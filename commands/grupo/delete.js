export default {
  command: ['delete', 'del'],
  category: 'grupo',
  admin: true,
  botAdmin: true,
  group: true,

  run: async ({ client, m }) => {
    try {
      if (!m.quoted)
        return client.sendMessage(
          m.chat,
          { text: '❀ Responde al mensaje que deseas eliminar.' },
          { quoted: m }
        )

      const context = m.message?.extendedTextMessage?.contextInfo
      const participant = context?.participant
      const stanzaId = context?.stanzaId

      if (!participant || !stanzaId)
        throw new Error('No se pudo obtener la información del mensaje')

      const botId = client.user?.id?.split(':')[0]
      const isFromMe = participant?.includes(botId)

      await client.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: isFromMe,
          id: stanzaId,
          participant
        }
      })

    } catch (e) {
      try {
        await client.sendMessage(m.chat, { delete: m.quoted.vM.key })
      } catch (err) {
        console.error(err)
        m.reply('❌ No se pudo eliminar el mensaje')
      }
    }
  }
}