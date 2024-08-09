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
    m.react('😋');
    let str = `${name2} lamió a  ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/0ce171b163a669ae9819d.mp4'
    let pp2 = 'https://telegra.ph/file/b80fdfb8551b66f77b67e.mp4'
    let pp3 = 'https://telegra.ph/file/f87d442b78389d4ed5be0.mp4'
    let pp4 = 'https://telegra.ph/file/74828e36617c16421598f.mp4'
    let pp5 = 'https://telegra.ph/file/093cbdd990220446d8920.mp4'
    let pp6 = 'https://telegra.ph/file/5042d5f627a3500e2fe8e.mp4'
    let pp7 = 'https://telegra.ph/file/02ec493403335917d1ece.mp4'
    let pp8 = 'https://telegra.ph/file/a0a86516033a906b55220.mp4' 
    let pp9 = 'https://telegra.ph/file/570944813cab1c9dddd03.mp4'
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['lamber @tag'];
handler.tags = ['fun'];
handler.command = ['lick','lamer','lamber'];
handler.group = true;

export default handler;