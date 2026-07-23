import axios from 'axios';
import sharp from 'sharp';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toBuffer = async (url) => Buffer.from((await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data);
const key = api.key

const toWebp = async (buffer, isAnimated = false) => {
  if (isAnimated) {
    return await sharp(buffer, { animated: true }).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 50, loop: 0 }).toBuffer();
  }
  let webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 50 }).toBuffer();
  if (webp.length > 100 * 1024) {
    webp = await sharp(buffer).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 40 }).toBuffer();
  }
  return webp;
};

const isStickerUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?sticker\.ly\/s\/[a-zA-Z0-9]+$/i.test(url);
};

const searchPacks = async (query, attempt = 1) => {
  try {
    const { data } = await axios.get(`${api.url}/stickerly/search`, { params: { query, key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return searchPacks(query, attempt + 1); }
    throw e;
  }
};

const downloadPack = async (url, attempt = 1) => {
  try {
    const { data } = await axios.get(`${api.url}/stickerly/detail`, { params: { url, key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return downloadPack(url, attempt + 1); }
    if (e.response?.status === 500) return { status: false, error: 500 };
    throw e;
  }
};

const filterRelevantPacks = (packs, query) => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return packs;
  return packs.filter(pack => {
    const packName = (pack.name || '').toLowerCase();
    return packName.includes(searchTerm);
  });
};

export default {
  command: ['stickerpack', 'spack'],
  category: 'stickers',
    run: async ({sock, m, args, command, text, prefix}) => {
    try {
      if (!text) return sock.reply(m.chat, `《✧》 Ingresa un texto para buscar packs de stickers o una URL de sticker.ly.`, m);
      const name = await getUser(m.sender).name || m.sender.split('@')[0];
      let packData;
      const stickerMatch = text.match(/(?:sticker\.ly\/s\/)([a-zA-Z0-9]+)(?:\s|$)/);
      const url = stickerMatch ? 'https://sticker.ly/s/' + stickerMatch[1] : (isStickerUrl(text) ? text : null);
      if (url) {
        let detail = await downloadPack(url);
        if (!detail || !detail.status || detail.error === 500) {
          return sock.reply(m.chat, `《✧》 El pack de la URL no está disponible o es privado.`, m);
        }
        if (!detail.detalles) return sock.reply(m.chat, `《✧》 No se pudo obtener el pack desde la URL.`, m);
        packData = detail.detalles;
      } else {
        const search = await searchPacks(text);
        if (!search.status || !search.resultados?.length) return sock.reply(m.chat, `《✧》 No se encontraron packs para *${text}*.`, m);
        const relevantPacks = filterRelevantPacks(search.resultados, text);
        let packsToTry = relevantPacks.length > 0 ? relevantPacks : search.resultados;
        let selectedPack = null;
        let detail = null;
        let intentos = 0;
        const maxIntentos = Math.min(packsToTry.length, 5);
        const indices = [...Array(packsToTry.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        while (intentos < maxIntentos && !detail) {
          const index = indices[intentos];
          selectedPack = packsToTry[index];
          const res = await downloadPack(selectedPack.url);
          if (res?.status && res?.detalles?.stickers?.length > 0) {
            detail = res.detalles;
            break;
          }
          intentos++;
        }
        if (!detail) {
          return sock.reply(m.chat, `《✧》 No se pudo descargar ningún pack válido.`, m);
        }
        packData = detail;
      }      
      const { name: packName, author, stickers, thumbnailUrl } = packData;      
      if (!stickers?.length) {
        return sock.reply(m.chat, `《✧》 El pack no contiene stickers válidos.`, m);
      }
      const MAX_STICKERS = 30;
      const selectedStickers = stickers.slice(0, MAX_STICKERS);
      const [cover, stickerResults] = await Promise.all([(async () => {
          try {
            return await sharp(await toBuffer(thumbnailUrl)).resize(96, 96, { fit: 'cover' }).webp({ quality: 60 }).toBuffer();
          } catch {
            return await sharp({ create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }}).webp().toBuffer();
          }
        })(),
        Promise.all(selectedStickers.map(async (s) => {
          try {
            const buffer = await toBuffer(s.imageUrl);
            const sticker = await toWebp(buffer, s.isAnimated || false);
            return { sticker, isAnimated: s.isAnimated || false, isLottie: false, emojis: ['🎭'] };
          } catch {
            return null;
          }
        })).then(results => results.filter(r => r !== null))]);      
      if (!stickerResults.length) return sock.reply(m.chat, `《✧》 No se pudieron procesar los stickers del pack.`, m);
      await sock.sendMessage(m.chat, { stickerPack: { name: packName, publisher: author?.name || author?.username || `@${name}`, description: '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐', cover, stickers: stickerResults }}, { quoted: m });      
    } catch (e) {
      return m.reply(msgglobal);
    }
  }
};
