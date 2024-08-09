//Codígo creado por David Chian wa.me/5351524614

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('🫂');
    let str = `${name2} abrazo a ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/56d886660696365f9696b.mp4'
    let pp2 = 'https://telegra.ph/file/3e443a3363a90906220d8.mp4'
    let pp3 = 'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4'
    let pp4 = 'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4'
    let pp5 = 'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4'
    let pp6 = 'https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4'
    let pp7 = 'https://telegra.ph/file/436624e53c5f041bfd597.mp4'
    let pp8 = 'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['abrazar @tag'];
handler.tags = ['fun'];
handler.command = ['hug','abrazar'];
handler.group = true;

export default handler;