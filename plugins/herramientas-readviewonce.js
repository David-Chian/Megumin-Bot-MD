let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
if (!m.quoted) return conn.reply(m.chat, `${e} Responde a una imagen ViewOnce.`, m)
if (!m?.quoted || !m?.quoted?.viewOnce) return conn.reply(m.chat, `${e} Responde a una imagen ViewOnce.`, m)
let buffer = await m.quoted.download(false);
if (/videoMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || '', m)
} else if (/imageMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || '', m)
}}

handler.command = ['readviewonce', 'read', 'readvo', 'rvo', 'ver'] 

export default handler