import fs from 'fs'

export default {
  command: ['sticker', 's'],
  category: 'utils',
  run: async ({ client, m }) => {
    try {
      const user = global.db.data.users[m.sender]
      const user2 = global.db.data.chats[m.chat].users[m.sender]

      const text1 = user.metadatos || 'Megumin Bot'
      const text2 = user.metadatos2 || `Usuario: @${user.name}`

      const q = m.quoted || m
      const mime = (q.msg || q).mimetype || ''

      if (!/image|video/.test(mime)) {
        return m.reply('✧ Responde o envía una imagen o video para hacer sticker.')
      }

      const media = await q.download()
      let enc

      if (/image/.test(mime)) {
        enc = await client.sendImageAsSticker(
          m.chat,
          media,
          m,
          { packname: text1, author: text2 }
        )
      } else if (/video/.test(mime)) {
        if ((q.msg || q).seconds > 20)
          return m.reply('El video es muy largo (máx 20s).')

        enc = await client.sendVideoAsSticker(
          m.chat,
          media,
          m,
          { packname: text1, author: text2 }
        )
      }

      await fs.unlinkSync(enc)

    } catch (e) {
      m.reply('❌ Error:\n' + e)
    }
  }
}