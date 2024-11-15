// Bank Editado Por Cuervo
//★彡[ᴄʀᴇᴀᴛᴇ ʙʏ ᴄᴜᴇʀᴠᴏ-ᴛᴇᴀᴍ-ꜱᴜᴘʀᴇᴍᴇ]彡★
// Respeten credito xddddd (ratas inmundas)
import fetch from 'node-fetch'
import db from '../lib/database.js'
let img = 'https://qu.ax/qDTDh.png'
let handler = async (m, {conn, usedPrefix}) => {
   let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
   if (who == conn.user.jid) return m.react('✖️')
   if (!(who in global.db.data.users)) return m.reply(`*El usuario no se encuentra en mi base de datos*`)
   let user = global.db.data.users[who]
   let name = conn.getName(who);
   let txt = (`${who == m.sender ? `╭━〔  ${global.packname}  〕⬣\n┋ *Usuario:* ${name}\n┋ *Cookies En Cartera*: ${user.cookies}\n┋ *Cookies En Banco*: ${user.bank}\n┋ *Experiencia:* ${user.exp}\n┋ *Nivel:* ${user.level}\n┋ *Rol:* ${user.role}\n┋ *Fecha:* ${new Date().toLocaleString('id-ID')}\n╰━━━━━━━━━━━━⬣` : `╭━〔  ${global.packname}  〕⬣\n┋ *Usuario:* @${who.split('@')[0]}\n┋ *Cookies En Cartera*: ${user.cookies}\n┋ *Cookies En Banco*: ${user.bank}\n┋ *Experiencia:* ${user.exp}\n┋ *Nivel:* ${user.level}\n┋ *Rol:* ${user.role}\n┋ *Fecha:* ${new Date().toLocaleString('id-ID')}\n╰━━━━━━━━━━━━⬣`}`)
//await conn.sendButton(m.chat, texto, wm, img, [['Retirar Todo', `${usedPrefix}retirar all`], ['Meter Al Banco Todo', `${usedPrefix}d all`] ], null, { mentions: [who] })
await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, {mentions: [who] }, rcanal)
}

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = ['bank', 'banco'] 
handler.register = true 
handler.group = true
export default handler 
