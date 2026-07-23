import fetch from 'node-fetch'
import { getBuffer } from '../../core/message.ts'
import sharp from 'sharp'

export default {
  command: ['xvideos'],

  run: async ({ sock, m, args }: any) => {
    const chatData = getChat(m.chat)
    if (!chatData?.nsfw)
      return sock.sendMessage(m.chat, {
        text: '✐ Los comandos de *NSFW* están desactivados en este Grupo.',
      }, { quoted: m })

    const query = args.join(' ')
    if (!query)
      return sock.sendMessage(m.chat, {
        text: '《✧》Ingresa el nombre de un video o una URL de XVideos.',
      }, { quoted: m })

    const apiUrl = global.api.url
    const apiKey = global.api.key

    try {
      let videoUrl:  string
      let videoInfo: any

      if (query.startsWith('http') && query.includes('xvideos.com')) {
        videoUrl = query
      } else {
        const searchRes = await fetch(
          `${apiUrl}/nsfw/search/xvideos?query=${encodeURIComponent(query)}&key=${apiKey}`
        )
        if (!searchRes.ok)
          return sock.sendMessage(m.chat, { text: '❌ Error al conectar con la API.' }, { quoted: m })

        const json = await searchRes.json() as any
        if (!json.status || !json.resultados?.length)
          throw new Error('No se encontró el video.')

        videoInfo = json.resultados[Math.floor(Math.random() * json.resultados.length)]
        videoUrl  = videoInfo.url

        const caption = `➮ *XVideos :: ${videoInfo.title}*

→ *Artista ::* ${videoInfo.artist || 'Desconocido'}
→ *Resolución ::* ${videoInfo.resolution}
→ *Duración ::* ${videoInfo.duration}
→ *Ver en ::* ${videoInfo.url}

> *✎ Enviando video....*`

        await sock.sendMessage(m.chat, {
          image:   { url: videoInfo.cover },
          caption,
        }, { quoted: m })
      }

      const dlRes = await fetch(
        `${apiUrl}/nsfw/dl/xvideos?url=${encodeURIComponent(videoUrl)}&key=${apiKey}`
      )
      if (!dlRes.ok)
        return sock.sendMessage(m.chat, { text: '❌ Error al descargar el video.' }, { quoted: m })

      const dlJson = await dlRes.json() as any
      if (!dlJson.status || !dlJson.resultado)
        return sock.sendMessage(m.chat, { text: '❌ No se pudo obtener el video.' }, { quoted: m })

      const videoLink  = dlJson.resultado.videos.low
      const thumbRaw   = await getBuffer(dlJson.resultado.thumb)
      const videoBuffer = await getBuffer(videoLink)

      const thumbBuffer = await sharp(thumbRaw)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer()

      await sock.sendMessage(m.chat, {
        document:       videoBuffer,
        mimetype:       'video/mp4',
        fileName:       `${videoInfo?.title ?? 'video'}.mp4`,
        jpegThumbnail:  thumbBuffer,
      }, { quoted: m })

    } catch (err: any) {
      await sock.sendMessage(m.chat, {
        text: `❌ Ocurrió un error: ${err.message}`,
      }, { quoted: m })
    }
  },
}