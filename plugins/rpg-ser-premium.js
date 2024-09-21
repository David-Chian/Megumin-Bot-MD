let handler = async (m, { conn, text, usedPrefix, command, args }) => {

let toUser = `${m.sender.split("@")[0]}`
let aa = toUser + '@s.whatsapp.net'        
let template = (args[0] || '').toLowerCase() 
if (/comprar|prem1/i.test(command)) {
var tiempoPremium = 5 * text 
var tiempoDecretado = 5 * 1 
const gata = 15
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝗜𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} MIMUTOS*\n*✤ ${gata} ${rpgshop.emoticon('cookies')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `$𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.cookies < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('cookies')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('cookies')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.cookies -= gata * text

var tiempo = 300000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}

if (/prem2/i.test(command)) {
var tiempoPremium = 15 * text 
var tiempoDecretado = 15 * 1 
const gata = 35
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈*\n\n*✤ 🎟️ 1 = ${tiempoDecretado} MIMUTOS*\n*✤ ${gata} ${rpgshop.emoticon('kyubi')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.kyubi < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('kyubi')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('kyubi')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.kyubi -= gata * text

var tiempo = 900000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}

if (/prem3/i.test(command)) {
var tiempoPremium = 30 * text 
var tiempoDecretado = 30 * 1 
const gata = 25
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝗜𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} MIMUTOS*\n*✤ ${gata} ${rpgshop.emoticon('emerald')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.emerald < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('emerald')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('emerald')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.emerald -= gata * text

var tiempo = 1800000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}

if (/prem4/i.test(command)) {
var tiempoPremium = 1 * text 
var tiempoDecretado = 1 * 1 
const gata = 50
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} HORA(S)*\n*✤ ${gata} ${rpgshop.emoticon('trash')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.trash < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('trash')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('trash')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.trash -= gata * text

var tiempo = 3600000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}

if (/prem5/i.test(command)) {
var tiempoPremium = 3 * text 
var tiempoDecretado = 3 * 1 
const gata = 40
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} HORA(S)*\n*✤ ${gata} ${rpgshop.emoticon('berlian')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.berlian < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('berlian')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('berlian')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.berlian -= gata * text

var tiempo = 10800000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}


if (/prem6/i.test(command)) {
var tiempoPremium = 7 * text 
var tiempoDecretado = 7 * 1 
const gata = 70
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} HORA(S)*\n*✤ ${gata} ${rpgshop.emoticon('joincount')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.joincount < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('joincount')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('joincount')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.joincount -= gata * text

var tiempo = 25200000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min*
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}


if (/prem7/i.test(command)) {
var tiempoPremium = 24 * text 
var tiempoDecretado = 24 * 1   
const gata = 65
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} HORA(S)*\n*✤ ${gata} ${rpgshop.emoticon('diamond')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.diamond < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('diamond')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 *${rpgshopp.emoticon('diamond')}* 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.diamond -= gata * text

var tiempo = 86400000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}


if (/prem8/i.test(command)) {
var tiempoPremium = 3 * text  
var tiempoDecretado = 3 * 1 
const gata = 80
let user = global.db.data.users[m.sender]

if (!text) return conn.reply(m.chat, `𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙄𝙀𝙈𝙋𝙊 𝙋𝙍𝙀𝙈𝙄𝙐𝙈\n\n*✤ 🎟️ 1 = ${tiempoDecretado} DÍA(S)*\n*✤ ${gata} ${rpgshop.emoticon('gold')}*\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (isNaN(text)) return conn.reply(m.chat, `𝙎𝙊𝙇𝙊 𝙎𝙀 𝘼𝘾𝙀𝙋𝙏𝘼 𝙉𝙐𝙈𝙀𝙍𝙊𝙎\n\n*EJEMPLO: ${usedPrefix + command} 1*`, fkontak, m)
if (user.gold < gata) return conn.reply(m.chat, `𝙉𝙊 𝙏𝙄𝙀𝙉𝙀 𝙎𝙐𝙁𝙄𝘾𝙄𝙀𝙉𝙏𝙀𝙎 *${rpgshop.emoticon('gold')}* 𝙋𝘼𝙍𝘼 𝘼𝘿𝙌𝙐𝙄𝙍𝙄𝙍 🎟️ 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝘾𝙊𝙈𝙋𝙍𝙀 ${rpgshopp.emoticon('gold')} 𝙀𝙉 𝙇𝘼 𝙏𝙄𝙀𝙉𝘿𝘼 𝙐𝙎𝘼𝙉𝘿𝙊 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}buy* 𝙊 𝙋𝙐𝙀𝘿𝙀𝙎 𝙑𝙀𝙉𝘿𝙀𝙍 𝙋𝘼𝙍𝘼 𝙊𝘽𝙏𝙀𝙉𝙀𝙍 𝙂𝘼𝙉𝘼𝙉𝘾𝙄𝘼𝙎 𝘾𝙊𝙉 𝙀𝙇 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 *${usedPrefix}sell*`, fkontak, m)
user.gold -= gata * text

var tiempo = 259200000 * text 
var now = new Date() * 1
if (now < user.premiumTime) user.premiumTime += tiempo
else user.premiumTime = now + tiempo
user.premium = true
const imgpre = [ 
'https://logowiki.net/wp-content/uploads/imgp/Premium-Logo-1-5365.jpg', 
'https://i.imgur.com/oUAGYc2.jpg',
'https://i.imgur.com/i0pccuo.jpg'];

await conn.reply(m.chat, `*╭┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╮*
*┃🎟️ 𝙐𝙨𝙩𝙚𝙙 𝙖𝙝𝙤𝙧𝙖 𝙚𝙨 𝙥𝙧𝙚𝙢𝙞𝙪𝙢!!!*
*┃*
*┃✨ 𝙉𝙤𝙢𝙗𝙧𝙚:* » ${user.name}
*┃💰 𝙋𝙖𝙜𝙤:* »  -${gata * text} ${rpgshopp.emoticon('cookies')}
*┃👝 𝙏𝙚𝙣𝙞́𝙖:* » ${user.cookies + gata} ${rpgshopp.emoticon('cookies')}
*┃🛄 𝙇𝙚 𝙦𝙪𝙚𝙙𝙖𝙣:* » ${user.cookies} ${rpgshopp.emoticon('cookies')}
*┃🕐 𝙏𝙞𝙚𝙢𝙥𝙤:* » ${tiempoPremium} min
*╰┈┈┈┈┈◈ 🌟 ◈┈┈┈┈┈╯*\n\n💖 *Ahora tiene Premium por lo tanto no va tener límites.*\n\n${dev}`, fkontak, { mentions: [aa,] })}


if (command) {
switch (template) {                
case 'premium':
case 'vip':
case 'prem':
case 'pass':
case 'pase':
await conn.reply(m.chat, `${htki} *🎟️ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 🎟️* ${htka}\n\n🌟 𝗖𝗢𝗠𝗣𝗥𝗔 𝗨𝗡 𝗧𝗜𝗣𝗢 𝗗𝗘 𝗣𝗔𝗦𝗘 𝗣𝗔𝗥𝗔 𝗦𝗘𝗥 𝗨𝗡 𝗨𝗦𝗨𝗔𝗥𝗜𝗢(𝗔) 𝗣𝗥𝗘𝗠𝗜𝗨𝗠!!!\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n💎 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗖𝗟𝗔𝗦𝗘 ⓵\n✪${usedPrefix}prem1 1\n✪ 𝗣𝗮𝘀𝗲 𝗕𝗮𝘀𝗶𝗰𝗼\n✪ 15 ${rpgshop.emoticon('cookies')} ➟ 5 min 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n🌀 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗣𝗔𝗦𝗦 ⓶\n✪${usedPrefix}prem2 1\n✪ 𝗣𝗮𝘀𝗲 𝗧𝗼𝗿𝗿𝗲 𝗱𝗲 𝗘𝗻𝗰𝗮𝗻𝘁𝗼\n✪ 35 ${rpgshop.emoticon('kyubi')} ➟ 15 min 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n💚 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗣𝗔𝗦𝗦 ⓷\n✪${usedPrefix}prem3 1\n✪ 𝗣𝗮𝘀𝗲 𝗩𝗲𝗿𝗱𝘂𝘇𝗰𝗼\n✪ 25 ${rpgshop.emoticon('emerald')} ➟ 30 min 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n🗑 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗣𝗔𝗦𝗦 ⓸\n✪${usedPrefix}prem4 1\n✪ 𝗣𝗮𝘀𝗲 𝗥𝗲𝘀𝗶𝗱𝘂𝗼𝘀 𝗘𝗖𝗢\n✪ 50 ${rpgshop.emoticon('trash')} ➟ 1 h 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n♦️ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗣𝗔𝗦𝗦 ⓹\n${usedPrefix}prem5 1\n✪ 𝗣𝗮𝘀𝗲 𝗖𝗮𝘇𝗮 𝗕𝗿𝗶𝗹𝗹𝗮𝗻𝘁𝗲\n✪ 40 ${rpgshop.emoticon('berlian')} ➟ 3 h 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n🪙 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗣𝗔𝗦𝗦 ⓺\n${usedPrefix}prem6 1\n✪ 𝗣𝗮𝘀𝗲 𝗔𝗺𝗼 𝗱𝗲𝗹 𝗖𝗿𝗶𝗽𝘁𝗼\n✪ 70 ${rpgshop.emoticon('joincount')} ➟ 7 h 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n💎+ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗖𝗟𝗔𝗦𝗘 𝗣𝗔𝗦𝗦 ⓻\n${usedPrefix}prem7 1\n 𝗣𝗮𝘀𝗲 𝗚𝗲𝗺𝗮 𝗣𝗹𝘂𝘀\n✪ 65 ${rpgshop.emoticon('diamond')} ➟ 24 h 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n👑 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 - 𝗖𝗟𝗔𝗦𝗘 𝗣𝗔𝗦𝗦 ⓼\n${usedPrefix}prem8 1\n✪ 𝗣𝗮𝘀𝗲 𝗧𝗶𝗲𝗺𝗽𝗼 𝗱𝗲 𝗢𝗿𝗼\n✪ 80 ${rpgshop.emoticon('gold')} ➟ 3 d 𝗣𝗿𝗲𝗺𝗶𝘂𝗺\n\n┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅\n\n${dev}`, fkontak, { mentions: [aa,] })

break        

}}}
handler.help = ['addprem [@user] <days>']
handler.tags = ['rpg']
handler.command = ['comprar', 'prem1', 'prem2', 'prem3', 'prem4', 'prem5', 'prem6', 'prem7', 'prem8', 'premium', 'vip', 'prem', 'pass', 'pase']

export default handler