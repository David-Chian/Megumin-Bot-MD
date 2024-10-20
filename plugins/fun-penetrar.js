let handler = async (m, { conn, command, text }) => {
if (!db.data.chats[m.chat].nsfwhot && m.isGroup) throw conn.reply(m.chat,  '🚩 *¡Estos comandos están desactivados!*', m, fake);
if (!text) throw `*Ingrese el @ o el nombre de la persona que quieras saber si te puedes ${command.replace('how', '')}*`
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
conn.reply(m.chat, `
*TE HAN LLENADO LA CARA DE SEMEN POR PUTA Y ZORRA!*

*le ha metido el pene a ${text}* con todo y condon hasta quedar seco, has dicho "por favor mas duroooooo!, ahhhhhhh, ahhhhhh, hazme un hijo que sea igual de pitudo que tu!" mientras te penetraba y luego te ha dejado en silla de ruedas!

*${text}* 
🔥 *YA TE HAN PENETRADO!* `, null, { mentions: [user] })
}
handler.help = ['penetrar @user']
handler.tags = ['fun']
handler.command = ['penetrar','penetrado']
handler.register = true;
handler.group = true;
handler.fail = null
export default handler
