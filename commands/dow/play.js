import yts from 'yt-search';
import fetch from 'node-fetch';
import sharp from 'sharp'

const limit = 100; // Max file size in MB

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(url);

const fetchWithFallback = async (url, primaryApi, fallbackApis) => {
  for (const api of [primaryApi, ...fallbackApis]) {
    try {
      const response = await fetch(api.url(url));
      const result = await response.json();
      if (api.validate(result)) {
        return api.parse(result);
      }
      console.warn(`API ${api.url(url)} failed validation:`, result);
    } catch (e) {
      console.error(`Error with API ${api.url(url)}:`, e);
    }
  }
  throw new Error('All APIs failed');
};

export default {
  command: ['play', 'mp3', 'playaudio', 'ytmp3', 'play2', 'mp4', 'playvideo', 'ytmp4'],
  category: 'downloader',
  run: async ({client, m, args, command, text}) => {
  try {
    if (!text.trim()) {
      return client.reply(m.chat, '✎ Ingresa el nombre de la música o una URL de YouTube.', m);
    }

    const esURL = isYTUrl(text);
    let url, title, videoInfo;

    if (!esURL) {
      const search = await yts(text);
      if (!search.all.length) return m.reply('✎ No se encontraron resultados.');
      videoInfo = search.all[0];
      ({ title, url } = videoInfo);

      const vistas = (videoInfo.views || 0).toLocaleString();
      const canal = videoInfo.author?.name || 'Desconocido';
      const timestamp = videoInfo.duration?.toString() || 'Desconocido';
const ago = videoInfo.ago || 'Desconocido';
      const infoMessage = `
*𖹭.╭╭ִ╼ׅ࣪ﮩ٨ـﮩ𝗒𝗈𝗎𝗍𝗎𝗏𝖾-𝗉꯭𝗅꯭𝖺꯭𝗒ﮩ٨ـﮩׅ╾࣪╮╮.𖹭*
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

      let thumb;
      try {
        thumb = (await client.getFile(videoInfo.thumbnail))?.data;
      } catch (e) {
        console.error('Error fetching thumbnail:', e);
      }
      await client.sendMessage(m.chat, thumb ? { image: thumb, caption: infoMessage } : { text: infoMessage }, { quoted: m });
    } else {
      url = text;
      try {
        videoInfo = await yts({ videoId: new URL(url).searchParams.get('v') || url.split('/').pop() });
        ({ title } = videoInfo);
      } catch (e) {
        console.error('Error fetching metadata for URL:', e);
        title = 'Desconocido';
      }
    }
      let qu = ['128', '255', '320'];
      let randomQuality = qu[Math.floor(Math.random() * qu.length)];
    const primaryApi = {
      url: (url) => `${api.url}/dl/${['play', 'mp3', 'playaudio', 'ytmp3'].includes(command) ? 'ytmp3' : 'ytmp4'}?url=${encodeURIComponent(url)}&quality=${randomQuality}&key=${api.key}`,
      validate: (result) => result.status && result.data && result.data.dl && result.data.title,
      parse: (result) => ({ dl: result.data.dl, title: result.data.title })
    };

const nekolabsApi = {
  url: (url) =>
    `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(
      url
    )}&format=${
      ['play', 'mp3', 'playaudio', 'ytmp3'].includes(command)
        ? 'mp3'
        : '720'
    }`,
  validate: (result) =>
    result.success &&
    result.result &&
    result.result.downloadUrl,
  parse: (result) => ({
    dl: result.result.downloadUrl,
    title: result.result.title,
    thumb: result.result.cover
  })
};

    const aioApi = {
      url: (url) => `https://anabot.my.id/api/download/aio?url=${encodeURIComponent(url)}&apikey=freeApikey`,
      validate: (result) => !result.error && result.medias && result.medias.length > 0,
      parse: (result) => {
        const isAudio = ['play', 'mp3', 'playaudio', 'ytmp3'].includes(command);
        const media = result.medias.find(m => 
          isAudio ? m.type === 'audio' && ['m4a', 'opus'].includes(m.ext) : 
          m.type === 'video' && m.ext === 'mp4' && m.height <= 720
        );
        if (!media) throw new Error('No suitable media format found');
        return { dl: media.url, title: result.title };
      }
    };

const { dl, title: apiTitle } = 
  await fetchWithFallback(url, primaryApi, [nekolabsApi, aioApi]);
  let thumbBuffer;
try {
  const response = await fetch(videoInfo.thumbnail);
  const arrayBuffer = await response.arrayBuffer();

  thumbBuffer = await sharp(Buffer.from(arrayBuffer))
    .resize(320, 180)
    .jpeg({ quality: 80 })
    .toBuffer();
} catch (e) {
  m.reply(`Error al procesar la miniatura ${e.message}`)
  thumbBuffer = null;
}

    if (['play', 'mp3', 'playaudio', 'ytmp3'].includes(command)) {
      if (!dl || !/^https?:\/\//.test(dl)) return m.reply('✎ Enlace de descarga inválido.');

await client.sendMessage(
  m.chat,
  {
    document: { url: dl },
    mimetype: 'audio/mpeg',
    fileName: `${apiTitle || title}.mp3`,
    jpegThumbnail: thumbBuffer
  },
  { quoted: m }
);
} else if (['play2', 'mp4', 'playvideo', 'ytmp4'].includes(command)) {
  if (!dl || !/^https?:\/\//.test(dl)) return m.reply('✎ Enlace de descarga inválido.');

  const res = await fetch(dl);
  const contentLength = res.headers.get('Content-Length');
  const fileSize = contentLength ? parseInt(contentLength, 10) / (1024 * 1024) : null;
  const exceedsLimit = fileSize ? fileSize >= limit : true;

  if (exceedsLimit) {
    await client.sendMessage(
      m.chat,
      {
        document: { url: dl },
        fileName: `${apiTitle || title}.mp4`,
        mimetype: 'video/mp4',
        caption: dev
      },
      { quoted: m }
    );
  } else {
    await client.sendMessage(
      m.chat,
      {
        video: { url: dl },
        fileName: `${apiTitle || title}.mp4`,
        mimetype: 'video/mp4',
        jpegThumbnail: thumbBuffer
      },
      { quoted: m }
    );
  }
}
            } catch (error) {
  m.reply(`Error:\n${error.message}\n${error?.stack || error}`)
  }
}}