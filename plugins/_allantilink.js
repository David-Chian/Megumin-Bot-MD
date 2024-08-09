import fetch from 'node-fetch'  
const isLinkTik = /tiktok.com/i 
const isLinkYt = /youtube.com|youtu.be/i 
const isLinkTel = /telegram.com/i 
const isLinkFb = /facebook.com|fb.me/i 
const isLinkIg = /instagram.com/i 
const isLinkTw = /twitter.com/i 
  
let handler = m => m
handler.before = async function (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) {
if (m.isBaileys && m.fromMe)
return !0
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
let bot = global.db.data.settings[this.user.jid] || {}
let delet = m.key.participant
let bang = m.key.id
let toUser = `${m.sender.split("@")[0]}`
let aa = toUser + '@s.whatsapp.net'
    
const isAntiLinkTik = isLinkTik.exec(m.text)
const isAntiLinkYt = isLinkYt.exec(m.text)
const isAntiLinkTel = isLinkTel.exec(m.text)
const isAntiLinkFb = isLinkFb.exec(m.text)
const isAntiLinkIg = isLinkIg.exec(m.text)
const isAntiLinkTw = isLinkTw.exec(m.text)
 
if (chat.antiTiktok && isAntiLinkTik) {  
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`TikTok\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}
    
if (chat.antiYoutube && isAntiLinkYt) {
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`YouTube\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}  
    
if (chat.antiTelegram && isAntiLinkTel) {
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`Telegram\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}    
    
if (chat.antiFacebook && isAntiLinkFb) {
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`Facebook\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}  
    
if (chat.antiInstagram && isAntiLinkIg) {
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`Instagram\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}
    
if (chat.antiTwitter && isAntiLinkTw) {
if (isBotAdmin && bot.restrict) {
await conn.reply(m.chat, `『✦』Se detecto un enlace de \`Twitter\`.\nSeras eliminado/a: *@${toUser}*`, null, { mentions: [aa] })
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
} else if (!isBotAdmin) {
return m.reply(`『✦』El bot no es admin, no puedo eliminar personas.`)
} else if (!bot.restrict) {
return m.reply(`『✦』Las restricciones no estan activas.`)
}}
return !0
}
export default handler