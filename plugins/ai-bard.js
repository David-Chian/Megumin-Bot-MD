import fetch from 'node-fetch'

var handler = async (m, { text,  usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `🍟 *Ingresé una petición*\n\nEjemplo, ${usedPrefix + command} Conoces a Megumin-Bot?`, m, rcanal)
try {
await m.react('🕒')
conn.sendPresenceUpdate('composing', m.chat)
var apii = await fetch(`https://aemt.me/bard?text=${text}`)
var res = await apii.json()
await conn.reply(m.chat, res.result, m, rcanal)
await m.react('✅️')
} catch (error) {
await m.react('✖️')
console.error(error)
return conn.reply(m.chat, '🚩 *Ocurrió un fallo*', m, rcanal)
}}

handler.command = ['bard']
handler.help = ['bard']
handler.group = true;
handler.register = true
handler.tags = ['ai']
handler.premium = false
export default handler