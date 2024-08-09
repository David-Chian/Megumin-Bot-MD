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
    m.react('😥');
    let str = `${name2} está triste por ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/9c69837650993b40113dc.mp4' 
    let pp2 = 'https://telegra.ph/file/071f2b8d26bca81578dd0.mp4' 
    let pp3 = 'https://telegra.ph/file/0af82e78c57f7178a333b.mp4' 
    let pp4 = 'https://telegra.ph/file/8fb8739072537a63f8aee.mp4' 
    let pp5 = 'https://telegra.ph/file/4f81cb97f31ce497c3a81.mp4' 
    let pp6 = 'https://telegra.ph/file/6d626e72747e0c71eb920.mp4' 
    let pp7 = 'https://telegra.ph/file/8fd1816d52cf402694435.mp4' 
    let pp8 = 'https://telegra.ph/file/3e940fb5e2b2277dc754b.mp4' 
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['triste @tag'];
handler.tags = ['fun'];
handler.command = ['sad','triste'];
handler.group = true;

export default handler;