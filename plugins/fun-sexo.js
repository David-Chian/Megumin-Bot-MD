import fs from 'fs';
import path from 'path';
import uploadImage from '../lib/uploadImage.js'
import { sticker } from '../lib/sticker.js';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply('🚩 *¡Estos comandos están desactivados!*');
    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
   // m.react('⏳');
    await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } })
    let str = `${name2} tiene sexo con ${name}`.trim();
    if (m.isGroup){
    
    // Directorio que contiene las imágenes
    let pp = 'https://telegra.ph/file/3246f62c61a0ebebcb5c8.mp4'
    let pp2 = 'https://telegra.ph/file/9c4b894e034c290df75e4.mp4'
    let pp3 = 'https://telegra.ph/file/c5be4a906531c6731cd41.mp4'
    let pp4 = 'https://telegra.ph/file/e3abb2e79cd1ccf709e91.mp4'
    let pp5 = 'https://telegra.ph/file/a2ad1dd463a935d5dfd17.mp4'
    let pp6 = 'https://telegra.ph/file/6f66fd1974e8df1496768.mp4'
   let pp7 = 'https://telegra.ph/file/22d0ef801c93c1b2ac074.mp4'
   let pp8 = 'https://telegra.ph/file/2072f260302c6bb97682a.mp4'
    let pp9 = 'https://telegra.ph/file/820460f05d76bb2329bbc.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
   // m.react('🔥');
}

handler.help = ['sexo @tag'];
handler.tags = ['fun'];
handler.command = ['sexo']
handler.register = true;
handler.group = true;

export default handler;
