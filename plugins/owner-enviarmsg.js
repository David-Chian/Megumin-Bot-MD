// By: @OfcKing  

import { webp2png } from '../lib/webp2mp4.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import axios from 'axios';
import fs from 'fs'; 
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const idgroup = "120363351999685409@g.us";

let handler = async (m, { conn, text }) => {
    let who = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.fromMe ? conn.user.jid : m.sender);

    if (!text && !m.quoted) {
        return m.reply(`*🚩 Por favor, escribe tu mensaje o cita el contenido que deseas enviar.*`);
    }

    let content = m.quoted ? m.quoted : m;
    let messageOptions = {};
    let mediaBuffer;
    let mime = (content.msg || content).mimetype || '';
    let messageType = 'un texto'; 

    try {
        if (/image/.test(mime)) {
            mediaBuffer = await content.download();
            let imageUrl = await uploadImage(mediaBuffer);
            messageOptions = { image: { url: imageUrl }, caption: text || content.message?.imageMessage?.caption || '' };
            messageType = text ? 'una imagen con texto' : 'una imagen';
        } else if (/video/.test(mime)) {
            mediaBuffer = await content.download();
            let videoUrl = await uploadFile(mediaBuffer);
            messageOptions = { video: { url: videoUrl }, caption: text || content.message?.videoMessage?.caption || '' };
            messageType = text ? 'un video con texto' : 'un video';
        } else if (/webp/.test(mime)) {
            mediaBuffer = await content.download();
            let stickerBuffer = await webp2png(mediaBuffer);
            messageOptions = { sticker: stickerBuffer };
            messageType = 'un sticker';
        } else {
            messageOptions = { text: text || content.message?.conversation || content.message?.extendedTextMessage?.text || '' };
        }

        await conn.sendMessage(idchannel, messageOptions);

        let senderInfo = `@${who.split('@')[0]} envió ${messageType} para el canal test!`;
        await conn.sendMessage(idgroup, { text: senderInfo, mentions: [who] });

    } catch (err) {
        console.error('Error al enviar el mensaje:', err);
        m.reply('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.\n\n' + err);
    }
};

handler.command = ['enviarmensaje', 'enviar', 'mensajegroup', 'solicitud' 'sug'];

export default handler;