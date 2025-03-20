var handler = async (m, { conn, args }) => {

let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
conn.reply(m.chat, link, m)

}
handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link','linkgroup']

handler.botAdmin = true

export default handler