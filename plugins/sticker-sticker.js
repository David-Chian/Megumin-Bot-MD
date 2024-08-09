import { sticker } from '../lib/sticker.js'
//import uploadFile from '../lib/uploadFile.js'
//import uploadImage from '../lib/uploadImage.js'
//import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {

let stiker = false
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (/webp|image|video/g.test(mime)) {
if (/video/g.test(mime)) if ((q.msg || q).seconds > 8) return m.reply(`☁️ *¡El video no puede durar mas de 8 segundos!*`)
let img = await q.download?.()

if (!img) return conn.reply(m.chat, `⚠️ *_La conversión ha fallado, intenta enviar primero imagen/video/gif y luego responde con el comando._*`, m, rcanal)

let out
try {
stiker = await sticker(img, false, global.packsticker, global.author)
} catch (e) {
console.error(e)
} finally {
if (!stiker) {
if (/webp/g.test(mime)) out = await webp2png(img)
else if (/image/g.test(mime)) out = await uploadImage(img)
else if (/video/g.test(mime)) out = await uploadFile(img)
if (typeof out !== 'string') out = await uploadImage(img)
stiker = await sticker(false, out, global.packsticker, global.author)
}}
} else if (args[0]) {
if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packsticker, global.author)

else return m.reply(`💫 El url es incorrecto`)

}
} catch (e) {
console.error(e)
if (!stiker) stiker = e
} finally {
if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: packname, body: `⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐`, mediaType: 2, sourceUrl: redes, thumbnail: icons}}}, { quoted: m })

else return conn.reply(m.chat, '⚠️ *_La conversión ha fallado, intenta enviar primero imagen/video/gif y luego responde con el comando._*', m, rcanal)


}}
handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.group = true;
handler.register = true
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))}