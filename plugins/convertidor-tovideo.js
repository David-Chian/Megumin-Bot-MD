import {webp2mp4} from '../lib/webp2mp4.js';
import {ffmpeg} from '../lib/converter.js';
const handler = async (m, {conn, usedPrefix, command}) => {
  if (!m.quoted) throw `*🛑 Responda A Un Sticker Que Desee Convertir En  Video Con El Comando ${usedPrefix + command}*`;
  const mime = m.quoted.mimetype || '';
  if (!/webp/.test(mime)) throw `*🛑 Responda A Un Sticker Que Desee Convertir En  Video Con El Comando ${usedPrefix + command}*`;
  const media = await m.quoted.download();
  let out = Buffer.alloc(0);
  conn.reply(m.chat, wait, m, {
  contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
  title: packname,
  body: wm,
  previewType: 0, thumbnail: icons,
  sourceUrl: channel }}})
  if (/webp/.test(mime)) {
    out = await webp2mp4(media);
  } else if (/audio/.test(mime)) {
    out = await ffmpeg(media, [
      '-filter_complex', 'color',
      '-pix_fmt', 'yuv420p',
      '-crf', '51',
      '-c:a', 'copy',
      '-shortest',
    ], 'mp3', 'mp4');
  }
  await conn.sendFile(m.chat, out, 'error.mp4', '*🌳 Su Video*', m, 0, {thumbnail: out});
};
handler.help = ['tovideo'];
handler.tags = ['transformador'];
handler.group = true;
handler.register = true
handler.command = ['tovideo', 'tomp4', 'mp4', 'togif'];
export default handler;