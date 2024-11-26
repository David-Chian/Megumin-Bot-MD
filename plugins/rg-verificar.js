import { createHash } from 'crypto'
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, usedPrefix, command }) {
let user = global.db.data.users[m.sender]
let name2 = conn.getName(m.sender)
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
user.regTime = + new Date
user.registered = true
global.db.data.users[m.sender].money += 600
global.db.data.users[m.sender].cookies += 10
global.db.data.users[m.sender].exp += 245
global.db.data.users[m.sender].joincount += 5
let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6)        
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
https://whatsapp.com/channel/0029Vaxr2YgLCoWy2NS1Ab0a
•┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄•
${packname}`
await conn.sendMini(m.chat, '⊱『✅𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥✅』⊰', textbot, regbot, imagen1, imagen1, channel, m)
//await m.reply(`${sn}`)   
  
let chtxt = `
👤 *𝚄𝚜𝚎𝚛* » ${m.pushName || 'Anónimo'}
🌎 *𝙿𝚊𝚒𝚜* » ${mundo}
🗂 *𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚌𝚒𝚘́𝚗* » ${user.name}
⭐️ *𝙴𝚍𝚊𝚍* » ${user.age} años
📆 *𝙵𝚎𝚌𝚑𝚊* » ${moment.tz('America/Bogota').format('DD/MM/YY')}
☁️ *𝙽𝚞𝚖𝚎𝚛𝚘 𝚍𝚎 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚘* »
⤷ ${sn}

🎁 𝐑𝐞𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚𝐬
23 • 𝙼𝚘𝚗𝚎𝚢 💰
45 • 𝙴𝚡𝚙 💫
60 • galletas 🍪 

> ¡Gracias por registrarte en nuestro bot: Hutao Proyect! Disfruta tu estadía y déjate sorprender por todo lo que tenemos para ofrecer. ✨🚀
`.trim()
  
await conn.sendMessage(global.idchannel, { text: chtxt, contextInfo: {
externalAdReply: {
title: "【 🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐂𝐈𝐎́𝐍 🔔 】",
body: '🥳 ¡𝚄𝚗 𝚞𝚜𝚞𝚊𝚛𝚒𝚘 𝚗𝚞𝚎𝚟𝚘 𝚎𝚗 𝚖𝚒 𝚋𝚊𝚜𝚎 𝚍𝚎 𝚍𝚊𝚝𝚘𝚜!',
thumbnailUrl: pp,
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
