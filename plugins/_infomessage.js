let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
let linkRegex1 = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i
let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import { areJidsSameUser } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'
import ws from 'ws'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return

const groupAdmins = participants.filter(p => p.admin)
const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n')
const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text)
const grupo = `https://chat.whatsapp.com`
const usuario = `@${m.sender.split`@`[0]}`
const groupName = (await conn.groupMetadata(m.chat)).subject
const groupAdmins = participants.filter((p) => p.admin)
const img = imagen1
const chat = global.db.data.chats[m.chat]
const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)]
const mentionsContentM = [m.sender, m.messageStubParameters[0]]
const vn = 'https://qu.ax/Deuut.mp3'
const vn2 = 'https://qu.ax/OzTbp.mp3'
const delet = m.key.participant
const bang = m.key.id
const bot = global.db.data.settings[conn.user.jid] || {}
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const participants = m.isGroup ? (await conn.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const mainBotInGroup = participants.some(p => p.id === global.conn.user.jid)
const primaryBot = chat.primaryBot
const primaryBotConnected = users.some(conn => conn.user.jid === primaryBot)
const primaryBotInGroup = participants.some(p => p.id === primaryBot)


const getMentionedJid = () => {
return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`)
}

let who = m.messageStubParameters[0] + '@s.whatsapp.net'
let user = global.db.data.users[who]
let userName = user ? user.name : await conn.getName(who)

if (chat.detect && m.messageStubType == 2) {
const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
const sessionPath = './MeguminSession/'
for (const file of await fs.readdir(sessionPath)) {
if (file.includes(uniqid)) {
await fs.unlink(path.join(sessionPath, file))
console.log(`${chalk.yellow.bold('[ ⚠️ Archivo Eliminado ]')} ${chalk.greenBright(`'${file}'`)}\n` +
`${chalk.blue('(Session PreKey)')} ${chalk.redBright('que provoca el "undefined" en el chat')}`
)}}

} if (primaryBot) {
if (primaryBotConnected && primaryBotInGroup) {
if (conn.user.jid !== primaryBot) return 
} if (mainBotInGroup) {
if (conn.user.jid !== global.conn.user.jid) return
}

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

} if (Object.values(global.db.data.users)) {
if (user.premiumTime != 0 && user.premium) {
if (new Date() * 1 >= user.premiumTime) {
user.premiumTime = 0;
user.premium = false;
const JID = Object.keys(global.db.data.users).find((key) => global.db.data.users[key] === user);
const usuarioJid = JID.split`@`[0];
const textoo = `🤍 @${usuarioJid} Se agotó tu tiempo como usuario premium`;
await conn.sendMessage(JID, {text: textoo, mentions: [JID]}, {quoted: ''})}}

} if (isBotAdmin && chat.antifake) {
if (m.sender.startsWith('6' || '6')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('90' || '90')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('212' || '212')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('92' || '92')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('93' || '93')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('94' || '94')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('7' || '7')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('49' || '49')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('2' || '2')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('48' || '48')) {
global.db.data.users[m.sender].block = true
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}

} if (m.isGroup) return
if (!m.message) return
if (bot.antiPrivate && !isROwner) {
await conn.reply(m.chat, `💣 Hola, adiós tengo que bloquearte por orden de mi propietario.\n\n*Channel:*\n> https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p`, m)
await conn.updateBlockStatus(m.chat, 'block')
return

} if (m.id.startsWith('3EB0') && m.id.length === 22) {
if (chat.antiBot) {
if (isBotAdmin) {
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}}

} if (isBotAdmin && chat.autoRechazar) {
const prefixes = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']
if (prefixes.some(prefix => m.sender.startsWith(prefix))) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

} if (!chat.antiBot2) {
return
}
let botJid = global.conn.user.jid
if (botJid === conn.user.jid) {
return
} else {
let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id))
if (isBotPresent) {
await conn.groupLeave(m.chat)}

} if (chat.autoAceptar && !isAdmin) {
if (!isBotAdmin) return !0
const participants = await conn.groupRequestParticipantsList(m.chat)
const latinPrefix = '5'
const filteredParticipants = participants.filter(p => p.jid.includes('@s.whatsapp.net') && p.jid.split('@')[0].startsWith(latinPrefix))
for (const participant of filteredParticipants) {
await conn.groupRequestParticipantsUpdate(m.chat, [participant.jid], "approve")}
if (m.messageStubType === 172 && m.messageStubParameters) {
const [jid] = m.messageStubParameters
if (jid.includes('@s.whatsapp.net') && jid.split('@')[0].startsWith(latinPrefix)) {
await conn.groupRequestParticipantsUpdate(m.chat, [jid], "approve")}}

} if (chat.detect && m.messageStubType == 29) {
let txt1 = `🚩 @${m.messageStubParameters[0].split`@`[0]} ha sido promovido a Administrador por @${m.sender.split`@`[0]}`
await conn.sendMessage(m.chat, { text: txt1, mentions: [...txt1.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net') })

} if (chat.detect && m.messageStubType == 30) {
let txt2 = `🚩 @${m.messageStubParameters[0].split`@`[0]} ha sido degradado de Administrador por @${m.sender.split`@`[0]}`
await conn.sendMessage(m.chat, { text: txt2, mentions: [...txt2.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net') })

} if (chat.welcome && m.messageStubType === 27) { 
this.sendMessage(m.chat, { audio: { url: vn }, contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid: "120363358338732714@newsletter", newsletterName: '─͟͞̟𝑴𝒆𝒈𝒖͜𝒎͜𝒊𝒏-𝑩͜𝒐𝒕-𝑴𝑫͟͞─' }, mentionedJid: getMentionedJid() }, ptt: true, fileName: `welcome.mp3`}, { quoted: fkontak })

} if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) { 
this.sendMessage(m.chat, { audio: { url: vn2 }, contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid: "120363358338732714@newsletter", newsletterName: '─͟͞̟𝑴𝒆𝒈𝒖͜𝒎͜𝒊𝒏-𝑩͜𝒐𝒕-𝑴𝑫͟͞─' }, mentionedJid: getMentionedJid() }, ptt: true, fileName: `goodbye.mp3` }, { quoted: fkontak })

} else {
if (m.messageStubType == 2) return
console.log({messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType], 
})
}}

export default handler
