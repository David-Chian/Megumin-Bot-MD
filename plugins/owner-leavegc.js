let handler = async (m, { conn, text, command }) => {

let id = text ? text : m.chat  

await conn.groupLeave(id)

try {  

} catch (e) {
await m.reply(`No puedo salir de este grupo.\n\n> ${e}`) 
}}

handler.command = ['salir','leavegc','salirdelgrupo','leave']
handler.rowner = true

export default handler
