import axios from 'axios';
const handler = async (m, {command, conn, usedPrefix}) => {
const res = (await axios.get(`https://raw.githubusercontent.com/DevDiegoxyz/YaemoriBot-MD/master/src/JSON/anime-${command}.json`)).data;
const haha = await res[Math.floor(res.length * Math.random())];
const messages = [['Imagen 1', dev, await res[Math.floor(res.length * Math.random())],
[[]], [[]], [[]], [[]]], ['Imagen 2', dev, await res[Math.floor(res.length * Math.random())], [[]], [[]], [[]], [[]]], ['Imagen 2', dev, await res[Math.floor(res.length * Math.random())], [[]], [[]], [[]], [[]]], ['Imagen 4', dev, await res[Math.floor(res.length * Math.random())], [[]], [[]], [[]], [[]]]]
await conn.sendCarousel(m.chat, '🚩 Resultado de ' + command, '🔎 Anime - ' + command, null, messages, m);
};
handler.command = handler.help = ['akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chiho', 'chitoge', 'deidara', 'erza', 'elaina', 'eba', 'emilia', 'hestia', 'hinata', 'inori', 'isuzu', 'itachi', 'itori', 'kaga', 'kagura', 'kaori', 'keneki', 'kotori', 'kurumi', 'madara', 'mikasa', 'miku', 'minato', 'naruto', 'nezuko', 'sagiri', 'sasuke', 'sakura', 'cosplay'];
handler.tags = ['anime'];
handler.group = true;
handler.register = true
export default handler;
