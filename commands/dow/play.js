import yts from 'yt-search';
import fetch from 'node-fetch';
import sharp from 'sharp'
import axios from 'axios'
import crypto from 'crypto'

const limit = 100; // Max file size in MB

class SaveTube {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    this.m =
      /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        origin: 'https://yt.savetube.me',
        'user-agent':
          'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0'
      }
    })
  }

  async decrypt(enc) {
    const [sr, ky] = [Buffer.from(enc, 'base64'), Buffer.from(this.ky, 'hex')]
    const [iv, dt] = [sr.slice(0, 16), sr.slice(16)]
    const dc = crypto.createDecipheriv('aes-128-cbc', ky, iv)
    return JSON.parse(Buffer.concat([dc.update(dt), dc.final()]).toString())
  }

  async getCdn() {
    const r = await this.is.get('https://media.savetube.vip/api/random-cdn')
    return r.data.cdn
  }

  async download(url, isAudio) {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error('ID inválido')

    const cdn = await this.getCdn()

    const info = await this.is.post(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })

    const dec = await this.decrypt(info.data.data)

    const dl = await this.is.post(`https://${cdn}/download`, {
      id,
      downloadType: isAudio ? 'audio' : 'video',
      quality: isAudio ? '128' : '720',
      key: dec.key
    })

    return {
      dl: dl.data.data.downloadUrl,
      title: dec.title
    }
  }
}

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(url);

const fetchParallelFirstValid = async (url, apis, timeout = 15000) => {
  return new Promise((resolve, reject) => {
    let settled = false
    let errors = 0

    const timer = setTimeout(() => {
      if (!settled) reject(new Error('Timeout: todas las APIs tardaron demasiado'))
    }, timeout)

    apis.forEach(api => {
      ;(async () => {
        try {
          let result

          if (api.custom) {
            result = await api.run(url)
            if (result?.dl) {
              if (!settled) {
                settled = true
                clearTimeout(timer)
                resolve(result)
              }
            }
            return
          }

          const res = await fetch(api.url(url))
          const json = await res.json()

          if (api.validate(json)) {
            const parsed = await api.parse(json)
            if (parsed?.dl && !settled) {
              settled = true
              clearTimeout(timer)
              resolve(parsed)
            }
          } else {
            errors++
          }
        } catch {
          errors++
        }

        if (errors === apis.length && !settled) {
          clearTimeout(timer)
          reject(new Error('Todas las APIs fallaron'))
        }
      })()
    })
  })
}
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
    
    const anabotMp4Api = {
  url: (url) =>
    `https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(url)}&quality=720&apikey=freeApikey`,
  validate: (result) =>
    result?.success &&
    result?.data?.result?.success &&
    result?.data?.result?.urls,
  parse: (result) => ({
    dl: result.data.result.urls,
    title: result.data.result.metadata?.title
  })
}

const anabotMp3Api = {
  url: (url) =>
    `https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(url)}&apikey=freeApikey`,
  validate: (result) =>
    result?.success &&
    result?.data?.result?.success &&
    result?.data?.result?.urls,
  parse: (result) => ({
    dl: result.data.result.urls,
    title: result.data.result.metadata?.title
  })
}

const nexevoMp3Api = {
  url: (url) =>
    `https://nexevo-api.vercel.app/download/y?url=${encodeURIComponent(url)}`,
  validate: (result) =>
    result?.status &&
    result?.result?.status &&
    result?.result?.url,
  parse: (result) => ({
    dl: result.result.url,
    title: result.result.info?.title || 'Audio'
  })
}
const nexevoMp4Api = {
  url: (url) =>
    `https://nexevo-api.vercel.app/download/y2?url=${encodeURIComponent(url)}`,
  validate: (result) =>
    result?.status &&
    result?.result?.status &&
    result?.result?.url,
  parse: (result) => ({
    dl: result.result.url,
    title: result.result.info?.title || 'Video'
  })
}

const saveTubeFallback = {
  custom: true,
  run: async (url) => {
    const sv = new SaveTube()
    return await sv.download(url, isAudio)
  }
}

const isAudio = ['play', 'mp3', 'playaudio', 'ytmp3'].includes(command)

const apis = isAudio
  ? [
      nexevoMp3Api,
      anabotMp3Api,
      nekolabsApi,
      aioApi,
      saveTubeFallback
    ]
  : [
      nexevoMp4Api,
      anabotMp4Api,
      nekolabsApi,
      aioApi,
      saveTubeFallback
    ]

const { dl, title: apiTitle } = await fetchParallelFirstValid(url, apis)

  let thumbBuffer = null

if (videoInfo?.thumbnail) {
  try {
    const response = await fetch(videoInfo.thumbnail)
    const arrayBuffer = await response.arrayBuffer()

    thumbBuffer = await sharp(Buffer.from(arrayBuffer))
      .resize(320, 180)
      .jpeg({ quality: 80 })
      .toBuffer()
  } catch {}
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