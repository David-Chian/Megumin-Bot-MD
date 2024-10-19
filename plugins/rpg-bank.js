import db from '../lib/database.js'
let img 'https://qu.ax/EKcDO.jpg'
let handler = async (m, {conn, usedPrefix}) => {
   let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
   if (who == conn.user.jid) return m.react('✖️')
   if (!(who in global.db.data.users)) return m.reply(`*El usuario no se encuentra en mi base de datos*`)
   let user = global.db.data.users[who]
   const texto = `${who == m.sender ? `Tienes *${user.bank} Cookies 🍪* en el Banco` : `El usuario @${who.split('@')[0]} tiene *${user.bank} Cookies 🍪* en el Banco`}`
   
   await conn.sendButton(m.chat, texto, wm, img, [['Retirar Todo', `${usedPrefix}retirar all`], ['Meter Al Banco Todo', `${usedPrefix}dep all`] ], rcanal, null, { mentions: [who] })
}

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = ['bank', 'banco'] 
handler.register = true 
handler.group = true
export default handler 