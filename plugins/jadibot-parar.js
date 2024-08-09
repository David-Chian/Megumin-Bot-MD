let handler  = async (m, { conn }) => {
if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `🚩 El Bot Principal No Se Puede Apagar`, m, rcanal, )
else {
await conn.reply(m.chat, `🍟 Subbot Desactivado`, m, rcanal, )
conn.ws.close()
}}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
handler.private = true
handler.register = true
export default handler