/* Codigo copiado de GataBot-MD */

import { sticker } from '../lib/sticker.js';
import axios from 'axios';
const handler = async (m, {conn, args, usedPrefix, command}) => {
let text
if (args.length >= 1) {
text = args.slice(0).join(" ");
} else if (m.quoted && m.quoted.text) {
text = m.quoted.text;
} else return conn.reply(m.chat, '🚩 Te Faltó El Texto!', m, rcanal);
if (!text) return conn.reply(m.chat, '🚩 Te Faltó El Texto!', m, rcanal);
const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender; 
const mentionRegex = new RegExp(`@${who.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
const mishi = text.replace(mentionRegex, '');
if (mishi.length > 40) return conn.reply(m.chat, '🚩 El texto no puede tener mas de 30 caracteres', m, rcanal);
const pp = await conn.profilePictureUrl(who).catch((_) => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
const nombre = await conn.getName(who)
const obj = {"type": "quote", "format": "png", "backgroundColor": "#000000", "width": 512, "height": 768, "scale": 2, "messages": [{"entities": [], "avatar": true, "from": {"id": 1, "name": `${who?.name || nombre}`, "photo": {url: `${pp}`}}, "text": mishi, "replyMessage": {}}]};
const json = await axios.post('https://bot.lyo.su/quote/generate', obj, {headers: {'Content-Type': 'application/json'}});
const buffer = Buffer.from(json.data.result.image, 'base64');
let stiker = await sticker(buffer, false, global.packsticker, global.author);
if (stiker) return conn.sendFile(m.chat, stiker, 'error.webp', '', m);
}
handler.help = ['qc'];
handler.tags = ['sticker'];
handler.group = true;
handler.register = true
handler.command = ['qc'];
export default handler;