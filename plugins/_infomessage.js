let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fetch from 'node-fetch'
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'
import ws from 'ws'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isBotAdmin, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return

    const usuario = `@${m.sender.split`@`[0]}`
    const groupName = (await conn.groupMetadata(m.chat)).subject
    const groupAdmins = participants.filter((p) => p.admin)
    const chat = global.db.data.chats[m.chat]
    const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)]
    const mentionsContentM = [m.sender, m.messageStubParameters[0]]

    const getMentionedJid = () => {
        return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`)
    }

    let who = m.messageStubParameters[0] + '@s.whatsapp.net'
    let user = global.db.data.users[who]
    let userName = user ? user.name : await conn.getName(who)
    let redes = `github.com/David-Chian`
    let adiosbye = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://qu.ax/fBuJM.jpg')
    let adi = await (await fetch(adiosbye)).buffer()
    let ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://qu.ax/zliac.jpg');
    let welc = await (await fetch(ppUrl)).buffer()
    let admingp = `💣 @${m.messageStubParameters[0].split`@`[0]} ha sido promovido a Administrador por ${usuario}`
    let noadmingp = `💣 @${m.messageStubParameters[0].split`@`[0]} ha sido degradado de Administrador por ${usuario}`

    if (chat.detect && m.messageStubType == 2) {
        const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
        const sessionPath = './MeguminSession/'
        for (const file of await fs.readdir(sessionPath)) {
            if (file.includes(uniqid)) {
                await fs.unlink(path.join(sessionPath, file))
                console.log(`${chalk.yellow.bold('[ ⚠️ Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
                `${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`)
            }
        }
    }
    if (chat.detect && m.messageStubType == 29) {
        await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: null })
        return
    }
    if (chat.detect && m.messageStubType == 30) {
        await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: null })
        return
    }
    // Bloques de bienvenida y despedida (27/28/32) han sido eliminados

    else {
        if (m.messageStubType == 2) return
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType], 
        })
    }
}

export default handler