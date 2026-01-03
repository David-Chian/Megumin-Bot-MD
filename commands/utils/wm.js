import fs from 'fs'

export default {
  command: ['wm'],
  category: 'utils',
  run: async ({ client, m, args }) => {
    try {
      const q = m.quoted
      if (!q) return m.reply('❌ Responde a un sticker.')

      const mime = (q.msg || q).mimetype || ''
      if (!/webp/.test(mime))
        return m.reply('❌ El mensaje respondido no es un sticker.')

      if (!args.length)
        return m.reply('✧ Usa:\n*/wm Pack Name | Autor (opcional)*')

      const text = args.join(' ')
      
      let packname = text
      let author = m.pushName || 'Sticker'

      if (text.includes('|')) {
        const split = text.split('|')
        packname = split[0]?.trim()
        author = split[1]?.trim() || author
      }

      if (!packname)
        return m.reply('❌ Debes escribir al menos el nombre del pack.')

      const media = await q.download()

      const enc = await client.sendImageAsSticker(
        m.chat,
        media,
        m,
        {
          packname,
          author
        }
      )

      await fs.unlinkSync(enc)

    } catch (e) {
      m.reply('❌ Error al aplicar watermark\n' + e)
    }
  }
}