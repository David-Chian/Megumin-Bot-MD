import yts from 'yt-search';
import fetch from 'node-fetch';
import sharp from 'sharp';
import axios from 'axios';
import crypto from 'crypto';
import NodeID3 from 'node-id3';
import Lyrics from 'song-lyrics-api';
import lyric from '@green-code/music-track-data';
import { getBuffer } from '../../core/message.ts';
import { upload } from '../../core/uploadImage.ts';

const LIMIT_MB    = 100;
const ANABOT_KEY  = 'freeApikey';

const lyricsClient = new Lyrics();

const LYRICS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
};

async function tryLrclib(query: string): Promise<string> {
  const res = await axios.get(
    `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
    { headers: LYRICS_HEADERS, timeout: 10000 }
  );
  const results = res.data;
  if (!results?.length || !results[0].plainLyrics) throw new Error('lrclib: sin letra');
  return results[0].plainLyrics;
}

async function tryLyricsOvh(query: string): Promise<string> {
  const parts  = query.trim().split(/\s+/);
  const mid    = Math.ceil(parts.length / 2);
  const artist = parts.slice(0, mid).join(' ');
  const title  = parts.slice(mid).join(' ') || artist;
  const res    = await axios.get(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
    { headers: LYRICS_HEADERS, timeout: 10000 }
  );
  if (!res.data?.lyrics) throw new Error('lyrics.ovh: sin letra');
  return res.data.lyrics.trim();
}

async function tryLyricsV2(query: string): Promise<string> {
  const info = await lyric.getTracks(query);
  if (!info?.length) throw new Error('lyricsv2: sin tracks');
  const { title, artist } = info[0];
  const ly = await lyricsClient.getLyrics(`${title} ${artist}`);
  if (!ly?.length || !ly[0].lyrics?.lyrics) throw new Error('lyricsv2: sin letra');
  return ly[0].lyrics.lyrics;
}

function raceLyrics(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    let resolved   = false;
    let errorCount = 0;
    const scrapers = [tryLrclib, tryLyricsOvh, tryLyricsV2];
    const total    = scrapers.length;

    const done = (lyrics: string) => {
      if (!resolved) { resolved = true; resolve(lyrics); }
    };
    const fail = () => {
      errorCount++;
      if (errorCount === total && !resolved) resolve(null);
    };

    for (const scraper of scrapers) {
      scraper(query).then(done).catch(fail);
    }
  });
}

class SaveTube {
  ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
  m  = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/;
  is = axios.create({
    headers: {
      'content-type': 'application/json',
      origin:         'https://yt.savetube.me',
      'user-agent':   'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0',
    },
  });

  async decrypt(enc: string) {
    const sr = Buffer.from(enc, 'base64');
    const ky = Buffer.from(this.ky, 'hex');
    const iv = sr.slice(0, 16);
    const dt = sr.slice(16);
    const dc = crypto.createDecipheriv('aes-128-cbc', ky, iv);
    return JSON.parse(Buffer.concat([dc.update(dt), dc.final()]).toString());
  }

  async getCdn() {
    const r = await this.is.get('https://media.savetube.vip/api/random-cdn');
    return r.data.cdn;
  }

  async download(url: string, isAudio: boolean) {
    const id = url.match(this.m)?.[3];
    if (!id) throw new Error('ID inválido');
    const cdn  = await this.getCdn();
    const info = await this.is.post(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`,
    });
    const dec = await this.decrypt(info.data.data);
    const dl  = await this.is.post(`https://${cdn}/download`, {
      id,
      downloadType: isAudio ? 'audio' : 'video',
      quality:      isAudio ? '128'   : '720',
      key:          dec.key,
    });
    return { dl: dl.data.data.downloadUrl, title: dec.title };
  }
}

const playaudio = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      origin:            'https://frame.y2meta-uk.com',
      'user-agent':      'Mozilla/5.0',
    },
  }),

  resolvePayload(link: string, f = '128k') {
    if (!['128k', '320k'].includes(f)) throw new Error('⚠ Formato inválido');
    return { link, format: 'mp3', audioBitrate: f.replace('k', ''), filenameStyle: 'pretty' };
  },

  async getKey(): Promise<{ key: string }> {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', { headers: this.static.headers });
    return r.json() as any;
  },

  async convert(u: string, f: string) {
    const { key } = await this.getKey();
    const payload = this.resolvePayload(u, f);
    const r = await fetch(this.static.baseUrl + '/v2/converter', {
      method:  'post',
      headers: { ...this.static.headers, key },
      body:    new URLSearchParams(payload as any),
    });
    return r.json() as any;
  },

  async download(u: string, f = '128k'): Promise<{ dl: string; title?: string }> {
    const { url, filename } = await this.convert(u, f);
    if (!url || !/^https?:\/\//.test(url)) throw new Error(`✎ URL inválida: ${url}`);
    const buffer = await fetch(url).then(r => r.arrayBuffer()).then(b => Buffer.from(b));
    const dl     = await upload(buffer, 'audio/mp3');
    return { dl, title: filename };
  },
};

async function ytmp4Scraper(url: string): Promise<{ dl: string; title?: string }> {
  const response = await axios.post(
    'https://puruboy-api.vercel.app/api/downloader/youtube',
    { url },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept':     'application/json',
      },
    }
  );
  const result = response.data?.result || {};
  if (!result.downloadUrl) throw new Error('ytmp4Scraper: sin URL');
  return { dl: result.downloadUrl, title: result.title };
}

async function ytmp3Scraper(url: string): Promise<{ dl: string; title?: string }> {
  const response = await axios.post(
    'https://puruboy-api.vercel.app/api/downloader/ytmp3',
    { url },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept':     'application/json',
      },
    }
  );
  const result = response.data?.result || {};
  if (!result.download_url) throw new Error('ytmp3Scraper: sin URL');
  return { dl: result.download_url, title: result.title };
}

async function anabotPlaymusic(query: string): Promise<{ dl: string; title?: string }> {
  const res = await fetch(
    `https://anabot.my.id/api/download/playmusic?query=${encodeURIComponent(query)}&apikey=${ANABOT_KEY}`
  ).then(r => r.json() as any);
  const result = res?.data?.result;
  if (!result?.success || !result.urls) throw new Error('anabotPlaymusic: sin URL');
  return { dl: result.urls, title: result.metadata?.title };
}

async function anabotYtmp3(url: string): Promise<{ dl: string; title?: string }> {
  const res = await fetch(
    `https://anabot.my.id/api/download/ytmp3?url=${encodeURIComponent(url)}&apikey=${ANABOT_KEY}`
  ).then(r => r.json() as any);
  const result = res?.data?.result;
  if (!result?.success || !result.urls) throw new Error('anabotYtmp3: sin URL');
  return { dl: result.urls, title: result.metadata?.title };
}

async function anabotYtmp4(url: string): Promise<{ dl: string; title?: string }> {
  const res = await fetch(
    `https://anabot.my.id/api/download/ytmp4?url=${encodeURIComponent(url)}&quality=480&apikey=${ANABOT_KEY}`
  ).then(r => r.json() as any);
  const result = res?.data?.result;
  if (!result?.success || !result.urls) throw new Error('anabotYtmp4: sin URL');
  return { dl: result.urls, title: result.metadata?.title };
}

const isYTUrl = (u: string) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(u);

type ApiDef = {
  custom?:   boolean;
  url?:      (u: string) => string;
  validate?: (res: any)  => boolean;
  parse?:    (res: any)  => { dl: string; title?: string };
  run?:      (u: string) => Promise<{ dl: string; title?: string }>;
};

const buildApis = (isAudio: boolean, originalQuery: string): ApiDef[] => {
  const scraperAudio: ApiDef = {
    custom: true,
    run: async (u) => {
      try { return await ytmp3Scraper(u); } catch {}
      return playaudio.download(u, '128k');
    },
  };

  const anabotAudioByUrl: ApiDef = {
    custom: true,
    run: (u) => anabotYtmp3(u),
  };

  const anabotAudioByQuery: ApiDef = {
    custom: true,
    run: (_u) => anabotPlaymusic(originalQuery),
  };

  const diegoMp3V1: ApiDef = {
    url:      (u) => `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.result?.downloadUrl,
    parse:    (r) => ({ dl: r.result.downloadUrl, title: r.result.title }),
  };

  const diegoMp3V2: ApiDef = {
    url:      (u) => `https://api.siputzx.my.id/api/d/ytmp3v2?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.data?.dl,
    parse:    (r) => ({ dl: r.data.dl, title: r.data.title }),
  };

  const nexevoMp3: ApiDef = {
    url:      (u) => `https://nexevo-api.vercel.app/download/y?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.result?.url,
    parse:    (r) => ({ dl: r.result.url, title: r.result.info?.title }),
  };

  const saveTubeAudio: ApiDef = {
    custom: true,
    run: (u) => new SaveTube().download(u, true),
  };

  const scraperVideo: ApiDef = {
    custom: true,
    run: (u) => ytmp4Scraper(u),
  };

  const anabotVideo: ApiDef = {
    custom: true,
    run: (u) => anabotYtmp4(u),
  };

  const diegoMp4V1: ApiDef = {
    url:      (u) => `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.result?.downloadUrl,
    parse:    (r) => ({ dl: r.result.downloadUrl, title: r.result.title }),
  };

  const diegoMp4V2: ApiDef = {
    url:      (u) => `https://api.siputzx.my.id/api/d/ytmp4v2?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.data?.dl,
    parse:    (r) => ({ dl: r.data.dl, title: r.data.title }),
  };

  const nexevoMp4: ApiDef = {
    url:      (u) => `https://nexevo-api.vercel.app/download/y2?url=${encodeURIComponent(u)}`,
    validate: (r) => r.status && r.result?.url,
    parse:    (r) => ({ dl: r.result.url, title: r.result.info?.title }),
  };

  const fgsiApiVideo: ApiDef = {
    custom: true,
    run: async (u) => {
      const res = await fetch(
        `https://fgsi.dpdns.org/api/downloader/youtube/v1?apikey=${FGSI_APIKEY}&url=${encodeURIComponent(u)}`
      ).then(r => r.json() as any);
      if (!res.status || !res.data) throw new Error('fgsi: sin datos');
      const dl = res.data.url;
      if (!dl) throw new Error('fgsi: sin URL video');
      return { dl, title: null };
    },
  };

  const saveTubeVideo: ApiDef = {
    custom: true,
    run: (u) => new SaveTube().download(u, false),
  };

  return isAudio
    ? [scraperAudio, anabotAudioByUrl, anabotAudioByQuery, diegoMp3V1, diegoMp3V2, nexevoMp3, saveTubeAudio]
    : [scraperVideo, anabotVideo, diegoMp4V1, diegoMp4V2, nexevoMp4, fgsiApiVideo, saveTubeVideo];
};

function raceApis(url: string, apis: ApiDef[], timeout = 60_000): Promise<{ dl: string; title?: string }> {
  return new Promise((resolve, reject) => {
    let settled    = false;
    let errorCount = 0;
    const total    = apis.length;

    const timer = setTimeout(() => {
      if (!settled) reject(new Error('Timeout'));
    }, timeout);

    const tryResolve = (result: { dl: string; title?: string }) => {
      if (!settled && result?.dl) {
        settled = true;
        clearTimeout(timer);
        resolve(result);
      }
    };

    const onError = () => {
      errorCount++;
      if (errorCount === total && !settled) {
        clearTimeout(timer);
        reject(new Error('Todas las APIs fallaron'));
      }
    };

    for (const api of apis) {
      (async () => {
        try {
          let result: { dl: string; title?: string } | undefined;
          if (api.custom) {
            result = await api.run!(url);
          } else {
            const res  = await fetch(api.url!(url));
            const json = await res.json();
            if (api.validate!(json)) result = api.parse!(json);
          }
          if (result?.dl) tryResolve(result);
          else onError();
        } catch {
          onError();
        }
      })();
    }
  });
}

async function fetchWithRetry(url: string, apis: ApiDef[]) {
  try {
    return await raceApis(url, apis);
  } catch {
    return await raceApis(url, apis);
  }
}

export default {
  command: ['play', 'mp3', 'playaudio', 'ytmp3', 'ytaudio', 'play2', 'mp4', 'playvideo', 'ytmp4', 'ytvideo'],
  category: 'downloader',

  run: async ({ sock, m, text, command }: any) => {
    const query = (typeof text === 'string' ? text : '').trim();
    if (!query) return m.reply('✎ Ingresa el nombre de la canción o una URL de YouTube.');

    const isAudio = ['play', 'mp3', 'playaudio', 'ytmp3', 'ytaudio'].includes(command);

    try {
      const esURL = isYTUrl(query);
      let url: string;
      let videoInfo: any;

      if (esURL) {
        const idMatch = query.match(/[a-zA-Z0-9_-]{11}/);
        videoInfo     = idMatch ? (await yts({ videoId: idMatch[0] })) : null;
        url           = query;
      } else {
        const search = await yts(query);
        videoInfo    = search.videos?.[0] || search.all?.[0];
        if (!videoInfo) return m.reply('✎ No se encontraron resultados.');
        url = videoInfo.url;
      }

      const title  = videoInfo?.title  || 'Descarga';
      const canal  = videoInfo?.author?.name || videoInfo?.author || 'Desconocido';
      const dur    = videoInfo?.timestamp || videoInfo?.duration?.toString() || 'Desconocido';
      const vistas = (videoInfo?.views || 0).toLocaleString();
      const ago    = videoInfo?.ago    || '';
      const thumb  = videoInfo?.image  || videoInfo?.thumbnail;

      let thumbBuffer: Buffer | null = null;
      if (thumb) {
        try {
          thumbBuffer = await getBuffer(thumb);
          thumbBuffer = await sharp(thumbBuffer).resize(320, 180).jpeg().toBuffer();
        } catch {}
      }

      const caption =
        `*𖹭.╭╭ִ╼ׅ࣪ﮩ٨ـﮩ𝗒𝗈𝗎𝗍𝗎𝗏𝖾-𝗉꯭𝗅꯭𝖺꯭𝗒ﮩ٨ـﮩׅ╾࣪╮╮.𖹭*\n` +
        `> ♡ *Título:* ${title || 'Desconocido'}\n` +
        `*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n` +
        `> ♡ Canal › ${canal}\n` +
        `*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n` +
        `> ♡ Duración › ${dur}\n` +
        `*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n` +
        `> ♡ Vistas › ${vistas}\n` +
        `*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n` +
        `> ♡ *Publicado:* ${ago || 'Desconocido'}\n` +
        `*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n` +
        `> ♡ Enlace › ${url}\n` +
        `*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*`;

      await sock.sendMessage(
        m.chat,
        thumbBuffer ? { image: thumbBuffer, caption } : { text: caption },
        { quoted: m }
      );
      const apis = buildApis(isAudio, query);
      const [{ dl, title: dlTitle }] = await Promise.all([
        fetchWithRetry(url, apis),
      ]);
      const finalTitle = dlTitle || title;

      if (isAudio) {
        const lyricsPromise = raceLyrics(`${finalTitle} ${canal}`);

        let audioBuffer = await getBuffer(dl);

        try {
          let coverBuffer: Buffer | null = null;

          if (thumb) {
            try {
              const imgRaw = await getBuffer(thumb);
              coverBuffer  = imgRaw;
              thumbBuffer  = await sharp(imgRaw).resize(320, 180).jpeg({ quality: 80 }).toBuffer();
            } catch {}
          }

          const lyrics = await lyricsPromise;

          const tags: any = {
            title:  finalTitle || title,
            artist: canal,
            album:  'YouTube',
            year:   new Date().getFullYear().toString(),
            comment: {
              language: 'spa',
              text:     `Descargado por Diamond Bot\nURL: ${url}`,
            },
            unsynchronisedLyrics: {
              language: 'spa',
              text: lyrics ?? `${finalTitle || title}\n\nPowered by Diamond (◣_◢)凸`,
            },
          };

          if (coverBuffer) {
            tags.image = {
              mime:        'image/jpeg',
              type:        { id: 3, name: 'front cover' },
              description: 'Portada',
              imageBuffer: coverBuffer,
            };
          }

          const tagged = NodeID3.update(tags, audioBuffer);
          if (tagged) audioBuffer = tagged;
        } catch {}

if (command === 'playaudio') {
  await sock.sendMessage(
    m.chat,
    {
      audio:    audioBuffer,
      mimetype: 'audio/mpeg',
      ptt:      false,
    },
    { quoted: m }
  );
} else {
  await sock.sendMessage(
    m.chat,
    {
      document:      audioBuffer,
      mimetype:      'audio/mpeg',
      fileName:      `${finalTitle || title}.mp3`,
      jpegThumbnail: thumbBuffer ?? undefined,
    },
    { quoted: m }
  );
}

      } else {
        let sizeMB = 0;
        try {
          const head = await fetch(dl, { method: 'HEAD' });
          sizeMB = parseInt(head.headers.get('content-length') || '0') / (1024 * 1024);
        } catch {}

        if (sizeMB > LIMIT_MB) {
          await sock.sendMessage(
            m.chat,
            { document: { url: dl }, fileName: `${finalTitle}.mp4`, mimetype: 'video/mp4' },
            { quoted: m }
          );
        } else {
          await sock.sendMessage(
            m.chat,
            {
              video:         { url: dl },
              fileName:      `${finalTitle}.mp4`,
              mimetype:      'video/mp4',
              jpegThumbnail: thumbBuffer ?? undefined,
            },
            { quoted: m }
          );
        }
      }

    } catch (error: any) {
      m.reply(`✘ No se pudo descargar. Intenta de nuevo más tarde.\n_${error.message}_`);
    }
  },
};