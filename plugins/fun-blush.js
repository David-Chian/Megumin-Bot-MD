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
    m.react('🤭');
    let str = `${name2} se sonrojo por ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/a4f925aac453cad828ef2.mp4'  //u
    let pp2 = 'https://telegra.ph/file/f19318f1e8dad54303055.mp4' //y
    let pp3 = 'https://telegra.ph/file/15605caa86eee4f924c87.mp4' //y
    let pp4 = 'https://telegra.ph/file/d301ffcc158502e39afa7.mp4' //y
    let pp5 = 'https://telegra.ph/file/c6105160ddd3ca84f887a.mp4' //y
    let pp6 = 'https://telegra.ph/file/abd44f64e45c3f30442bd.mp4' //y
    let pp7 = 'https://telegra.ph/file/9611e5c1d616209bc0315.mp4' //y
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['sonrojarse @tag'];
handler.tags = ['fun'];
handler.command = ['blush','sonrojarse'];
handler.group = true;

export default handler;