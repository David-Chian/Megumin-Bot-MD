let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i
import { WAMessageStubType, areJidsSameUser } from '@whiskeysockets/baileys'
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
const img = imagen1
const chat = global.db.data.chats[m.chat]
const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)]
const mentionsContentM = [m.sender, m.messageStubParameters[0]]
const vn = 'https://qu.ax/OzTbp.mp3'
const vn2 = 'https://qu.ax/OzTbp.mp3'
const delet = m.key.participant
const bang = m.key.id
const bot = global.db.data.settings[conn.user.jid] || {}
// const participants = m.isGroup ? (await conn.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const mainBotInGroup = participants.some(p => p.id === global.conn.user.jid)
const primaryBot = chat.primaryBot
const primaryBotConnected = users.some(conn => conn.user.jid === primaryBot)
const primaryBotInGroup = participants.some(p => p.id === primaryBot)
const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n')
const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text)
const grupo = `https://chat.whatsapp.com`

if (primaryBot) {
if (primaryBotConnected && primaryBotInGroup) {
if (conn.user.jid !== primaryBot) return 
} if (mainBotInGroup) {
if (conn.user.jid !== global.conn.user.jid) return
}}

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
`${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`
)}}

} if (chat.detect && m.messageStubType == 29) {
await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: null })
return

} if (chat.detect && m.messageStubType == 30) {
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: null })
return

} if (isBotAdmin && chat.autoRechazar) {
const prefixes = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']
if (prefixes.some(prefix => m.sender.startsWith(prefix))) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

} if (chat.autoAceptar && isBotAdmin) {
const participants2 = await conn.groupRequestParticipantsList(m.chat)
const filteredParticipants = participants2.filter(p => p.jid.includes('@s.whatsapp.net') && p.jid.split('@')[0].startsWith('5'))
for (const participant of filteredParticipants) {
await conn.groupRequestParticipantsUpdate(m.chat, [participant.jid], "approve")
} if (m.messageStubType === 172 && m.messageStubParameters?.[0]?.includes('@s.whatsapp.net')) {
const jid = m.messageStubParameters[0]
if (jid.split('@')[0].startsWith('5')) {
await conn.groupRequestParticipantsUpdate(m.chat, [jid], "approve")}}

} if (chat.welcome && m.messageStubType === 27) {
let welcomeMessage = `*╭┉┉┉┉ᷜ┈ͦ┈ͭ┈ͦ┈ͬ┈ͥ┈┈ᷨ┈ͦ┈ͭ┉┉┉᛫᛭*
*│  ̇─̣─̇─̣〘 ¡¡ 𝐇𝐨𝐥𝐚 !! 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│⑄▷ Bienvenido @${who.split('@')[0]}*
*│ _Bіᥱᥒ᥎ᥱᥒіძ᥆ ᥲ_*
*│ _${groupMetadata.subject}_*
*│ _Dіs𝖿rᥙ𝗍ᥲ 𝗍ᥙ ᥱs𝗍ᥲძіᥲ._ 💖*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

let buttonMessage = { document: { url: vn }, mimetype: 'audio/mpeg', fileName: 'Bіᥱᥒ᥎ᥱᥒіძᥲ 🎉', fileLength: '99999999999999', pageCount: 1, contextInfo: { externalAdReply: { showAdAttribution: true, mediaType: 1, previewType: 'PHOTO', title: '──͟͞ 𝗪 𝗘 𝗟 𝗖 𝗢 𝗠 𝗘 ͟͞──', thumbnail: welc, renderLargerThumbnail: true, sourceUrl: redes, }, mentionedJid: await conn.parseMention(welcomeMessage)}, caption: welcomeMessage, }

await conn.sendMessage(m.chat, buttonMessage, { mentions: await conn.parseMention(welcomeMessage) })

} if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
let byeMessage = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─*
*┆──〘 𝐀𝐝𝐢𝐨𝐬𝐢𝐭𝐨 ^^  〙───*
*┆┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ*
*┆ _☠ sᥱ 𝖿ᥙᥱ @${who.split('@')[0]}_*
*┆ _𝗊ᥙᥱ ძі᥆s ᥣ᥆ ᑲᥱᥒძіgᥲ️_* 
*┆ _ᥡ ᥣ᥆ ᥲ𝗍r᥆⍴ᥱᥣᥣᥱ ᥙᥒ 𝗍rᥱᥒ 😇_*
*╰─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄ׂ*`;

let buttonMessage = { document: { url: vn2 }, mimetype: 'audio/mpeg', fileName: 'Dᥱs⍴ᥱძіძᥲ 🖤', fileLength: '99999999999999', pageCount: 1, contextInfo: { externalAdReply: { showAdAttribution: true, mediaType: 1, previewType: 'PHOTO', title: '──͟͞ 𝗔 𝗗 𝗜 𝗢 𝗦 ͟͞──', thumbnail: adi, renderLargerThumbnail: true, sourceUrl: redes, }, mentionedJid: await conn.parseMention(byeMessage) }, caption: byeMessage, }

await conn.sendMessage(m.chat, buttonMessage, { mentions: await conn.parseMention(byeMessage) })

} if (!m.isGroup) return 
if (isAdmin || isOwner || m.fromMe || isROwner) return
if (isAdmin && chat.antiLink && m.text.includes(grupo)) return
if (chat.antiLink && isGroupLink && !isAdmin) {
if (isBotAdmin) {
const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
if (m.text.includes(linkThisGroup)) return
} if (!isBotAdmin) return conn.sendMessage(m.chat, { text: `🚩 El antilink está activo pero no puedo eliminarte porque no soy adm.`, mentions: [...groupAdmins.map(v => v.id)] }, { quoted: m })
if (isBotAdmin) {
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
let responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
return
}

} if (isBotAdmin && chat.antifake) {
const antiFakePrefixes = ['6', '90', '212', '92', '93', '94', '7', '49', '2', '91', '48']
if (antiFakePrefixes.some(prefix => m.sender.startsWith(prefix))) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}

} if (m.isGroup) return
if (!m.message) return
if (bot.antiPrivate && !isROwner) {
await conn.reply(m.chat, `💣 Hola, adiós tengo que bloquearte por orden de mi propietario.\n\n*Channel:*\n> https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p`, m)
await conn.updateBlockStatus(m.chat, 'block')
return

} else {
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})
}}

export default handler
