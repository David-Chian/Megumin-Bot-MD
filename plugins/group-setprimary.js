import ws from 'ws';

let handler = async (m, { conn, usedPrefix, args }) => {

if (!args[0] && !m.quoted) return m.reply(`🚩 Menciona al bot que quieras convertirlo primario.`)
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
let chat = global.db.data.chats[m.chat]
let botJid
let selectedBot
if (m.mentionedJid && m.mentionedJid.length > 0) {
botJid = m.mentionedJid[0]
} else if (m.quoted) {
botJid = m.quoted.sender
} else {
botJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
} if (botJid === conn.user.jid || botJid === global.conn.user.jid) {
selectedBot = conn
} else {
selectedBot = users.find(conn => conn.user.jid === botJid)
} if (!selectedBot) {
return conn.reply(m.chat, `💣 El usuario mencionado no es un bot de MeguminBot.`, m)
} if (chat.primaryBot === botJid) {
return conn.reply(m.chat, `🚩 @${botJid.split`@`[0]} ya es el bot primario, no es necesario volverlo a poner.`, m, { mentions: [botJid] })
}
chat.primaryBot = botJid;
conn.sendMessage(m.chat, { text: `💣 @${botJid.split('@')[0]} ha sido establecido como primario en este grupo.`, mentions: [botJid]}, { quoted: m })
}

handler.help = ['setprimary <@bot>'];
handler.tags = ['group'];
handler.command = ['setprimary'];

export default handler;