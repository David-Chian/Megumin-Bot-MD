import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return;
  try {
    const pp = imagen1;
    // let vn = './media/menu.mp3'
    const img = './Menu2.jpg';
    const d = new Date(new Date + 3600000);
    const locale = 'es-ES';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: '2-digit', month: '2-digit', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, estrellas, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const rtotal = Object.entries(global.db.data.users).length || '0'
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
 await m.react(emojis)
const document = doc[Math.floor(Math.random() * doc.length)];
 const str = `> 𝙈𝙀𝙉𝙐 𝘿𝙀 𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀 ⚔. 
 
★ 𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀 ★
⭐ ➺ 🎫.donarsala
⭐ ➺ 🗼.𝘉𝘦𝘳𝘮𝘶𝘥𝘢
⭐ ➺ 🏝️.𝘗𝘶𝘳𝘨𝘢𝘵𝘰𝘳𝘪𝘰
⭐ ➺ 🏜️.𝘒𝘢𝘭𝘢𝘩𝘢𝘳𝘪
⭐ ➺ 🏗️.𝘕𝘦𝘹𝘵𝘦𝘳𝘳𝘢
⭐ ➺ 🏞️.𝘈𝘭𝘱𝘦𝘴

▸▸ 𝙇𝙄𝙎𝙏𝘼 𝙑𝙀𝙍𝙎𝙐𝙎 ⚔ ◂◂

𝘚𝘐𝘎𝘕𝘐𝘍𝘐𝘊𝘈𝘋𝘖𝘚: 𝘏𝘏:𝘔𝘔 (𝘏𝘖𝘙𝘈:𝘔𝘐𝘕𝘜𝘛𝘖𝘚) 
𝘊𝘗 (𝘊𝘖𝘋𝘐𝘎𝘖 𝘋𝘌 𝘗𝘈𝘐𝘚) 𝘗𝘈𝘙𝘈 𝘓𝘈 𝘏𝘖𝘙𝘈 (𝘔𝘟, 𝘊𝘖, 𝘊𝘓 𝘠 𝘈𝘙) 
𝘊𝘙 (𝘊𝘖𝘓𝘖𝘙 𝘋𝘌 𝘙𝘖𝘗𝘈)
𝘌𝘫𝘦𝘮𝘱𝘭𝘰: .4𝘷𝘴4 22:30 𝘔𝘟

⚔ ➺.4𝘷𝘴4 𝘏𝘏:𝘔𝘔 𝘊𝘗
⚔ ➺.12𝘷𝘴12 𝘏𝘏:𝘔𝘔 𝘊𝘙`.trim();     if (m.isGroup) { 
 // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: m});
    } else {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    }
  } catch {
  await m.react(error)
  await conn.reply(m.chat, '*🚩 Ocurrió un error inesperado.*', m, fake);
  }
};
handler.tags = ['ff', 'main']
handler.help = ['menuff']
handler.command = ['menuff', 'menufreefire'];
handler.register = true
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}