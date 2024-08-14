import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) throw `_𝐄𝐬𝐜𝐫𝐢𝐛𝐞 𝐮𝐧𝐚 𝐩𝐞𝐭𝐢𝐜𝐢𝐨́𝐧 𝐥𝐮𝐞𝐠𝐨 𝐝𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞𝐣𝐞𝐦𝐩𝐥𝐨:_ \n*${usedPrefix + command} Billie Eilish - Bellyache*`;
  
  const yt_play = await search(args.join(' '));

  if (!yt_play || yt_play.length === 0) {
    throw 'No se encontraron resultados para tu búsqueda.';
  }

  try {
    const formattedData = { 
      title: `╭ׅׄ̇─͓̗̗─ׅ̻ׄ╮۪̇߭⊹߭̇︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭̇⊹\n┟─⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪🅳🄴🅂🄲🄰🅁🄶🄰🅂໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪╮\n╭┄─🍂⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪🅼🄴🄶🅄🄼🄸🄽໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪╯\n│\n├ ⚘݄𖠵⃕⁖𖥔. _*🅃𝕚𝕥𝕦𝕝𝕠*_\n├» ${yt_play[0].title}\n├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┄\n├ ⚘݄𖠵⃕⁖𖥔. _*🄿𝕦𝕓𝕝𝕚𝕔𝕒𝕕𝕠*_\n├» ${yt_play[0].ago}\n├╌╌╌╌╌╌╌╌╌╌╌╌┈\n├ ⚘݄𖠵⃕⁖𖥔. _*🄳𝕦𝕣𝕒𝕔𝕚𝕠𝕟*_\n├» ${secondString(yt_play[0].duration.seconds)}\n├╌╌╌╌╌╌╌╌╌╌┄\n├ ⚘݄𖠵⃕⁖𖥔. _*🅅𝕚𝕤𝕥𝕒𝕤*_\n├» ${MilesNumber(yt_play[0].views)}\n├╌╌╌╌╌╌╌╌┈\n├ ⚘݄𖠵⃕⁖𖥔. _*🄰𝕦𝕥𝕠𝕣(𝕒)*_\n├» ${yt_play[0].author.name}\n├╌╌╌╌╌╌╌╌┈\n├ ⚘݄𖠵⃕⁖𖥔. _*🄴𝕟𝕝𝕒𝕔𝕖*_\n├» ${yt_play[0].url}\n╰ׁ̻۫─۪۬─۟─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪`,
      rows: [
        { title: 'Opción 2: Audio', id: `${usedPrefix}play.1 ${yt_play[0].url}` },
        { title: 'Opción 3: Audio DOC', id: `${usedPrefix}ytmp3doc ${yt_play[0].url}` },
        { title: 'Opción 2: Video', id: `${usedPrefix}play.2 ${yt_play[0].url}` },
        { title: 'Opción 3: Video DOC', id: `${usedPrefix}ytmp4doc ${yt_play[0].url}` }
      ]
    };

    await conn.sendButton(m.chat, [[formattedData.title, wm, yt_play[0].thumbnail, [
      ['𝐌 𝐄 𝐍 𝐔 💥', `${usedPrefix}menu`],
      ['💥 𝐀 𝐔 𝐃 𝐈 𝐎 (Opción 1)', `${usedPrefix}play5 ${yt_play[0].url}`],
      ['💥 𝐕 𝐈 𝐃 𝐄 𝐎 (Opción 1)', `${usedPrefix}play6 ${yt_play[0].url}`]
    ], null,
    [['⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐', cn]],
    [['Ver más opciones', formattedData.rows]]]], m);

  } catch (e) {
    await conn.reply(m.chat, `*[ ! ] Hubo un error en el comando, por favor intenta más tarde..* ${e}`, fkontak, m, rcanal);
    console.log(`❗❗ Error en ${usedPrefix + command} ❗❗`);
    console.log(e);
  }
};

handler.command = ['test'];
handler.register = true;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
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
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}