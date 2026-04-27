import chalk from 'chalk'
import moment from 'moment-timezone'

export const participantsUpdate = async (client, anu) => {
    try {
        const metadata = await client.groupMetadata(anu.id)
        const chat = global.db.data.chats[anu.id]
        const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const primaryBotId = chat?.primaryBot

        const now = new Date()
        const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
        const tiempo = colombianTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/,/g, '')
        const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

        let memberCount = metadata.participants.length
 
        if (anu.action === 'add') memberCount += 1
        if (anu.action === 'remove' || anu.action === 'leave') memberCount -= 1

        for (const p of anu.participants) {
            const jid = p.phoneNumber || p
            const phone = jid.split('@')[0]
            const pp = await client.profilePictureUrl(jid, 'image').catch(_ => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg')

            const botSettings = global.db.data.settings[botId] || {}
            const fakeContext = {
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: botSettings.id,
                        serverMessageId: '0',
                        newsletterName: botSettings.nameid
                    },
                    externalAdReply: {
                        title: botSettings.namebot,
                        body: global.dev || 'Megumin-Bot-MD',
                        mediaUrl: null,
                        description: null,
                        previewType: 'PHOTO',
                        thumbnailUrl: botSettings.icon,
                        sourceUrl: botSettings.link,
                        mediaType: 1,
                        renderLargerThumbnail: false
                    },
                    mentionedJid: [jid, anu.author].filter(Boolean)
                }
            }

            if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
                const caption = `
╭┄┈┈┈֗┄፞┈֯┈፞┈֗┈┈┄┈─⟢ࣰ
┊「 *ᗷіᥱᥒ᥎ᥱᥒіძ᥆ ˃͈◡˂͈* 」
┊ᨏᨐᨓᨒᨓᨐᨏᨕ
┊  *Usuario ›* @${phone}
┊  *Grupo ›* ${metadata.subject}
┊╌ ╌ ╌ ╴⵿⋱ ּ ׅ⃞💐ׅ᪲⃞ ּ ⋰⵿╶๋݄╌ ╌ ╌⍣⃝
┊➤ *Usa /menu para ver los comandos.*
┊➤ *Ahora somos ${memberCount} miembros.*
┊ ︿︿︿︿︿︿︿︿︿︿︿
╰─────────────────╯`
                await client.sendMessage(anu.id, { 
                    image: { url: pp }, 
                    caption: caption, 
                    mentions: [jid],
                    ...fakeContext 
                })
            }
            if ((anu.action === 'remove' || anu.action === 'leave') && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
                const caption = `
╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ
┆──〘 𝐀𝐝𝐢𝐨𝐬𝐢𝐭𝐨 ^^  〙───
┆┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ
┆ *_☠ Se fue* @${phone}
┆ *_Que dios lo bendiga️_* \n┆ *_Y lo atropelle un tren 😇_*
┊ _*Ahora somos ${memberCount} miembros.*_
╰─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄ׂ`
                await client.sendMessage(anu.id, { 
                    image: { url: pp }, 
                    caption: caption, 
                    mentions: [jid],
                    ...fakeContext 
                })
            }

            if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
                const usuario = anu.author
                await client.sendMessage(anu.id, {
                    text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${usuario?.split('@')[0] || 'Sistema'}.*`,
                    mentions: [jid, usuario].filter(Boolean)
                })
            }

            if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
                const usuario = anu.author
                await client.sendMessage(anu.id, {
                    text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${usuario?.split('@')[0] || 'Sistema'}.*`,
                    mentions: [jid, usuario].filter(Boolean)
                })
            }
        }
    } catch (err) {
        console.log(chalk.gray(`[ EVENT ERROR ]  → ${err}`))
    }
}
