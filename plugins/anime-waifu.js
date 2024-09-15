import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react(emojis);
    conn.reply(m.chat, '🍟 Buscando Su *Waifu*', m, {
      contextInfo: { 
        externalAdReply: { 
          mediaUrl: null, 
          mediaType: 1, 
          showAdAttribution: true,
          title: packname,
          body: wm,
          previewType: 0, 
          thumbnail: icons,
          sourceUrl: channel 
        }
      }
    });

    let res = await fetch('https://api.waifu.pics/sfw/waifu');
    if (!res.ok) return;
    let json = await res.json();
    if (!json.url) return;

    await conn.sendFile(m.chat, json.url, 'waifu.jpg', '🍧 *W A I F U* 🍧', m, {
      buttons: [
        { buttonId: '/waifu', buttonText: { displayText: 'Siguiente 💖' }, type: 1 }
      ],
      headerType: 4,
    });

  } catch (e) {
    console.error(e);
  }
};

handler.help = ['waifu'];
handler.tags = ['anime'];
handler.command = ['waifu'];
handler.group = true;
handler.register = true;

export default handler;