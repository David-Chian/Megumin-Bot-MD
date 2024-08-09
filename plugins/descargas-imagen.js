import {googleImage} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*🚩 Uso Correcto: ${usedPrefix + command} Ai Yaemori*`;
  conn.reply(m.chat, '🚩 *Descargando su imagen...*', m, {
  contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
  title: packname,
  body: wm,
  previewType: 0, thumbnail: icons,
  sourceUrl: channel }}})
  const res = await googleImage(text);
  const image = await res.getRandom();
  const link = image;
  conn.sendFile(m.chat, link, 'error.jpg', `*🔎 Resultado De: ${text}*\n> ${textbot}`, m, null, rcanal);
};
handler.help = ['imagen <query>'];
handler.tags = ['buscador', 'tools', 'descargas'];
handler.command = ['image','imagen'];
handler.group = true;
handler.register = true
export default handler;
