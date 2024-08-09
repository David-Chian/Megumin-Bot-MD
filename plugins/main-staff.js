let handler = async (m, { conn, command, usedPrefix }) => {
let staff = `🚩 *EQUIPO DE AYUDANTES*
🍟 *Bot:* ${global.botname}
✨️ *Versión:* ${global.vs}

👑 *Propietario:*

• Diamond
🍟 *Rol:* Propietario
🚩 *Número:* wa.me/5351524614
✨️ *GitHub:* https://github.com/David-Chian

🌸  *Colaboradores:*

• Miguelon
🍟 *Rol:* Developer
🚩 *Número:* Wa.me/528711426787

• Steven
🍟 *Rol:* Contribuidor
🚩 *Número:* Wa.me/593984964830

• Dino
🍟 *Rol:* Editor
🚩 *Número:* Wa.me/527774603921
`
await conn.sendFile(m.chat, icons, 'yaemori.jpg', staff.trim(), fkontak, true, {
contextInfo: {
'forwardingScore': 200,
'isForwarded': false,
externalAdReply: {
showAdAttribution: true,
renderLargerThumbnail: false,
title: `🥷 Developers 👑`,
body: `🚩 Staff Oficial`,
mediaType: 1,
sourceUrl: redes,
thumbnailUrl: icono
}}
}, { mentions: m.sender })
m.react(emoji)

}
handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
