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
    m.react('😹');
    let str = `${name2} se esta riendo de ${name}`.trim();
    if (m.isGroup){
    
    let pp = 'https://telegra.ph/file/5fa4fd7f4306aa7b2e17a.mp4' 
    let pp2 = 'https://telegra.ph/file/b299115a77fadb7594ca0.mp4'
    let pp3 = 'https://telegra.ph/file/9938a8c2e54317d6b8250.mp4' 
    let pp4 = 'https://telegra.ph/file/e6c7b3f7d482ae42db9a7.mp4' 
    let pp5 = 'https://telegra.ph/file/a61b52737df7459580129.mp4' 
    let pp6 = 'https://telegra.ph/file/f34e1d5c8f17bd2739a51.mp4' 
    let pp7 = 'https://telegra.ph/file/c345ed1ca18a53655f857.mp4' 
    let pp8 = 'https://telegra.ph/file/4eec929f54bc4d83293a3.mp4' 
    let pp9 = 'https://telegra.ph/file/856e38b2303046990531c.mp4' 
    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9];
    const video = videos[Math.floor(Math.random() * videos.length)];
    conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption:str, mentions: [m.sender] },{ quoted: estilo })
    };
   
}

handler.help = ['dormir @tag'];
handler.tags = ['fun'];
handler.command = ['laugh','reirse'];
handler.group = true;

export default handler;