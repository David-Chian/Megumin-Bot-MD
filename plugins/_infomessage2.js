let handler = m => m
handler.before = async function (m, { conn, isBotAdmin }) {

let chat = globalThis.db.data.chats[m.chat];

if (isBotAdmin && chat.autoRechazar) {
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
await conn.groupRequestParticipantsUpdate(m.chat, [jid], "approve")}}}

}
export default handler
