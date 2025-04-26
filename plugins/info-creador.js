let handler = async (m, { conn, command, usedPrefix }) => {
let creadorID = '5351524614@s.whatsapp.net'
let isInGroup = m.isGroup && (await conn.groupMetadata(m.chat)).participants.some(p => p.id === creadorID)

let numeroTexto = isInGroup ? `@${creadorID.split('@')[0]}` : `+53 51524614`

let creador = `🌹 *C R E A D O R - 💎 - B O T*

🌱 *NOMBRE:* ᥫᩣᎠ꯭I𝚫⃥꯭M꯭Ꭷ꯭Ꮑ꯭Ꭰ࠭⋆̟(◣_◢)凸
🍟 *NUMERO:* ${numeroTexto}
🪴 *LINK:* wa.me/5351524614

👑 *E N L A C E S - U T I L E S:*

• *GRUPO OFC:*
https://chat.whatsapp.com/F4QEFF2Hn4102NdbPJ2ZOi
• *CANAL OFC*
https://whatsapp.com/channel/0029VaqAtuIK0IBsHYXtvA3e
• *GITHUB:*
https://github.com/David-Chian
• *YOUTUBE:*
https://youtube.com/@davidchian4957
`

await conn.sendMessage(m.chat, {
  text: creador.trim(),
  contextInfo: {
    forwardingScore: 200,
    isForwarded: false,
    mentionedJid: isInGroup ? [creadorID] : [],
    externalAdReply: {
      showAdAttribution: true,
      renderLargerThumbnail: true,
      title: `🥷 Developer 👑`,
      body: packname,
      mediaType: 1,
      sourceUrl: redes,
      thumbnailUrl: imagen1
    }
  }
}, {
  quoted: fkontak
})

}
handler.help = ['creador']
handler.command = ['creador', 'creator', 'owner', 'propietario', 'dueño']
handler.register = true
handler.tags = ['main']

export default handler