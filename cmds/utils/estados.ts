import { generateWAMessageContent, generateWAMessage, proto } from "@whiskeysockets/baileys"

const COLORS = [
  { bg: 0xff25d366, font: 0 },
  { bg: 0xff128c7e, font: 1 },
  { bg: 0xff5e35b1, font: 2 },
  { bg: 0xffe91e63, font: 3 },
  { bg: 0xffff6f00, font: 4 },
  { bg: 0xff546e7a, font: 5 }
]

export default {
  command: ['swgc'],
  category: 'admin',
  isAdmin: true,
  run: async ({ sock, m, args }) => {
    if (!m.isGroup) return sock.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, m.rcanal)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const isPremiumBot = botSettings.botprem === 1
    const isModBot = botSettings.botmod === 1

    if (!isOficialBot && !isPremiumBot && !isModBot) {
      return sock.reply(m.chat, mess.solosub, m)
    }

    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const caption = args.join(' ')

    const quotedMsg = m.quoted?.message || m
    const mediaType = quotedMsg?.imageMessage
      ? 'image'
      : quotedMsg?.videoMessage
      ? 'video'
      : quotedMsg?.audioMessage
      ? 'audio'
      : null

    if (mediaType) {
      const buffer = await sock.downloadMediaMessage(m.quoted)

      const content: any = {}
      if (mediaType === 'image') {
        content.image = buffer
        if (caption) content.caption = caption
      } else if (mediaType === 'video') {
        content.video = buffer
        if (caption) content.caption = caption
      } else {
        content.audio = buffer
        content.mimetype = quotedMsg.audioMessage.mimetype || 'audio/mp4'
        content.ptt = quotedMsg.audioMessage.ptt || false
      }

      const generated = await generateWAMessageContent(content, {
        upload: sock.waUploadToServer
      })

      const innerKey = mediaType === 'image'
        ? 'imageMessage'
        : mediaType === 'video'
        ? 'videoMessage'
        : 'audioMessage'

      generated[innerKey].contextInfo = {
        statusAttributions: [{ type: 10 }],
        statusSourceType: 1,
        statusAudienceMetadata: { audienceType: 1 }
      }

      await sock.relayMessage(
        m.chat,
        { groupStatusMessageV2: { message: generated } },
        {}
      )

      return sock.reply(m.chat, '✅ Estado multimedia enviado al grupo.', m, m.rcanal)
    }

    if (!caption) {
      return sock.reply(
        m.chat,
        '📌 Uso:\n• .swgc <texto> → estado de texto\n• Responde a una foto/video/audio con .swgc [texto opcional] → estado multimedia',
        m,
        m.rcanal
      )
    }

    await sock.relayMessage(
      m.chat,
      {
        groupStatusMessageV2: {
          message: {
            extendedTextMessage: {
              text: caption,
              backgroundArgb: color.bg,
              textArgb: 0xffffffff,
              font: color.font,
              contextInfo: {
                statusAttributions: [{ type: 10 }],
                statusSourceType: 1,
                statusAudienceMetadata: { audienceType: 1 }
              }
            }
          }
        }
      },
      {}
    )

    sock.reply(m.chat, '✅ Estado de texto enviado al grupo.', m, m.rcanal)
  }
}