import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

export default {
  command: ['hd'],
  category: 'utils',
  run: async ({ client, m }) => {
    try {
      const q = m.quoted || m
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!mime) {
        return m.reply(`《✧》 Envía una *imagen* junto al comando`)
      }

      if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`《✧》 El formato *${mime}* no es compatible`)
      }

      const media = await q.download()

      const link = await uploadImage(media)
      if (!link) {
        return m.reply('《✧》 No se pudo subir la imagen')
      }

      const apiUrl =
        `https://api.nekolabs.web.id/tools/upscale/waifu2x` +
        `?imageUrl=${encodeURIComponent(link)}` +
        `&style=photo&noice=low&upscaling=2x`

      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'WhatsApp-Bot',
          'Accept': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`Nekolabs API HTTP ${res.status}`)
      }

      const json = await res.json()

      if (!json.success || !json.result) {
        throw new Error('Respuesta inválida de Nekolabs')
      }

      const imgRes = await fetch(json.result)
      if (!imgRes.ok) {
        throw new Error('No se pudo descargar la imagen HD')
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer())

      await client.sendMessage(
        m.chat,
        { image: buffer },
        { quoted: m }
      )

    } catch (err) {
      await m.reply(`❌ Error: ${err.message}`)
    }
  }
}