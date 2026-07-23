import fs from 'fs'
import fetch from 'node-fetch'
import exif from '../../core/exif.ts'
const { writeExif } = exif

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async ({ sock, m, args }) => {
    try {
      const quoted = m.quoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      let botSettings = await getSettings(botId)
      let botname = botSettings.namebot || ''

      let user = await getUser(m.sender)
      const name = user.name || m.pushName || 'Usuario'
      let texto1 = user.metadatos || `⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐`
      let texto2 = user.metadatos2 || `Socket:\n↳@${botname}\n💥Usuario:\n↳@${name}`

      let marca = args.join(' ').trim().split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2

      if (/image/.test(mime) || /webp/.test(mime)) {
        let buffer = await quoted.download()
        const media = { mimetype: mime, data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        await sock.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m })
        fs.unlinkSync(stickerPath)

      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 20) {
          return m.reply('❖ El video no puede ser muy largo')
        }

        let buffer = await quoted.download()
        const tmpFile = `./core/system/tmp/video-${Date.now()}.mp4`
        fs.writeFileSync(tmpFile, buffer)
        await sock.sendVideoAsSticker(m.chat, tmpFile, m, { packname: pack, author: author })
        fs.unlinkSync(tmpFile)

      } else if (args[0] && isUrl(args[0])) {
        const url = args[0]
        const res = await fetch(url)
        if (!res.ok) return m.reply('❖ No pude descargar ese archivo desde la URL.')

        const contentType = res.headers.get('content-type') || ''
        const buffer = Buffer.from(await res.arrayBuffer())

        if (!/image\/(png|jpe?g|webp)/i.test(contentType)) {
          return m.reply('❖ La URL debe apuntar a una imagen válida.')
        }

        const media = { mimetype: contentType, data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)

        await sock.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m })
        fs.unlinkSync(stickerPath)

      } else {
        return sock.reply(
          m.chat,
          '❀ Por favor, envía una imagen, video o URL para hacer un sticker.',
          m
        )
      }
    } catch (e) {
      return m.reply(String(e))
    }
  }
}

const isUrl = (text) => /^https?:\/\/.+/i.test(text)