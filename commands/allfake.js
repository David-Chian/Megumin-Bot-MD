export async function before(m, { client }) {
let bot = global.db.data.settings[client.user.id.split(':')[0] + "@s.whatsapp.net"]
let botname = bot.namebot
let botname2 = bot.namebot2
let icon = bot.icon

var canal = 'https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p'
var canal2 = 'https://whatsapp.com/channel/0029Vaxr2YgLCoWy2NS1Ab0a'
var gpo = "https://chat.whatsapp.com/JrO1REb8ESRAKgRQKaF8KC?mode=ac_t"

global.redes = [canal, canal2, gpo][Math.floor(Math.random() * 3)]

global.rcanal = {contextInfo: {forwardingScore: 2026, isForwarded: true, externalAdReply: {title: botname, body: dev, sourceUrl: redes, thumbnailUrl: icon}}}
}