import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
const MAX_SIZE_MB = 100

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = globalThis.db.data.users[m.sender];

  if (user.chocolates < 2) {
    return conn.reply(m.chat, `💔 No tienes suficientes 🍫 Chocolates. Necesitas 2 más para usar este comando.`, m);
  }

  if (!text.trim()) {
    return conn.reply(m.chat, `✧ Ingresa el nombre de la música a descargar.`, m);
  }
  try {
    const search = await yts(text);
    if (!search.all.length) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';
    const infoMessage = `
*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ♡̫𝗆𝖾𝗀֟፝𝗎꯭𝗆𝗂꯭𝗇♡ִ̫ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*
> ♡ *Título:* ${title || 'Desconocido'}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ *Duración:* ${timestamp || 'Desconocido'}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ *Vistas:* ${vistas || 'Desconocido'}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ *Canal:* ${canal}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ *Publicado:* ${ago || 'Desconocido'}
*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*`;

    const thumb = (await conn.getFile(thumbnail)).data;

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    };

    await conn.reply(m.chat, infoMessage, m, JT);

    let api, result, fileSizeMB;
    if (command === 'play' || command === 'mp3') {
      api = await fetchAPI(url, 'audio');
      result = api.download || api.data.url;
      fileSizeMB = await getFileSize(result);

      if (fileSizeMB > MAX_SIZE_MB) {
        await conn.sendMessage(m.chat, { document: { url: result }, fileName: `${api.title || api.data.filename}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { audio: { url: result }, fileName: `${api.title || api.data.filename}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
      }
    } else if (command === 'play2' || command === 'mp4') {
      api = await fetchAPI(url, 'video');
      result = api.download || api.data.url;
      fileSizeMB = await getFileSize(result);

      if (fileSizeMB > MAX_SIZE_MB) {
        await conn.sendMessage(m.chat, { document: { url: result }, fileName: `${api.title || api.data.filename}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { video: { url: result }, fileName: api.title || api.data.filename, mimetype: 'video/mp4', caption: 'Aquí está tu video 📽️', thumbnail: api.thumbnail || thumb }, { quoted: m });
      }
    } else {
      throw new Error("Comando no reconocido.");
    }

    user.chocolates -= 2
    conn.reply(m.chat, `💥 Has utilizado 2 🍫 Chocolates`, m);

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`);
  }
};

const fetchAPI = async (url, type) => {
    const fallbackEndpoints = {
      audio: `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`,
      video: `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=720p&apikey=GataDios`,
    };
    const response = await fetch(fallbackEndpoints[type]);
    return await response.json();
};

const getFileSize = async (url) => {
  try {
    const response = await axios.head(url);
    const sizeInBytes = response.headers['content-length'] || 0;
    return parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
  } catch (error) {
    console.error("Error obteniendo el tamaño del archivo:", error);
    return 0;
  }
}
handler.command = handler.help = ['play', 'mp3', 'play2', 'mp4'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views === undefined) return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`;
  return views.toString();
}