import axios from 'axios'
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

async function sendAlbumMessage(jid, medias, conn, options = {}) {
  const caption = options.caption || ''
  const delay = !isNaN(options.delay) ? options.delay : 500

  const album = generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: 0,
      expectedVideoCount: medias.length,
      ...(options.quoted
        ? {
            contextInfo: {
              remoteJid: options.quoted.key.remoteJid,
              fromMe: options.quoted.key.fromMe,
              stanzaId: options.quoted.key.id,
              participant: options.quoted.key.participant || options.quoted.key.remoteJid,
              quotedMessage: options.quoted.message,
            },
          }
        : {}),
    }
  }, {})

  await conn.relayMessage(jid, album.message, { messageId: album.key.id })

  for (let i = 0; i < medias.length; i++) {
    const { url } = medias[i]
    const videoMessage = await baileys.generateWAMessage(jid, {
      video: { url },
      ...(i === 0 ? { caption } : {})
    }, { upload: conn.waUploadToServer })

    videoMessage.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    }

    await conn.relayMessage(jid, videoMessage.message, { messageId: videoMessage.key.id })
    await baileys.delay(delay)
  }

  return album
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, '💜 *¿Qué quieres buscar en TikTok?*', m)

  try {
    conn.reply(m.chat, '💜 *Descargando videos...*', m)

    const { data: response } = await axios.get('https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=' + text)
    let searchResults = response.data
    searchResults = searchResults.sort(() => Math.random() - 0.5)
    let selectedResults = searchResults.slice(0, 5)

    const videos = selectedResults.map(result => ({
      type: "video",
      url: result.nowm
    }))

    await sendAlbumMessage(m.chat, videos, conn, { caption: `💜 Resultados para: ${text}`, quoted: m })

  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, '⚠️ Error al buscar o enviar los videos.', m)
  }
}

handler.help = ['tiktoksearch <texto>']
handler.register = true
handler.tags = ['buscador']
handler.command = ['tiktoksearch', 'tiktoks']
export default handler