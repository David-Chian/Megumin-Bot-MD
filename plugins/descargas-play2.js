import fetch from 'node-fetch';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import fs from "fs";
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import {sticker} from "../lib/sticker.js";

let limit1 = 100;
let limit2 = 400;
let limit_a1 = 50;
let limit_a2 = 400;

const handler = async (m, { conn, command, args, text, usedPrefix }) => {

  if (!text) throw `*💥 Hace falta el título o enlace del video de YouTube.*\n\n*𔔢 𝗘𝗷𝗲𝗺𝗽𝗹𝗼: _${usedPrefix + command} Megumin*`;

  const yt_play = await search(args.join(' '));
  let additionalText = '';
  if (['play5', 'ytmp3doc', 'playdoc'].includes(command)) {
    additionalText = 'audio';
  } else if (['play6', 'ytmp4doc', 'playdoc2'].includes(command)) {
    additionalText = 'vídeo';
  }

  if (!yt_play || !yt_play[0]?.title) return m.reply('> *[❗] Error: Audio/Video not found.*')

  if (['play5', 'ytmp3doc', 'playdoc'].includes(command)) {
      try {
        let name = conn.getName(m.sender);
  let apislap = await fetch(`https://qu.ax/EnLlx.mp4`);
let url = apislap.url;
    let stiker = await sticker(null, url, `${name} está descargando...`, `Estoy haciendo lo mejor que puedo..!#€ Aahh!`);
  const stickerMessage = await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m, true, { contextInfo: { forwardingScore: 200, isForwarded: true } }, { quoted: m });
        const audio = `${global.MyApiRestBaseUrl}/api/v2/ytmp3?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
        const ttl = await yt_play[0].title;
        const buff_aud = await getBuffer(audio);
        const fileSizeInBytes = buff_aud.byteLength;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;
        const size = fileSizeInMB.toFixed(2);

        if (size >= limit_a2) {
          await conn.sendMessage(m.chat, { text: `*💥 Descargue su audio en:* _${audio}_` }, { quoted: m });
          await conn.sendMessage(m.chat, { delete: stickerMessage.key });
          return;
        }
        if (size >= limit_a1 && size <= limit_a2) {
          await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
          await conn.sendMessage(m.chat, { delete: stickerMessage.key });
          return;
        } else {
          if (['playdoc', 'ytmp3doc'].includes(command)) return await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
          await conn.sendMessage(m.chat, { audio: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
          return;
        }
      } catch {
        try {
          const ttl = await yt_play[0].title;
          const mediaa = await ytMp3(yt_play[0].url);
          const buff_aud = await getBuffer(mediaa);
          const fileSizeInBytes = buff_aud.byteLength;
          const fileSizeInKB = fileSizeInBytes / 1024;
          const fileSizeInMB = fileSizeInKB / 1024;
          const size = fileSizeInMB.toFixed(2);
         if (size >= limit_a2) {
           await conn.sendMessage(m.chat, { text: `*💥 Descargue su audio en:* _${mediaa}_` }, { quoted: m });
           await conn.sendMessage(m.chat, { delete: stickerMessage.key });
           return;
         }
         if (size >= limit_a1 && size <= limit_a2) {
           await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
           await conn.sendMessage(m.chat, { delete: stickerMessage.key });
           return;
         } else {
           if (['playdoc', 'ytmp3doc'].includes(command)) return await conn.sendMessage(m.chat, { document: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
           await conn.sendMessage(m.chat, { audio: buff_aud, mimetype: 'audio/mpeg', fileName: ttl + `.mp3` }, { quoted: m });
           return;
         }
      } catch(e) {  
      return conn.reply(m.chat, `*[ ℹ️ ] Ocurrió un error. Por favor, inténtalo de nuevo más tarde.*\nDetalles: ${e}`, m, rcanal);
      await conn.sendMessage(m.chat, { delete: stickerMessage.key });
      }
   }
  }

  if (['play6', 'ytmp4doc', 'playdoc2'].includes(command)) {
      try {
      let name = conn.getName(m.sender);
  let apislap = await fetch(`https://qu.ax/JrHBH.mp4`);
let url = apislap.url;
    let stiker = await sticker(null, url, `${name} está descargando...`, `Estoy haciendo lo mejor que puedo..!#€ Aahh!`);
  const stickerMessage = await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m, true, { contextInfo: { forwardingScore: 200, isForwarded: true } }, { quoted: m });
        const video = `${global.MyApiRestBaseUrl}/api/v2/ytmp4?url=${yt_play[0].url}&apikey=${global.MyApiRestApikey}`;
        const ttl2 = await yt_play[0].title;
        const buff_vid = await getBuffer(video);
        const fileSizeInBytes2 = buff_vid.byteLength;
        const fileSizeInKB2 = fileSizeInBytes2 / 1024;
        const fileSizeInMB2 = fileSizeInKB2 / 1024;
        const size2 = fileSizeInMB2.toFixed(2);

        if (size2 >= limit2) {
          await conn.sendMessage(m.chat, { text: `💥 *Descargue su vídeo en:* _${video}_` }, { quoted: m });
          await conn.sendMessage(m.chat, { delete: stickerMessage.key });
          return;
        }
        if (size2 >= limit1 && size2 <= limit2) {
          await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
          await conn.sendMessage(m.chat, { delete: stickerMessage.key });
          return;
        } else {
          if (['playdoc2', 'ytmp4doc'].includes(command)) return await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
          await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
          return;
        }
      } catch {
        try {
          const ttl = await yt_play[0].title;
          const mediaa = await ytMp4(yt_play[0].url);
          const buff_vid = await getBuffer(mediaa);
          const fileSizeInBytes = buff_vid.byteLength;
          const fileSizeInKB = fileSizeInBytes / 1024;
          const fileSizeInMB = fileSizeInKB / 1024;
          const size = fileSizeInMB.toFixed(2);
         if (size2 >= limit2) {
           await conn.sendMessage(m.chat, { text: `💥 *Descargue su vídeo en:* _${mediaa}_` }, { quoted: m });
           await conn.sendMessage(m.chat, { delete: stickerMessage.key });
           return;
         }
         if (size2 >= limit1 && size2 <= limit2) {
           await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
           await conn.sendMessage(m.chat, { delete: stickerMessage.key });
           return;
         } else {
           if (['playdoc2', 'ytmp4doc'].includes(command)) return await conn.sendMessage(m.chat, { document: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
           await conn.sendMessage(m.chat, { video: buff_vid, mimetype: 'video/mp4', fileName: ttl2 + `.mp4` }, { quoted: m });
           return;
         }
      } catch(e) {  
 return conn.reply(m.chat, `*[ ℹ️ ] Ocurrió un error. Por favor, inténtalo de nuevo más tarde.*\nDetalles: ${e}`, m, rcanal);
 await conn.sendMessage(m.chat, { delete: stickerMessage.key });
      }
   }
  }
};

handler.command = /^(play5|play6|ytmp3doc|ytmp4doc|playdoc|playdoc2)$/i;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
  return search.videos;
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? 'd ' : 'd ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? 'h ' : 'h ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? 'm ' : 'm ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? 's' : 's') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  return new Promise((resolve, reject) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`);
  });
}

const getBuffer = async (url, options) => {
    options ? options : {};
    const res = await axios({method: 'get', url, headers: {'DNT': 1, 'Upgrade-Insecure-Request': 1,}, ...options, responseType: 'arraybuffer'});
    return res.data;
};

async function ytMp3(url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url).then(async (getUrl) => {
      const result = [];
      for (let i = 0; i < getUrl.formats.length; i++) {
        const item = getUrl.formats[i];
        if (item.mimeType == 'audio/webm; codecs=\"opus\"') {
          const {contentLength} = item;
          const bytes = await bytesToSize(contentLength);
          result[i] = {audio: item.url, size: bytes};
        }
      }
      const resultFix = result.filter((x) => x.audio != undefined && x.size != undefined);
      const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
      const tinyUrl = tiny.data;
      const title = getUrl.videoDetails.title;
      const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({title, result: tinyUrl, result2: resultFix, thumb});
    }).catch(reject);
  });
}

async function ytMp4(url) {
  return new Promise(async (resolve, reject) => {
    ytdl.getInfo(url).then(async (getUrl) => {
      const result = [];
      for (let i = 0; i < getUrl.formats.length; i++) {
        const item = getUrl.formats[i];
        if (item.container == 'mp4' && item.hasVideo == true && item.hasAudio == true) {
          const {qualityLabel, contentLength} = item;
          const bytes = await bytesToSize(contentLength);
          result[i] = {video: item.url, quality: qualityLabel, size: bytes};
        }
      }
      const resultFix = result.filter((x) => x.video != undefined && x.size != undefined && x.quality != undefined);
      const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
      const tinyUrl = tiny.data;
      const title = getUrl.videoDetails.title;
      const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({title, result: tinyUrl, rersult2: resultFix[0].video, thumb});
    }).catch(reject);
  });
}

async function ytPlay(query) {
  return new Promise((resolve, reject) => {
    yts(query).then(async (getData) => {
      const result = getData.videos.slice( 0, 5 );
      const url = [];
      for (let i = 0; i < result.length; i++) {
        url.push(result[i].url);
      }
      const random = url[0];
      const getAudio = await ytMp3(random);
      resolve(getAudio);
    }).catch(reject);
  });
}

async function ytPlayVid(query) {
  return new Promise((resolve, reject) => {
    yts(query).then(async (getData) => {
      const result = getData.videos.slice( 0, 5 );
      const url = [];
      for (let i = 0; i < result.length; i++) {
        url.push(result[i].url);
      }
      const random = url[0];
      const getVideo = await ytMp4(random);
      resolve(getVideo);
    }).catch(reject);
  });
}