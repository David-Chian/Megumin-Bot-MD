const handler = async (m, {conn}) => {
  try {
    const pp = imagen10;
    const img = await(await fetch('https://images3.alphacoders.com/125/1251707.png')).buffer();
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    await conn.sendMessage(m.chat, { react: { text: '🤠', key: m.key } })
    const str = `
┏✧ » ◇ « ✧ » ✦ « ✧ » ◇ « ✧
┃⍣ 𝙈𝙚𝙜𝙪𝙢𝙞𝙣-𝘽𝙤𝙩✨️🌻
┃
┃⍣👋🏻𝘏𝘰𝘭𝘢: ${taguser}
┃
┃⍣ *ꨄ︎ ⏳️ 𝘈𝘤𝘵𝘪𝘷𝘰:* ${uptime}
┃⍣ *ꨄ︎ ✅ 𝘉𝘰𝘵 𝘜𝘴𝘰 𝘗𝘶𝘣𝘭𝘪𝘤𝘰*
┃⍣ *ꨄ︎ 🦁 𝘖𝘸𝘯𝘦𝘳: David Chian*
┃⍣ *ꨄ︎ 🔗 𝘊𝘶𝘦𝘯𝘵𝘢𝘴 𝘖𝘧𝘤:* https://chat.whatsapp.com/H5bw4MJucS1BBHnZ9wv3vI
╰✧ » ◇ « ✧ » ✦ « ✧ » ◇ « ✧`.trim();
        const doc = [
    "pdf",
    "zip",
    "vnd.openxmlformats-officedocument.presentationml.presentation",
    "vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
const document = doc[Math.floor(Math.random() * doc.length)];
  const Message = {
    document: { url: `https://chat.whatsapp.com/H5bw4MJucS1BBHnZ9wv3vI` },
    mimetype: `application/${document}`,
    fileName: `「 𝘔𝘦𝘨𝘶𝘮𝘪𝘯-𝘉𝘰𝘵💥 」`,
    fileLength: 99999999999999,
    pageCount: 200,
    contextInfo: {
      forwardingScore: 200,
      isForwarded: true,
      externalAdReply: {
showAdAttribution: !![],
            mediaType: 0x1,
            previewType: "PHOTO",
        title: "Eʟ Bᴏᴛ Mᴀs Exᴘʟᴏsɪᴠᴏ!",
        thumbnail: imagen10,
        renderLargerThumbnail: !![],
        sourceUrl: "https://chat.whatsapp.com/H5bw4MJucS1BBHnZ9wv3vI",
      },
    },
    caption: str,
    footer: wm,
    headerType: 6,
  };
    if (m.isGroup) {
      conn.sendMessage(m.chat, {text: Message.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), contextInfo: {forwardingScore: 9999999, isForwarded: true, mentionedJid: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.titulowm, "containsAutoReply": true, "mediaType": 1, "thumbnail": pp, "mediaUrl": `https://youtube.com/@davidchian4957`, "sourceUrl": `https://youtube.com/@davidchian4957`}}}, {quoted: m});
    } else {
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {text: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), contextInfo: {forwardingScore: 9999999, isForwarded: true, mentionedJid: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.titulowm, "containsAutoReply": true, "mediaType": 1, "thumbnail": pp, "mediaUrl": ``, "sourceUrl": `https://youtube.com/@davidchian4957`}}}, {quoted: fkontak2});
    }
  } catch {
  }
};
handler.help = ['estado'];
handler.tags = ['main'];
handler.command = ['estado','status','estate','state','stado','stats','runtime','uptime'];
export default handler;
function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [`\n│ *=> 💥 ` + d, ' Día(s)* ', `\n│ *=> 💫 ` + h, ' Hora(s)* ', `\n│ *=> 💠 ` + m, ' Minuto(s)* ', `\n│ *=> ♦ ` + s, ' Segundo(s)* '].map((v) => v.toString().padStart(2, 0)).join('');
}
