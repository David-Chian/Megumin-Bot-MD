import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
let who
if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
else who = m.chat
if (!who) throw `🚩 Por favor, menciona el usuario`
if (usedPrefix == 'a' || usedPrefix == 'A') return;
let pp = "https://telegra.ph/file/4d80ab3a945a8446f0b15.mp4"
let pp2 = "https://telegra.ph/file/ef3a13555dfa425fcf8fd.mp4"
let pp3 = "https://telegra.ph/file/582e5049e4070dd99a995.mp4"
let pp4 = "https://telegra.ph/file/ab57cf916c5169f63faee.mp4"
let pp5 = "https://telegra.ph/file/fce96960010f6d7fc1670.mp4"
let pp6 = "https://telegra.ph/file/33332f613e1ed024be870.mp4"
try {
const locale = 'es-ES';
const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
const document = doc[Math.floor(Math.random() * doc.length)];
const str = `${taguser} le esta dando un fuerte abrazo a @${who.split`@`[0]} 🫂`
if (m.isGroup) {
conn.sendMessage(m.chat, { video: { url: [pp, pp2, pp3, pp4, pp5, pp6].getRandom() }, gifPlayback: true, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak});
} else {
conn.sendMessage(m.chat, { video: { url: [pp, pp2, pp3, pp4, pp5, pp6].getRandom() }, gifPlayback: true, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak});
}
} catch {
conn.reply(m.chat, '🍟 *¡Ocurrio un error!*', m, rcanal);
}};

handler.help = ['abrazar'].map((v) => v + ' <@usuario>');
handler.tags = ['fun'];
handler.command = ['abrazar'];
handler.group = true;
handler.register = true
export default handler;