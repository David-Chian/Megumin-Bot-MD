let handler  = async (m, { conn }) => {
if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `🍟 El Bot principal no se puede apagar.`, m, fake)
else {
await conn.reply(m.chat, `🚩 Adiós Ai`, m, fake)
conn.ws.close()
}}
handler.help = ['detener']
handler.tags = ['serbot']
handler.command = ['stop', 'apagar', 'detener', 'apagate', 'detenerai', 'aioff']

export default handler