import fs from 'fs'

export default {
  command: ['wm', 'watermark'],
  category: 'utils',

  run: async ({ client, m, text, command, usedPrefix }) => {
    try {
      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || ''
      
      if (!/webp/.test(mime)) {
        return m.reply(`❌ Responde a un sticker con el comando: *${usedPrefix + command} Pack | Autor*`)
      }

      let packname = 'Sticker Pack'
      let author = m.pushName || 'Bot'

      if (text) {
        if (text.includes('|')) {
          const [p, a] = text.split('|')
          packname = p.trim() || packname
          author = a.trim() || author
        } else {
          packname = text.trim()
        }
      } else {
        return m.reply(`✧ Usa:\n*${usedPrefix + command} Nombre del Pack | Autor*`)
      }

      const media = await q.download()
      
      if (!media) throw new Error('No se pudo descargar el sticker.')

      await client.sendImageAsSticker(m.chat, media, m, {
        packname: packname,
        author: author
      })

    } catch (e) {
      m.reply(`❌ Error al aplicar watermark. ${e.message}`)
    }
  }
}
