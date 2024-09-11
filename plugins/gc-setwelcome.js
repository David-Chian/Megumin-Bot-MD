let handler = async (m, { conn, text, isROwner, isOwner }) => {
let resp
const bot = global.db.data.bot[conn.user.jid] || {}
const chats = bot.chats || {}
const groups = chats.groups || {}
const chat = groups[m.chat] || {}

if (text) {
chat.sWelcome = text
resp = '*[❗] MENSAJE DE BIENVENIDA CONFIGURADO CORRECTAMENTE PARA ESTE GRUPO*'
} else {
resp = `*[❗] INGRESE EL MENSAJE DE BIENVENIDA QUE DESEE AGREGAR, USE:*\n*- @user (mención)*\n*- @group (nombre de grupo)*\n*- @desc (description de grupo)*`
}
let txt = '';
let count = 0;
for (const c of resp) {
await new Promise(resolve => setTimeout(resolve, 1));
txt += c;
count++;
if (count % 10 === 0) {
await conn.sendPresenceUpdate('composing' , m.chat);
}
}
return conn.sendMessage(m.chat, { text: txt.trim(), mentions: conn.parseMention(txt) }, {quoted: m, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})
}
handler.help = ['setwelcome <text>']
handler.tags = ['group']
handler.command = ['setwelcome'] 
handler.group = handler.admin = true
export default handler