import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import fetch from 'node-fetch';
import {sticker} from "../lib/sticker.js";

let handler = async (m, { conn, args }) => {
    let vcardMessage = {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    };

    if (!args[0]) {
        return conn.reply(m.chat, '[❗] Inserte el comando más el enlace/link de un video de YouTube', vcardMessage, m);
    }

  let name = conn.getName(m.sender);
  let apislap = await fetch(`https://qu.ax/EnLlx.mp4`);
let url = apislap.url;
    let stiker = await sticker(null, url, `${name} está descargando...`, `Estoy haciendo lo mejor que puedo..!#€ Aahh!`);
  const stickerMessage = await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m, true, { contextInfo: { forwardingScore: 200, isForwarded: true } }, { quoted: m });

    try {
        let format = '128kbps';
        let url = args[0];
        const ytData = await youtubedl(url).catch(async () => await youtubedlv2(url)).catch(async () => await youtubedlv3(url));
        const audioUrl = await ytData.audio[format].download();
        const title = await ytData.title;
        const fileSize = await ytData.audio[format].fileSizeH;

        await conn.sendFile(m.chat, audioUrl, `${title}.mp3`, null, m, false, { mimetype: 'audio/mpeg' });
        await conn.sendMessage(m.chat, { delete: stickerMessage.key });
    } catch {
        try {
            let response = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=kurumi&url=${args[0]}`);
            let json = await response.json();
            let title = json.result.title || 'error';

            await conn.sendMessage(m.chat, {
                audio: { url: json.result.link },
                fileName: `${title}.mp3`,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
            await conn.sendMessage(m.chat, { delete: stickerMessage.key });
        } catch(error) {
            await conn.reply(m.chat, `❌ Lo sentimos, se ha generado un error. Vuelve a intentarlo. ❌\n${error}`, m, rcanal);
            await conn.sendMessage(m.chat, { delete: stickerMessage.key });
        }
    }
};

handler.command = /^fgmp3|dlmp3|getaud|yt(a|mp3)$/i;

export default handler;