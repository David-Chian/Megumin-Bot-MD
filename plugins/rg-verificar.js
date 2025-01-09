import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
// import _ from "lodash"
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix, command }) {
let user = global.db.data.users[m.sender]
let name2 = conn.getName(m.sender)
  let delirius = await axios.get(`https://delirius-apiofc.vercel.app/tools/country?text=${PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international')}`)
  let paisdata = delirius.data.result
  let mundo = paisdata ? `${paisdata.name} ${paisdata.emoji}` : 'Desconocido'
  let perfil = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://qu.ax/QGAVS.jpg')
  let bio = 0, fechaBio
 // let who2 = m.isGroup ? _.get(m, "mentionedJid[0]", m.quoted?.sender || m.sender) : m.sender
  let sinDefinir = '😿 Es privada'
  let biografia = await conn.fetchStatus(m.sender).catch(() => null)
  if (!biografia || !biografia[0] || biografia[0].status === null) {
  bio = sinDefinir
  fechaBio = "Fecha no disponible"
  } else {
  bio = biografia[0].status || sinDefinir
  fechaBio = biografia[0].setAt ? new Date(biografia[0].setAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", }) : "Fecha no disponible"
  }
if (user.registered === true) throw `*『✦』Ya estas registrado, para volver a registrarte, usa el comando: #unreg*`
if (!Reg.test(text)) throw `*『✦』El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n#reg *Nombre.edad*\n\n\`\`\`Ejemplo:\`\`\`\n#reg *${name2}.18*`
let [_, name, splitter, age] = text.match(Reg)
if (!name) throw '*『✦』No puedes registrarte sin nombre, el nombre es obligatorio. Inténtelo de nuevo.*'
if (!age) throw '*『✦』No puedes registrarte sin la edad, la edad es opcional. Inténtelo de nuevo.*'
if (name.length >= 30) throw '*『✦』El nombre no debe de tener mas de 30 caracteres.*' 
age = parseInt(age)
if (age > 999) throw '*『😏』Viejo/a Sabroso/a*'
if (age < 5) throw '*『🍼』Ven aquí, te adoptare!!*'
user.name = name.trim()
user.age = age
user.descripcion = bio
// user.persona = age >= 18? '(Persona adulta)' : '(Persona joven)'
user.regTime = + new Date
user.registered = true
global.db.data.users[m.sender].money += 600
global.db.data.users[m.sender].cookies += 10
global.db.data.users[m.sender].exp += 245
global.db.data.users[m.sender].joincount += 5
let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)        
m.react('📩') 
let regbot = `👤 𝗥 𝗘 𝗚 𝗜 𝗦 𝗧 𝗥 𝗢 👤
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
「💭」𝗡𝗼𝗺𝗯𝗿𝗲: ${name}
「✨️」𝗘𝗱𝗮𝗱: ${age} años
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
「🎁」𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:
• 15 Cookies 🍪
• 5 MeguCoins 🪙
• 245 Experiencia 💸
• 12 Tokens 💰

ᴠᴇʀɪғɪᴄᴀ ᴛᴜ ʀᴇɢɪᴛʀᴏ ᴀϙᴜɪ:
${channel2}
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
${packname}`
await conn.sendMini(m.chat, '⊱『✅𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥✅』⊰', textbot, regbot, imagen1, imagen1, channel, m)
//await m.reply(`${sn}`)   
  
let chtxt = `
👤 *𝚄𝚜𝚎𝚛* » ${m.pushName || 'Anónimo'}
🌎 *𝙿𝚊𝚒𝚜* » ${mundo}
🗂 *𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚌𝚒𝚘́𝚗* » ${user.name}
⭐️ *𝙴𝚍𝚊𝚍* » ${user.age} años
👀 *Descripción* » ${user.descripcion} 
⏳ *Modificación de descripción* » ${fechaBio}
📆 *𝙵𝚎𝚌𝚑𝚊* » ${moment.tz('America/Bogota').format('DD/MM/YY')}
☁️ *𝙽𝚞𝚖𝚎𝚛𝚘 𝚍𝚎 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚘* »
⤷ ${sn}
`.trim()
  
await conn.sendMessage(global.idchannel, { text: chtxt, contextInfo: {
externalAdReply: {
title: "【 🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐂𝐈𝐎́𝐍 🔔 】",
body: '🥳 ¡𝚄𝚗 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚞𝚎𝚟𝚘 𝚎𝚗 𝚖𝚒 𝚋𝚊𝚜𝚎 𝚍𝚎 𝚍𝚊𝚝𝚘𝚜!',
thumbnailUrl: perfil,
sourceUrl: redes,
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: false
}}}, { quoted: null })
}
handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'] 

export default handler
