//Codígo creado por DAVID CHIAN!! PERRAS wa.me/5351524614

import fs from 'fs';
import path from 'path';
import uploadImage from '../lib/uploadImage.js'
import { sticker } from '../lib/sticker.js';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;
    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
   // m.react('⏳');
    await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } })
    let str = `${name2} violó fuertemente a ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/21543bac2383ce0fc6f51.mp4'
    let pp2 = 'https://telegra.ph/file/e2beba258ba83f09a34df.mp4'
    let pp3 = 'https://telegra.ph/file/1af11cf4ffeda3386324b.mp4'
    let pp4 = 'https://telegra.ph/file/66535b909845bd2ffbad9.mp4'
    let pp5 = 'https://telegra.ph/file/6ea4ddf2f9f4176d4a5c0.mp4'
    let pp6 = 'https://telegra.ph/file/e7078700d16baad953348.mp4'
    let pp7 = 'https://telegra.ph/file/1c7d59e637f8e5915dbbc.mp4'
    let pp8 = 'https://telegra.ph/file/7638618cf43e499007765.mp4'
    let pp9 = 'https://telegra.ph/file/80aa0e43656667b07d0b4.mp4'
    let pp10 = 'https://telegra.ph/file/1baf2e8577d5118c03438.mp4'
    let pp11 = 'https://telegra.ph/file/52c82a0269bb69d5c9fc4.mp4'
    let pp12 = 'https://telegra.ph/file/34e1fb2f847cbb0ce0ea2.mp4'
    let pp13 = 'https://telegra.ph/file/249518bf45c1050926d9c.mp4'
    let pp14 = 'https://telegra.ph/file/3b1d6ef30a5e53518b13b.mp4'
    let pp15 = 'https://telegra.ph/file/100ba1caee241e5c439de.mp4'
    let pp16 = 'https://telegra.ph/file/bbf6323509d48f4a76c13.mp4'
    let pp17 = 'https://telegra.ph/file/1dec277caf371c8473c08.mp4'
    let pp18 = 'https://telegra.ph/file/216b3ab73e1d98d698843.mp4'
    let pp19 = 'https://telegra.ph/file/8e94da8d393a6c634f6f9.mp4'
    let pp20 = 'https://telegra.ph/file/ca64bfe2eb8f7f8c6b12c.mp4'
    let pp21 = 'https://telegra.ph/file/58bcc3cd79cecda3acdfa.mp4'
    let pp22 = 'https://telegra.ph/file/b08996c47ff1b38e13df0.mp4'
    let pp23 = 'https://telegra.ph/file/a91d94a51dba34dc1bed9.mp4'
    let pp24 = 'https://telegra.ph/file/bd4d5a957466eee06a208.mp4'
    let pp25 = 'https://telegra.ph/file/f8e4abb6923b95e924724.mp4'
    let pp26 = 'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
    let pp27 = 'https://telegra.ph/file/8be835497e63430842dfc.mp4'
    let pp28 = 'https://telegra.ph/file/89891693613651230d6f0.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9, pp10, pp11, pp12, pp13, pp14, pp15, pp16, pp17, pp18, pp19, pp20, pp21, pp22, pp23, pp24, pp25, pp26, pp27, pp28];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
  //  m.react('🔥');
}

handler.help = ['violar @tag'];
handler.tags = ['fun'];
handler.command = ['violar','fuck']
handler.group = true;

export default handler;