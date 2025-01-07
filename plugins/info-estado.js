import ws from 'ws'
let handler = async (m, { conn, usedPrefix, isRowner}) => {
let _muptime
let totalreg = Object.keys(global.db.data.users).length
let totalchats = Object.keys(global.db.data.chats).length
let pp = "https://qu.ax/xFjxD.jpg"
if (process.send) {
process.send('uptime')
_muptime = await new Promise(resolve => {
process.once('message', resolve)
setTimeout(resolve, 1000)
}) * 1000
}
let muptime = clockString(_muptime)
let users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
const groupsIn = chats.filter(([id]) => id.endsWith('@g.us')) 
const totalUsers = users.length;
let old = performance.now()
let neww = performance.now()
let speed = neww - old
const used = process.memoryUsage()
let megumin = `⭐️ \`\`\`Información - MeguminBot\`\`\` ⭐️\n\n`
megumin += `🍄 *◜Creador◞* ⇢ David-Chian\n`
megumin += `❗️ *◜Prefijo◞* ⇢ [ ${usedPrefix} ]\n`
megumin += `🌺꙰ *◜Versión◞* ⇢ ${vs}\n`
megumin += `🌻꙰ *◜Chats Privados◞* ⇢ ${chats.length - groupsIn.length}\n`
megumin += `💥 *◜Total De Chats◞* ⇢ ${chats.length}\n`
megumin += `👥️️ *◜Usuarios◞* ⇢ ${totalreg}\n`
megumin += `🔒 *◜Chats Privados◞* ⇢ ${chats.length - groupsIn.length}\n`
megumin += `📌 *◜Grupos◞* ⇢ ${groupsIn.length}\n`
megumin += `🕝 *◜Actividad◞* ⇢ ${muptime}\n`
megumin += `🚀 *◜Velocidad◞* ⇢ ${(speed * 1000).toFixed(0) / 1000}\n`
megumin += `🪴 *◜SubBots Activos◞* ⇢ ${totalUsers || '0'}`
await conn.sendFile(m.chat, pp, 'megumin.jpg', megumin, m, null, rcanal)
}
handler.help = ['status']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats']
handler.register = true
export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
console.log({ms,h,m,s})
return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')}