import fetch from "node-fetch";
import yts from "yt-search";

const videoCache = {};
const cacheTimeout = 10 * 60 * 1000;
const formatAudio = "audio";
const formatVideo = "video";
const MAX_FILE_SIZE_MB = 100;

const shortenURL = async (url) => {
  try {
  let user = global.db.data.chats[m.chat].users[m.sender]
    let response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    let shortUrl = await response.text();
    return shortUrl.includes("http") ? shortUrl : url;
  } catch {
    return url;
  }
};

const fetchAPI = async (url, type) => {
  try {
    const endpoints = {
      audio: `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${url}`,
      video: `https://dark-core-api.vercel.app/api/download/ytmp4/v2?key=api&url=${url}`,
    };
    let response = await fetch(endpoints[type]);
    let data = await response.json();
    if (data?.download) return data;

    throw new Error("API principal no respondió correctamente.");
  } catch (error) {
    console.log("Error en API principal:", error.message);
    try {
      const fallbackEndpoints = {
        audio: `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`,
        video: `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=720p&apikey=GataDios`,
      };
      let response = await fetch(fallbackEndpoints[type]);
      let data = await response.json();
      if (data?.data?.url) {
        return {
          download: data.data.url,
          title: data.data.title,
          filesize: data.data.filesize,
          duration: data.data.duration,
          channel: data.data.channel,
        };
      }
      throw new Error("API de respaldo no respondió correctamente.");
    } catch (error) {
      console.log("Error en API de respaldo:", error.message);
      return null;
    }
  }
};

const handler = async (m, { conn, text }) => {
  if (!text.trim()) return conn.reply(m.chat, "💣 Ingresa el nombre de la música a buscar.", m);

  const search = await yts(text);
  if (!search.all.length) return conn.reply(m.chat, "❌ No se encontraron resultados.", m);

  let message = "🎵 *Resultados de búsqueda:*\n\n";
  videoCache[m.sender] = {
    results: search.all.slice(0, 10),
    timestamp: Date.now(),
  };

  message += "\n_*Responde con \"A [número]\" para audio o \"V [número]\" para video.*_\n\n";

  search.all.slice(0, 10).forEach((video, index) => {
    message += `*${index + 1}.* ${video.title}\n🔗 ${video.url}\n\n`;
  });

  conn.reply(m.chat, message, m);
};

handler.command = ["yts","ytsearch"];
handler.tags = ["downloader"];
handler.help = ["yts <texto>"];
export default handler;

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.text.includes("🎵 *Resultados de búsqueda:*")) return;

  const match = m.text.trim().match(/^([AV])\s*(\d+)$/i);
  if (!match) return;

  const [, type, number] = match;
  const index = parseInt(number) - 1;

  if (!videoCache[m.sender] || !videoCache[m.sender].results[index] || Date.now() - videoCache[m.sender].timestamp > cacheTimeout) {
    delete videoCache[m.sender];
    return conn.reply(m.chat, "❌ La lista de búsqueda ha expirado. Usa /yts nuevamente.", m);
  }

  const { url, title } = videoCache[m.sender].results[index];

  try {
    let mediaType = type.toUpperCase() === "A" ? formatAudio : formatVideo;
    let responseMessage = mediaType === "audio" ? "🎶 Descargando audio, espera un momento..." : "📽 Descargando video, espera un momento...";

    await conn.reply(m.chat, responseMessage, m);

    let apiData = await fetchAPI(url, mediaType);

    if (!apiData || !apiData.download) {
      return conn.reply(m.chat, "⚠️ Error al obtener el enlace de descarga.", m);
    }

    let downloadUrl = await shortenURL(apiData.download);
    let fileSizeMB = apiData.filesize ? parseFloat(apiData.filesize) / (1024 * 1024) : null;
    let fileName = `${apiData.title || "archivo"}.${mediaType === "audio" ? "mp3" : "mp4"}`;
    let asDocument = fileSizeMB && fileSizeMB > MAX_FILE_SIZE_MB;

    if (asDocument) {
      await conn.reply(m.chat, "⚠️ El archivo es demasiado grande, se enviará como documento.", m);
    }

    let messageOptions = asDocument
      ? { document: { url: downloadUrl }, fileName, mimetype: mediaType === "audio" ? "audio/mpeg" : "video/mp4" }
      : mediaType === "audio"
        ? { audio: { url: downloadUrl }, mimetype: "audio/mpeg", fileName, caption: "🎵 ¡Aquí tienes tu audio!" }
        : { video: { url: downloadUrl }, caption: `🎬 *${apiData.title || "Desconocido"}*\n🔗 [Descargar](${downloadUrl})` };

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });
  } catch (error) {
    conn.reply(m.chat, `⚠︎ Error: ${error.message}`, m);
  }
};