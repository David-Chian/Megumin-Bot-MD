export default {
  command: ['hidetag', 'tag'],
  category: 'grupo',
  isAdmin: true,
  run: async ({client, m, args}) => {
    const text = args.join(' ')
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants || []

    const mentions = groupParticipants
      .map(p => p.jid || p.id || p.lid || p.phoneNumber)
      .filter(Boolean)
      .map(id => client.decodeJid(id))

    if (!m.quoted && !text) {
      return m.reply(`《✧》 Ingresa un texto o responde a uno`)
    }

    const q = m.quoted || m
    let mime = q.mimetype || q.mediaType || ''

    if (!mime) {
      if (q.message?.imageMessage) mime = 'image'
      else if (q.message?.videoMessage) mime = 'video'
      else if (q.message?.stickerMessage) mime = 'sticker'
      else if (q.message?.audioMessage) mime = 'audio'
    }

    const isMedia = /image|video|sticker|audio/.test(mime)

const quotedText =
  q?.text ||
  q?.caption ||
  q?.body ||
  q?.message?.conversation ||
  q?.message?.extendedTextMessage?.text ||
  ''

const finalText = text || quotedText
const hasText = Boolean(finalText && finalText.trim())

try {
  if (isMedia) {
    const media = await q.download()
    const options = { quoted: null, mentions }

    if (/image/.test(mime)) {
      return client.sendMessage(
        m.chat,
        hasText
          ? { image: media, caption: text, ...options }
          : { image: media, ...options }
      )
    }

    if (/video/.test(mime)) {
      return client.sendMessage(
        m.chat,
        hasText
          ? { video: media, mimetype: 'video/mp4', caption: text, ...options }
          : { video: media, mimetype: 'video/mp4', ...options }
      )
    }

    if (/audio/.test(mime)) {
      return client.sendMessage(
        m.chat,
        { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', ...options }
      )
    }

    if (/sticker/.test(mime)) {
      return client.sendMessage(
        m.chat,
        { sticker: media, ...options }
      )
    }
  }
  if (!hasText) {
    return m.reply('《✧》 Ingresa un texto o responde a un mensaje.')
  }

  return client.sendMessage(
    m.chat,
    { text: finalText, mentions },
    { quoted: null }
  )

} catch (e) {
  return m.reply('《✧》 Error al ejecutar el comando.')
}
  }
}