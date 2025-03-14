import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';

const MAX_SIZE_MB = 100;
const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav'];
const formatVideo = ['360', '480', '720', '1080', '1440', '4k'];

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = globalThis.db.data.users[m.sender];

  if (user.cookies < 2) {
    return conn.reply(m.chat, `💔 No tienes suficientes 🍪 Cookies. Necesitas 2 más para usar este comando.`, m);
  }

  if (!text.trim()) {
    return conn.reply(m.chat, `✧ Ingresa el nombre de la música o video a descargar.`, m);
  }

  try {
    const search = await yts(text);
    if (!search.all.length) return m.reply('No se encontraron resultados.');

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;
    const infoMessage = `
*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ♡̫𝗆𝖾𝗀֟፝𝗎꯭𝗆𝗂꯭𝗇♡ִ̫ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*
> ♡ Título:* ${title}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ Duración:* ${timestamp || 'Desconocido'}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ Vistas:* ${formatViews(views)}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ Canal:* ${author.name || 'Desconocido'}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> ♡ Publicado:* ${ago || 'Desconocido'}
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
    const type = command.includes('mp4') ? 'video' : 'audio';

    api = await fetchWithFallback(url, type);
    result = api.download || api.data.url || api.downloadUrl;

    fileSizeMB = await getFileSize(result);
    const isLargeFile = fileSizeMB > MAX_SIZE_MB;

    if (type === 'audio') {
      await conn.sendMessage(m.chat, {
        [isLargeFile ? 'document' : 'audio']: { url: result },
        fileName: `${api.title || api.data.filename}.mp3`,
        mimetype: 'audio/mpeg',
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        [isLargeFile ? 'document' : 'video']: { url: result },
        fileName: `${api.title || api.data.filename}.mp4`,
        mimetype: 'video/mp4',
        caption: isLargeFile ? '' : `🎬 *Título:* ${title}\n🔗 *URL:* ${url}`,
        thumbnail: api.thumbnail || thumb,
      }, { quoted: m });
    }

    user.cookies -= 2;
    conn.reply(m.chat, `💥 Has utilizado 2 🍪 Cookies`, m);
  } catch (error) {
    console.error(error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

const fetchWithFallback = async (url, type) => {
  const apis = {
    neoxr: `https://api.neoxr.eu/api/youtube?url=${url}&type=${type}&quality=${type === 'audio' ? '128kbps' : '720p'}&apikey=GataDios`,
    y2mate: `https://y2mate.bhadran.com/api/youtube/${type === 'audio' ? 'mp3' : 'mp4'}?url=${url}`,
    delirius: `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`,
  };

  for (let key of Object.keys(apis)) {
    try {
      const response = await fetchWithTimeout(apis[key], 10000);
      const json = await response.json();
      if (json.download || json.result?.download_url) return json;
    } catch (error) {
      console.warn(`⚠️ ${key} falló, intentando con la siguiente...`);
    }
  }
  try {
    return await ddownr.download(url, type === 'audio' ? 'mp3' : '720');
  } catch (error) {
    throw new Error(`⚠️ Todas las APIs fallaron, ${error.message}`);
  }
};

const fetchWithTimeout = (url, timeout) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => setTimeout(() => reject(new Error("⏳ Tiempo de espera agotado")), timeout))
  ]);
};

const getFileSize = async (url) => {
  try {
    const response = await axios.head(url);
    return parseFloat((response.headers['content-length'] || 0) / (1024 * 1024)).toFixed(2);
  } catch (error) {
    console.error("Error obteniendo el tamaño del archivo:", error);
    return 0;
  }
};

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error('⚠️ Formato no válido. Usa mp3 para audio o 360/480/720p para video.');
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      const response = await axios.request(config);
      if (response.data && response.data.success) {
        const { id, title, info } = response.data;
        const downloadUrl = await ddownr.cekProgress(id);
        return { id, image: info.image, title, downloadUrl };
      } else {
        throw new Error('⚠️ No se pudo obtener la información del video.');
      }
    } catch (error) {
      console.error('Error en ddownr:', error);
      throw error;
    }
  },
  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data && response.data.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      throw error;
    }
  }
};

handler.command = ['play', 'mp3', 'play2', 'mp4'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`;
  return views.toString();
}