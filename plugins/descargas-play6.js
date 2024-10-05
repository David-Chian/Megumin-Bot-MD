import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import fetch from 'node-fetch';
import {sticker} from "../lib/sticker.js";
let handler = async (m, { conn, args }) => {
let vcard = {
key: {
participants: '0@s.whatsapp.net',
remoteJid: 'status@broadcast',
fromMe: false,
id: 'Halo'
},
message: {
contactMessage: {
vcard: `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:y
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
}
},
participant: '0@s.whatsapp.net'
};
    if (!args[0]) {
        return conn.reply(m.chat, '[❗] Inserte el comando más el enlace/link de un video de YouTube', vcard, m, rcanal);
    }
let name = conn.getName(m.sender);
  let apislap = await fetch(`https://qu.ax/JrHBH.mp4`);
let url = apislap.url;
    let stiker = await sticker(null, url, `${name} está descargando...`, `Estoy haciendo lo mejor que puedo..!#€ Aahh!`);
  const stickerMessage = await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m, true, { contextInfo: { forwardingScore: 200, isForwarded: true } }, { quoted: m });
try {
let quality = args[1] || '360';
let url = args[0];
const youtube = await youtubedl(url).catch(async () => await youtubedlv2(url)).catch(async () => await youtubedlv3(url));
const video = await youtube.video[quality + 'p'].download();
const title = await youtube.title;
const fileSize = await youtube.video[quality + 'p'].fileSizeH;
await conn.sendMessage(m.chat, { video: { url: video }, fileName: title + '.mp4', mimetype: 'video/mp4', caption: `• *TITLE:* ${title}\n• *FILE SIZE:* ${fileSize}`, thumbnail: await fetch(youtube.thumbnail) }, { quoted: m });
await conn.sendMessage(m.chat, { delete: stickerMessage.key });
} catch {
try {
let api = await fetch(`https://api.lolhuman.xyz/api/ytvideo2?apikey=kurumi&url=${args[0]}`);
let json = await api.json();
let title = json.result.title || 'error';
let link = json.result.link;
let size = json.result.size;
let thumbnail = json.result.thumbnail;
await conn.sendMessage(m.chat, { video: { url: link }, fileName: title + '.mp4', mimetype: 'video/mp4', caption: `▢ *TITLE:* ${title}\n▢ *FILE SIZE:* ${size}`, thumbnail: await fetch(thumbnail) }, { quoted: m });
await conn.sendMessage(m.chat, { delete: stickerMessage.key });
} catch(e) {
await conn.reply(m.chat, `❌ Lo sentimos, se ha producido un error. ❌\n${e}`, m, rcanal);
await conn.sendMessage(m.chat, { delete: stickerMessage.key });
}
}
};
handler.command = /^fgmp4|dlmp4|getvid|yt(v|mp4)?$/i;
export default handler;