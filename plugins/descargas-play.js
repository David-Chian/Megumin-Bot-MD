import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💣 Ingresa el nombre de la música a descargar.`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo;
    const vistas = formatViews(views);
    const infoMessage = `*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ♡̫𝗆𝖾𝗀֟፝𝗎꯭𝗆𝗂꯭𝗇♡ִ̫ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*\n> ♡ *Título:* ${title}\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ♡ *Duración:* ${timestamp}\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ♡ *Vistas:* ${vistas}\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ♡ *Canal:* ${videoInfo.author.name || 'Desconocido'}\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ♡ *Publicado:* ${ago}\n*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*\n> ♡ *Enlace:* ${url}\n*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*`;
    const thumb = (await conn.getFile(thumbnail))?.data;

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: packname,
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

    let downloadUrl;
    let success = false;

    const sources = [
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
      `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
      `${apis}/download/ytmp4?url=${encodeURIComponent(url)}`,
      `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
    ];

    for (let i = 0; i < sources.length; i++) {
      try {
        const res = await fetch(sources[i]);
        const { data } = await res.json();
        downloadUrl = data?.download?.url || data?.dl || data?.url;
        if (downloadUrl) {
          success = true;
          break;
        }
      } catch (e) {
        console.error(`Error con la fuente ${i + 1}:`, e.message);
      }
    }

    if (!success) {
      throw new Error('No se pudo encontrar un enlace de descarga válido.');
    }

    try {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        fileName: `${title}.mp4`,
        mimetype: "video/mp4",
        caption: `${title}`,
        thumbnail: thumb
      }, { quoted: m });
    } catch (e) {
      console.error('Error al enviar video:', e.message);
      try {
        await conn.sendMessage(m.chat, {
          document: { url: downloadUrl },
          fileName: `${title}.mp4`,
          mimetype: "video/mp4",
          caption: `${title}`
        }, { quoted: m });
      } catch (finalError) {
        return m.reply(`🪛 *Error final:* ${finalError.message}`);
      }
    }
  } catch (error) {
    return m.reply(`🪛 *Error:* ${error.message}`);
  }
};

handler.command = handler.help = ['play', 'ytmp4', 'play2'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k (' + views.toLocaleString() + ')';
  } else {
    return views.toString();
  }
}