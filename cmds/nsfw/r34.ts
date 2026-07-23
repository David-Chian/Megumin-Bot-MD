import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  generateWAMessage,
  delay,
} from '@whiskeysockets/baileys'

async function sendAlbumMessage(sock, jid, medias, options = {}) {
  if (typeof jid !== 'string') throw new TypeError(`jid must be string, received: ${jid}`)
  if (medias.length < 2) throw new RangeError('Se necesitan al menos 2 imágenes para un álbum')

  const caption = options.caption || options.text || ''
  const delayMs = !isNaN(options.delay) ? options.delay : 500

  const album = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: { expectedImageCount: medias.length },
    },
    {}
  )

  await sock.relayMessage(album.key.remoteJid, album.message, {
    messageId: album.key.id,
  })

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]

    const mediaMsg = await generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: sock.waUploadToServer }
    )

    mediaMsg.message.messageContextInfo = {
      messageAssociation: {
        associationType: 1,
        parentMessageKey: album.key,
      },
    }

    await sock.relayMessage(mediaMsg.key.remoteJid, mediaMsg.message, {
      messageId: mediaMsg.key.id,
    })

    await delay(delayMs)
  }

  return album
}

export default {
  command: ['r34', 'r34vid', 'rule34', 'rule34vid', 'rule', 'rulevid'],
  category: 'nsfw',
  run: async ({ sock, m, args, command }) => {
    try {
      const chatId = m.chat
      const chat = await getChat(m.chat)

      if (!chat.nsfw) {
        return m.reply(mess.nsfw)
      }

      if (!args[0]) {
        return sock.reply(m.chat, `✿ Debes especificar tags para buscar.`, m)
      }

      const cleanTags = args.join(' ').trim().replace(/\s+/g, '_')
      
      const tagEncoded = encodeURIComponent(cleanTags)

      let mediaList = []
      const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tagEncoded}&api_key=a4e807dd6d4c9e55768772996946e4074030ec02c49049d291e5edb8808a97b004190660b4b36c3d21699144c823ad93491d066e73682a632a38f9b6c3cf951b&user_id=5753302`

      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } 
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      let json = []
      try {
        json = JSON.parse(text)
      } catch {
        json = []
      }

      const data = Array.isArray(json) ? json : json?.post || json?.data || []
      
      const valid = data
        .map(i => i?.file_url || i?.sample_url || i?.preview_url)
        .filter(u => typeof u === 'string' && /\.(jpe?g|png|gif|mp4)$/i.test(u))

      if (valid.length) {
        mediaList = [...new Set(valid)].sort(() => Math.random() - 0.5)
      }

      if (!mediaList.length) {
        return sock.reply(m.chat, `❀ No se encontraron resultados para ${cleanTags}`, m)
      }

      let filtered = []
      const isVideoCommand = ['r34vid', 'rule34vid', 'rulevid'].includes(command)

      if (isVideoCommand) {
        filtered = mediaList.filter(u => /\.mp4$/i.test(u))
      } else {
        filtered = mediaList.filter(u => /\.(jpe?g|png|gif)$/i.test(u))
      }

      if (!filtered.length) {
        return sock.reply(m.chat, `❀ No se encontraron ${isVideoCommand ? 'videos' : 'imágenes'} para ${cleanTags}`, m)
      }
      if (filtered.length >= 2) {
        const limit = Math.min(filtered.length, 10)
        const albumMedias = filtered.slice(0, limit).map(url => ({
          type: isVideoCommand ? 'video' : 'image',
          data: { url }
        }))

        await sendAlbumMessage(sock, m.chat, albumMedias, {
          caption: `❀ Resultados para: ${cleanTags}`
        })
      } else {
        const media = filtered[0]
        if (isVideoCommand) {
          await sock.sendMessage(m.chat, { video: { url: media }, caption: `❀ Resultado para: ${cleanTags}`, mentions: [m.sender] }, { quoted: m })
        } else {
          await sock.sendMessage(m.chat, { image: { url: media }, caption: `❀ Resultado para: ${cleanTags}`, mentions: [m.sender] }, { quoted: m })
        }
      }

    } catch (e) {
      console.error(e)
      await m.reply(typeof msgglobal !== 'undefined' ? msgglobal : 'Ocurrió un error interno.')
    }
  }
}
