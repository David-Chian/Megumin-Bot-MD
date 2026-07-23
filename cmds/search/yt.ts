import yts from 'yt-search'
import { getBuffer } from '../../core/message.ts'
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from '@whiskeysockets/baileys'

const ytCache = new Map<string, { data: any[]; timestamp: number }>()

export default {
  command:  ['ytsearch', 'search'],
  category: 'internet',

  run: async ({ sock, m, args, usedPrefix }: any) => {
    if (!args?.length)
      return sock.sendMessage(m.chat, { text: '《✧》 Ingrese el *título* de un *vídeo*.' }, { quoted: m })

    const query = args.join(' ').toLowerCase()
    await sock.sendMessage(m.chat, { text: '💎 Buscando resultados...' }, { quoted: m })

    try {
      let results: any[] | undefined

      const cached = ytCache.get(query)
      if (cached && Date.now() - cached.timestamp < 30_000) {
        results = cached.data
      } else {
        ytCache.delete(query)
      }

      if (!results) {
        const search = await yts(query)
        results = search.videos.slice(0, 6)
        ytCache.set(query, { data: results, timestamp: Date.now() })
      }

      if (!results.length)
        return sock.sendMessage(m.chat, { text: '✘ No se encontraron resultados.' }, { quoted: m })

      const cards = []

      for (let i = 0; i < results.length; i++) {
        const v           = results[i]
        const imageBuffer = await getBuffer(v.thumbnail)

        const imageMessage = await generateWAMessageContent(
          { image: imageBuffer },
          { upload: sock.waUploadToServer }
        )

        const seconds          = v.seconds || 0
        const minutes          = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
`ⴵ Duración: ${v.timestamp} (${minutes}m ${remainingSeconds}s)
👁 Vistas: ${Number(v.views).toLocaleString()}
📅 Subido: ${v.ago}
📺 Canal: ${v.author?.name || 'Desconocido'}`,
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title:              `#${i + 1} ${v.title}`,
            hasMediaAttachment: true,
            imageMessage:       imageMessage.imageMessage,
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name:             'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎵 Descargar MP3',
                  id:           `${usedPrefix}play ${v.url}`,
                }),
              },
              {
                name:             'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎥 Descargar Video',
                  id:           `${usedPrefix}play2 ${v.url}`,
                }),
              },
            ],
          }),
        })
      }

      const message = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🔎 Resultados para: *${query}*`,
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: `Mostrando ${results.length} resultados`,
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false,
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards }),
        }),
      }, { quoted: m })

      await sock.relayMessage(m.chat, message.message, { messageId: message.key.id })

    } catch (err: any) {
      console.error(err)
      await sock.sendMessage(m.chat, { text: '✘ Ocurrió un error al buscar.' }, { quoted: m })
    }
  },
}