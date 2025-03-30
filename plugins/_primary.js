import ws from 'ws'

export async function before(m, { conn }) {

let chat = global.db.data.chats[m.chat]
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const participants = m.isGroup ? (await conn.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []

const mainBotInGroup = participants.some(p => p.id === global.conn.user.jid)
const primaryBot = chat.primaryBot
const primaryBotConnected = users.some(conn => conn.user.jid === primaryBot)
const primaryBotInGroup = participants.some(p => p.id === primaryBot)

if (primaryBot) {
if (primaryBotConnected && primaryBotInGroup) {
if (this.user.jid !== primaryBot) throw !1
} else if (mainBotInGroup) {
if (this.user.jid !== global.conn.user.jid) throw !1
}}
}