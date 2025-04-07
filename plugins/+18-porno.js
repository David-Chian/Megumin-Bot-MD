import axios from 'axios';

const handler = async (m, { command, conn, usedPrefix }) => {
  
  if (!db.data.chats[m.chat].nsfw && m.isGroup) return m.reply('🚩 *¡Estos comandos están desactivados!*');

  const comandos = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yaoi', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];

  const res = (await axios.get(`https://raw.githubusercontent.com/CheirZ/HuTao-Proyect/master/src/JSON/${command}.json`)).data;
  const haha = await res[Math.floor(res.length * Math.random())];
  const caption = `*${command}* 🔥`;

  let otros = comandos.filter(c => c !== command);
  let [random1, random2] = otros.sort(() => 0.5 - Math.random()).slice(0, 2);

  await conn.sendMessage(m.chat, {
    image: { url: haha },
    caption,
    footer: wm,
    buttons: [
      { buttonId: `.${command}`, buttonText: { displayText: "🔥 sɪɢᴜɪᴇɴᴛᴇ 🔥" }, type: 1 },
      { buttonId: `.${random1}`, buttonText: { displayText: `🎲 ${random1} 🔥` }, type: 1 },
      { buttonId: `.${random2}`, buttonText: { displayText: `🎲 ${random2} 🔥` }, type: 1 },
    ],
    headerType: 4,
  }, { quoted: m });
};

handler.help = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yaoi', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];
handler.command = handler.help;
handler.tags = ['nsfw'];
handler.group = true;
handler.register = true;

export default handler;