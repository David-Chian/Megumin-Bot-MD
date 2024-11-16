import db from '../lib/database.js'
let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin} ) {
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
if (isBotAdmin && chat.autoRechazar) {
if (m.sender.startsWith('6')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('90')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('963')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('966')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('967')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('249')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('212')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('92')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('93')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('94')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('7')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('49')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('2')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('48')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')} 
}}
export default handler