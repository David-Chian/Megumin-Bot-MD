let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import fetch from 'node-fetch'
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return

let usuario = `@${m.sender.split`@`[0]}`
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

} if (m.id.startsWith('3EB0') && m.id.length === 22) {
if (chat.antiBot) {
if (isBotAdmin) {
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}}
} if (isBotAdmin && chat.autoRechazar) {
const prefixes = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']
if (prefixes.some(prefix => m.sender.startsWith(prefix))) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}
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
