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
   // m.react('⏳');
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })
    let str = `${name2} esta agarrando las tetas de ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/82d32821f3b57b62359f2.mp4' 
    let pp2 = 'https://telegra.ph/file/04bbf490e29158f03e348.mp4' 
    let pp3 = 'https://telegra.ph/file/37c21753892b5d843b9ce.mp4'
    let pp4 = 'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4'
    let pp5 = 'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4'
    let pp6 = 'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4'
    let pp7 = 'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4' 
    let pp8 = 'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4' 
    let pp9 = 'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4' 
    let pp10 = 'https://telegra.ph/file/36149496affe5d02c8965.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9, pp10];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
  //  m.react('🔥');
}

handler.help = ['agarrar @tag'];
handler.tags = ['fun'];
handler.command = ['grabboobs','agarrartetas'];
handler.group = true;

export default handler;