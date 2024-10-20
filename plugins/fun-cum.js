//Codígo creado por DAVID CHIAN!! PERRAS wa.me/5351524614

import fs from 'fs';
import path from 'path';
import uploadImage from '../lib/uploadImage.js'
import { sticker } from '../lib/sticker.js';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply('🚩 *¡Estos comandos están desactivados!*');
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
   // m.react('⏳');
    await conn.sendMessage(m.chat, { react: { text: '💦', key: m.key } })
    let str = `${name2} se vino dentro de ${name}`.trim();
    if (m.isGroup){
    
    // Directorio que contiene las imágenes
    let pp = 'https://telegra.ph/file/9243544e7ab350ce747d7.mp4'
    let pp2 = 'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4'
let pp3 = 'https://telegra.ph/file/79a5a0042dd8c44754942.mp4'
let pp4 = 'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4'
let pp5 = 'https://telegra.ph/file/0103144b636efcbdc069b.mp4'
let pp6 = 'https://telegra.ph/file/4d97457142dff96a3f382.mp4'
let pp7 = 'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4'
let pp8 = 'https://telegra.ph/file/5094ac53709aa11683a54.mp4'
let pp9 = 'https://telegra.ph/file/90ad889125a3ba40bceb8.jpg'
let pp10 = 'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4'
let pp11 = 'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'

    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9, pp10, pp11];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
   // m.react('💦');
}

handler.help = ['cum @tag'];
handler.tags = ['fun'];
handler.command = ['cum'];
handler.register = true;
handler.group = true;

export default handler;
