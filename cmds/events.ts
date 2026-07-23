import chalk from 'chalk'
import moment from 'moment-timezone'
import fetch from 'node-fetch'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

export default async (sock, m) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      const metadata = await sock.groupMetadata(anu.id) || {}
      const chat = await getChat(anu.id)

      if (anu.action === 'remove' || anu.action === 'leave') {
        const primaryBot = chat?.primaryBot
        if (primaryBot) {
          const wasRemoved = anu.participants.some((p: any) => {
            const pRaw = typeof p === 'string' ? p : (p.phoneNumber || p.id || p.jid || p.lid || '')
            const pNum = String(pRaw).replace(/\D/g, '')
            const primaryNum = primaryBot.replace(/\D/g, '').replace('@s.whatsapp.net', '')
            return pNum === primaryNum
          })
          if (wasRemoved) {
            await updateChat(anu.id, 'primaryBot', null)
            clearCache('chat', anu.id)
          }
        }
      }

      const botId = sock?.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : ''
      const primaryBotId = chat?.primaryBot || ''

      const botSettings = await getSettings(botId)
      const isSelf = botSettings?.self ?? 0
      if (isSelf) return

      const now = new Date()
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
      const tiempo = colombianTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/,/g, '')
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

      const memberCount = metadata.participants?.length || 0
      const groupIcon = await sock.profilePictureUrl(anu.id, 'image').catch(_ => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg')

      const link = botSettings.link || ''
      const canalId = botSettings.id || ''
      const canalName = botSettings.nameid || ''
      const botname = botSettings.namebot || ''
      const botname2 = botSettings.namebot2 || ''

      for (const p of anu.participants) {
        const phone = p.phoneNumber ? p.phoneNumber.split('@')[0] : ''

        const userData = await getUser(phone + "@s.whatsapp.net")
        const name = userData?.name || phone

        const avatar = await sock.profilePictureUrl(p.phoneNumber, 'image').catch(_ => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg')

        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          let caption
          if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
            caption = chat.welcomeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`)
          } else {
            caption = `*╭  ╌   ╲   ◦  ╱  ╌  ╮*\n*˙· ▧+ ➤ ❮ 𝐖ᥱᥣᥴ᥆mᥱ ❯*\n*˙·.˙˙·᭚──────᭸─◠─〰─◠─*\n│᭐▷ @${phone}\n*│ _ᗷіᥱᥒ᥎ᥱᥒіძ᥆ ᥲ_*\n*│ _${metadata.subject || ''}_*\n*│ _ძіs𝖿rᥙ𝗍ᥲ 𝗍ᥙ ᥱs𝗍ᥲძіᥲ._ 💖*\n*│ _𝐘ᥲ s᥆m᥆s ${memberCount} ⍴ᥲr𝗍іᥴі⍴ᥲᥒ𝗍ᥱs_*\n*╰᚛     ╌   ╱  ⬩  ╲   ╌     ᚜╯*`
          }
          const apiUrl = `${api.url}/generate/welcome-image?username=${encodeURIComponent(name)}&guildName=${encodeURIComponent(metadata.subject || '')}&guildIcon=${encodeURIComponent(avatar)}&memberCount=${memberCount}&avatar=${encodeURIComponent(groupIcon)}&background=${encodeURIComponent(botSettings.banner || '')}`

          try {
            const res = await fetch(apiUrl)
            const contentType = res.headers.get('content-type') || ''
            if (!contentType.startsWith('image/')) {
              const errBody = await res.text().catch(() => '')
              await sock.sendMessage(anu.id, { text: caption, mentions: [p.phoneNumber] })
              continue
            }
            const rawBuffer = Buffer.from(await res.arrayBuffer())
            const compressedBuffer = await sharp(rawBuffer)
              .jpeg({ quality: 70 })
              .toBuffer()
            const thumbnailMedia = await prepareWAMessageMedia(
              { image: compressedBuffer },
              { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
            )

            const welcomeText = `${link}\n\n${caption}`

            await sock.sendMessage(anu.id, {
              text: welcomeText,
              linkPreview: link
                ? {
                    'canonical-url': link,
                    'matched-text': link,
                    title: botname || `ꕤ ${name}`,
                    description: dev || `Bienvenid@ a ${metadata.subject || ''}`,
                    jpegThumbnail: thumbnailMedia?.imageMessage?.jpegThumbnail
                      ? Buffer.from(thumbnailMedia.imageMessage.jpegThumbnail)
                      : undefined,
                    highQualityThumbnail: thumbnailMedia?.imageMessage || undefined,
                  }
                : undefined,
              mentions: [p.phoneNumber],
            })
          } catch (apiErr) {
            await sock.sendMessage(anu.id, { text: caption, mentions: [p.phoneNumber] })
          }
        }

        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          let caption
          if (chat.byeMessage && chat.byeMessage.trim() !== '') {
            caption = chat.byeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`)
          } else {
              caption = `
╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ
┆──〘 𝐀𝐝𝐢𝐨𝐬𝐢𝐭𝐨 ^^  〙───
┆┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ
┆ *_☠ Se fue* @${phone}
┆ *_Que dios lo bendiga️_* \n┆ *_Y lo atropelle un tren 😇_*
┊ _*Ahora somos ${memberCount} miembros.*_
╰─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄ׂ`
          }

          const apiUrl = `${api.url}/generate/bye-image?username=${encodeURIComponent(name)}&guildName=${encodeURIComponent(metadata.subject || '')}&guildIcon=${encodeURIComponent(avatar)}&memberCount=${memberCount}&avatar=${encodeURIComponent(groupIcon)}&background=${encodeURIComponent(botSettings.banner || '')}`

          try {
            const res = await fetch(apiUrl)
            const contentType = res.headers.get('content-type') || ''
            if (!contentType.startsWith('image/')) {
              const errBody = await res.text().catch(() => '')
              await sock.sendMessage(anu.id, { text: caption, mentions: [p.phoneNumber] })
              continue
            }

            const rawBuffer = Buffer.from(await res.arrayBuffer())

            const compressedBuffer = await sharp(rawBuffer)
              .jpeg({ quality: 70 })
              .toBuffer()

            const thumbnailMedia = await prepareWAMessageMedia(
              { image: compressedBuffer },
              { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
            )

            const byeText = `${link}\n\n${caption}`

            await sock.sendMessage(anu.id, {
              text: byeText,
              linkPreview: link
                ? {
                    'canonical-url': link,
                    'matched-text': link,
                    title: botname || `ꕤ ${name}`,
                    description: dev || `Hasta luego, ${metadata.subject || ''}`,
                    jpegThumbnail: thumbnailMedia?.imageMessage?.jpegThumbnail
                      ? Buffer.from(thumbnailMedia.imageMessage.jpegThumbnail)
                      : undefined,
                    highQualityThumbnail: thumbnailMedia?.imageMessage || undefined,
                  }
                : undefined,
              mentions: [p.phoneNumber],
            })
          } catch (apiErr) {
            console.log(chalk.red(`[ BYE API ERROR ] → ${apiErr}`))
            await sock.sendMessage(anu.id, { text: caption, mentions: [p.phoneNumber] })
          }
        }

        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author || ''
          await sock.sendMessage(anu.id, {
            text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${usuario.split('@')[0]}.*`,
            mentions: [p.phoneNumber, usuario]
          })
        }

        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const usuario = anu.author || ''
          await sock.sendMessage(anu.id, {
            text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${usuario.split('@')[0]}.*`,
            mentions: [p.phoneNumber, usuario]
          })
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT ] → ${err?.stack || err}`))
    }
  })
}
