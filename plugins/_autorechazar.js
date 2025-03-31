let handler = m => m
handler.before = async function (m, { conn, isBotAdmin }) {

let chat = globalThis.db.data.chats[m.chat];

if (isBotAdmin && chat.autoRechazar) {
const prefixes = ['595', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '49', '2', '91', '48']
if (prefixes.some(prefix => m.sender.startsWith(prefix))) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}}

}
export default handler