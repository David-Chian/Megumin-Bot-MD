import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];

  if (user.chocolates < 2) {
    return conn.reply(m.chat, `ꕥ No tienes suficientes *Chocolates 🍫* Necesitas 2 más para usar este comando.`, m);
  }

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `✧ Ingresa el nombre de la música a descargar.`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    if (!videoInfo) {
      return m.reply('No se pudo obtener información del video.');
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    if (!title || !thumbnail || !timestamp || !views || !ago || !url || !author) {
      return m.reply('Información incompleta del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name ? author.name : 'Desconocido';
        const infoMessage = `
*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ♡̫𝗆𝖾𝗀֟፝𝗎꯭𝗆𝗂꯭𝗇𖦹ׅ♡ִ̫ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*
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

    const thumb = (await conn.getFile(thumbnail))?.data;

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

 if (command === 'play' || command === 'mp3'  || command === 'playaudio') {
  try {
    const apiAudioUrl = `${global.APIs.Stellar}/dow/ytmp3?url=${url}`;
    const response = await fetch(apiAudioUrl);
    const json = await response.json()
    const { title, dl } = json.data

    if (!dl) throw new Error('El enlace de audio no se generó correctamente.');

    await conn.sendMessage(m.chat, { audio: { url: dl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
  } catch (e) {
    console.error('Error al enviar el audio:', e.message);
    return conn.reply(m.chat, '⚠︎ No se pudo enviar el audio. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente mas tarde.', m);
  }
} else if (command === 'play2' || command === 'mp4' || command === 'playvideo') {
  try {
    const apiVideoUrl = `${global.APIs.Stellar}/dow/ytmp4?url=${url}`;
    const response = await fetch(apiVideoUrl);
    const json = await response.json()
    const { title, dl } = json.data

    if (!dl) throw new Error('El enlace de audio no se generó correctamente.');

    await conn.sendMessage(m.chat, { video: { url: dl }, fileName: `${title}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
  } catch {
  try {
    const response = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`);
    const json = await response.json();
    const resultad = json.result;
    const resultado = resultad.download.url

    if (!resultad || !resultado) throw new Error('El enlace de video no se generó correctamente.');

    await conn.sendMessage(m.chat, { video: { url: resultado }, fileName: resultad.title, mimetype: 'video/mp4', caption: dev }, { quoted: m });
  } catch (e) {
    console.error('Error al enviar el video:', e.message);
    return conn.reply(m.chat, '⚠︎ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente mas tarde.', m);
  }}
} else {
  return conn.reply(m.chat, '⚠︎ Comando no reconocido.', m);
}

    user.chocolates -= 2;
    conn.reply(m.chat, `ꕥ Has utilizado 2 *Chocolates 🍫*`, m);

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error}`);
  }
};

handler.command = handler.help = ['play', 'mp3', 'playaudio', 'play2', 'mp4', 'playvideo'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views === undefined) {
    return "No disponible";
  }

  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`;
  } else if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`;
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`;
  }
  return views.toString();
}