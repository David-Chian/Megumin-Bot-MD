let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

export async function before(m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net"}  
let chat = global.db.data.chats[m.chat]
let usuario = `@${m.sender.split`@`[0]}`
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://qu.ax/QGAVS.jpg'  

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = `*${usuario}*\n✨️ Ha cambiado el nombre del grupo\n\n🌻 Ahora el grupo se llama:\n${m.messageStubParameters[0]}*`
foto = `*${usuario}*\n🚩 Ha cambiado la imagen de:\n*${groupMetadata.subject}*`
edit = `*${usuario}*\n🌺 Ha permitido que ${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'} puedan configurar el grupo`
newlink = `🌸 El enlace de  *${groupMetadata.subject}* ha sido restablecido por:\n*» ${usuario}*`
status = `*${groupMetadata.subject}* Ha sido ${m.messageStubParameters[0] == 'on' ? '*cerrado 🔒*' : '*abierto 🔓*'} Por *${usuario}*\n\n💬 Ahora ${m.messageStubParameters[0] == 'on' ? '*solo admins*' : '*todos*'} pueden enviar mensaje`
admingp = `*@${m.messageStubParameters[0].split`@`[0]}* Ahora es admin del grupo 🥳\n\n💫 Acción hecha por:\n*» ${usuario}*`
noadmingp =  `*@${m.messageStubParameters[0].split`@`[0]}* Deja de ser admin del grupo 😿\n\n💫 *Acción hecha por:\n*» ${usuario}*`

if (chat.detect && m.messageStubType == 21) {
await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })   

} else if (chat.detect && m.messageStubType == 22) {
await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })

} else if (chat.detect && m.messageStubType == 23) {
await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })    

} else if (chat.detect && m.messageStubType == 25) {
await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 26) {
await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 29) {
await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })  

//} else if (chat.detect && m.messageStubType === 172 && m.messageStubParameters.length > 0) {
//const rawUser = m.messageStubParameters[0];
//const users = rawUser.split('@')[0]; 
//const prefijosProhibidos = ['91', '92', '222', '93', '265', '61', '62', '966', '229', '40', '49', '20', '963', '967', '234', '210', '212'];
//const usersConPrefijo = users.startsWith('+') ? users : `+${users}`;

//if (chat.antifake) {
//if (prefijosProhibidos.some(prefijo => usersConPrefijo.startsWith(prefijo))) {
//try {
//await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'reject');
//m.reply(`😿 La solicitúd de ingreso de: @${users} fué rechazada automáticamente por tener un prefijo prohibido.`);
//} catch (error) {
//console.error(`❌️ Error al rechazar la solicitud de ${usersConPrefijo}:`, error);
//}} else {
//try {
//await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'approve');
//m.reply(`🥳 La solicitud de ingreso de: @${users} fué aprobada automáticamente.`);
//} catch (error) {
//console.error(`❌️ Error al aprobar la solicitud de ${usersConPrefijo}:`, error);
//}}} else {
//try {
//await conn.groupRequestParticipantsUpdate(m.chat, [rawUser], 'approve');
//m.reply(`🥳 La solicitud de ingreso de: @${users} fué aprobada automáticamente ya que #antifake está desactivado.`);
//} catch (error) {
//console.error(`❌️ Error al aprobar la solicitud de ${usersConPrefijo}:`, error);
//}}
return;
} if (chat.detect && m.messageStubType == 30) {
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })  

//} else if (chat.detect && m.messageStubType == 145) {
//await conn.sendMessage(m.chat, { text: '😿 Se ha activado el modo de aprobación para unirse al grupo.', mentions: [m.sender] })

} else {
//console.log({ messageStubType: m.messageStubType,
//messageStubParameters: m.messageStubParameters,
//type: WAMessageStubType[m.messageStubType], 
//})
}}