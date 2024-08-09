import db from '../lib/database.js'
let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin} ) {
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
if (isBotAdmin && chat.antifake) {
let texto = `᥀·࣭࣪̇˖✨️◗ 𝙃𝙤𝙡𝙖 *@${m.sender.split`@`[0]}*, 𝙡𝙤𝙨 𝙣𝙪𝙢𝙚𝙧𝙤𝙨 𝙧𝙖𝙧𝙤𝙨 𝙣𝙤 𝙚𝙨𝙩𝙖𝙣 𝙥𝙚𝙧𝙢𝙞𝙩𝙞𝙙𝙤𝙨 𝙖𝙦𝙪𝙞, 𝙨𝙚𝙧𝙖𝙨 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤.`
if (m.sender.startsWith('6' || '6')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('90' || '90')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('92' || '92')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('93' || '93')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('94' || '94')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('7' || '7')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('49' || '49')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('2' || '2')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('48' || '48')) {
global.db.data.users[m.sender].block = true
await conn.reply(m.chat, texto, m)
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')} 
}}
export default handler
