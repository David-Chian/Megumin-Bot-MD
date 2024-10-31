import yts from 'yt-search' 
const handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return conn.reply(m.chat, `🚩 *Ingrese el nombre de un video de YouTube*\n\nEjemplo, !${command} Distancia - Kimberly Contreraxx`,  m, rcanal);

try {
const randomReduction = Math.floor(Math.random() * 5) + 1;
let search = await yts(text);

let isVideo = /supervideo$/.test(command);
let urls = search.all[0].url;

let res = await dl_vid(urls)
let type = isVideo ? 'video' : 'audio';
let video = res.data.mp4;
let audio = res.data.mp3;
await conn.sendMessage(m.chat, { [type]: { url: isVideo ? video : audio }, gifPlayback: false, mimetype: isVideo ? "video/mp4" : "audio/mpeg" }, { quoted: fkontak });
await m.react(done)

} catch {
await conn.reply(m.chat, `✘ *Ocurrío un error*`, m, rcanal)
await m.react(error)
}}

handler.command = ['supermusic', 'supervideo'];
handler.group = true
export default handler;

async function dl_vid(url) {
const response = await fetch('https://shinoa.us.kg/api/download/ytdl', {
method: 'POST',
headers: {
'accept': '*/*',
'api_key': 'free',
'Content-Type': 'application/json'
},
body: JSON.stringify({
text: url,
})});

if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
return data;
}