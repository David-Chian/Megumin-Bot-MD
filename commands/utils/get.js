import fetch from 'node-fetch';
import {format} from 'util';

export default {
  command: ['get'],
  category: 'utils',
  run: async ({client, m, args}) => {
    const text = args[0]
    if (!text) return m.reply('《✧》 Ingresa un enlace para realizar la solicitud.')

    if (!/^https?:\/\//.test(text))
      return m.reply('《✧》 Ingresa un enlace válido que comience en *https://* o *http://*')

    try {
      const response = await fetch(text)
      const contentType = response.headers.get('content-type') || ''
      const contentLength = parseInt(response.headers.get('content-length') || '0')
      const ext = text.split('.').pop().toLowerCase()

      if (contentLength > 100 * 1024 * 1024) {
        throw new Error(`Archivo demasiado grande: ${contentLength} bytes`)
      }

      const buffer = await response.buffer()

      if (/image\/(jpeg|png|gif|webp)/.test(contentType) || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        return await client.sendMessage(m.chat, { image: buffer, caption: `《✧》 Imagen desde: ${text}` }, { quoted: m })
      }

      if (/video\/(mp4|webm|ogg)/.test(contentType) || ['mp4', 'webm', 'ogg'].includes(ext)) {
        return await client.sendMessage(m.chat, { video: buffer, caption: `《✧》 Video desde: ${text}` }, { quoted: m })
      }

      if (/audio\/(mpeg|ogg|mp3|wav)/.test(contentType) || ['mp3', 'wav', 'ogg'].includes(ext) || contentType === 'application/octet-stream') {
        const mime = contentType.startsWith('audio/') ? contentType : 'audio/mpeg'
        return await client.sendMessage(m.chat, { audio: buffer, mimetype: mime }, { quoted: m })
      }

      let content = buffer.toString()
      try {
        content = format(JSON.parse(content))
      } catch (e) {}

      return await m.reply(`${content}`)

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
};
