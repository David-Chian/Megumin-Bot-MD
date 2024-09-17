/*import axios from 'axios';
const handler = async (m, {command, conn, usedPrefix}) => {
const res = (await axios.get(`https://raw.githubusercontent.com/WOTCHITA/YaemoriBot-MD/master/src/JSON/anime-${command}.json`)).data;
const haha = await res[Math.floor(res.length * Math.random())];
conn.sendFile(m.chat, haha, 'error.jpg', `🍟 *${command}*`, m, null, rcanal);
};
handler.command = handler.help = ['akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chiho', 'chitoge', 'deidara', 'erza', 'elaina', 'eba', 'emilia', 'hestia', 'hinata', 'inori', 'isuzu', 'itachi', 'itori', 'kaga', 'kagura', 'kaori', 'keneki', 'kotori', 'kurumi', 'madara', 'mikasa', 'miku', 'minato', 'naruto', 'nezuko', 'sagiri', 'sasuke', 'sakura', 'cosplay'];
handler.tags = ['anime'];
handler.group = true;
handler.register = true
export default handler;*/

import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
await m.react('🕓')
try {
let res = await fetch('https://api.waifu.pics/sfw/megumin')
if (!res.ok) return
let json = await res.json()
if (!json.url) return
const messages = [['Imagen 1', dev, await res.json(),
[[]], [[]], [[]], [[]]], ['Imagen 2', dev, await res.json(), [[]], [[]], [[]], [[]]], ['Imagen 2', dev, await res.json(), [[]], [[]], [[]], [[]]], ['Imagen 4', dev, await res.json(), [[]], [[]], [[]], [[]]]]
await conn.sendCarousel(m.chat, wm, '🌸 Anime - Megumin', null, messages, m);
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['megumin']
handler.tags = ['img']
handler.command = ['megumin']
//handler.limit = 1
handler.register = true 

export default handler