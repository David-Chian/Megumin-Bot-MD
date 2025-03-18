import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix }) => {
    if (args.length < 3) return m.reply(`🔹 *Uso correcto:* ${usedPrefix}tweet @usuario comentario`)

    let mentionedJid = m.mentionedJid[0]
    if (!mentionedJid) return m.reply("⚠️ Debes mencionar a un usuario.")
    let name = (await conn.getName(mentionedJid)) || "Desconocido"
    let userData = global.db.data.users[mentionedJid]
    if (!userData || !userData.name) return m.reply(`⚠️ El usuario @${mentionedJid.split("@")[0]} no está registrado en la base de datos.`)

    let username = `@${userData.name.replace(/\s+/g, "")}`
    let image = await conn.profilePictureUrl(mentionedJid, 'image').catch(() => "https://i.imgur.com/5Q1MqGD.png")
    let comment = text.replace(args[0], "").replace(username, "").trim()

    let apiUrl = `https://delirius-apiofc.vercel.app/canvas/tweet?name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&comment=${encodeURIComponent(comment)}&image=${encodeURIComponent(image)}&theme=dark`

    await conn.sendMessage(m.chat, { 
        image: { url: apiUrl }, 
        caption: `📢 @${mentionedJid.split("@")[0]} hizo un tweet!!`, 
        mentions: [mentionedJid] 
    }, { quoted: null })
}

handler.command = /^tweet$/i
export default handler