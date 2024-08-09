import translate from '@vitalets/google-translate-api';
import axios from 'axios';
import fetch from 'node-fetch';

const handler = async (m, {conn, text, command, args, usedPrefix}) => {

if (!text) conn.reply(m.chat, '🍟 Te faltó el texto para hablar con *Megumin-Bot*', m, rcanal);
try {
// await m.react(emojis)
const resSimi = await simitalk(text);
conn.sendMessage(m.chat, { text: resSimi.resultado.simsimi }, { quoted: m });
} catch {
throw '🚩 *Ocurrió un error*';
}};

handler.help = ['simi', 'bot'];
handler.tags = ['fun'];
handler.group = true;
handler.register = true
handler.command = ['simi','bot','alexa','Megu','Megumin','ai']
export default handler;

async function simitalk(ask, apikeyyy = "iJ6FxuA9vxlvz5cKQCt3", language = "es") {
if (!ask) return { status: false, resultado: { msg: "Debes ingresar un texto para hablar con simsimi." }};
try {
const response1 = await axios.get(`https://deliriusapi-official.vercel.app/tools/simi?text=${encodeURIComponent(ask)}`);
const trad1 = await translate(`${response1.data.data.message}`, {to: language, autoCorrect: true});
if (trad1.text == 'indefinida' || response1 == '' || !response1.data) trad1 = XD // Se usa "XD" para causar error y usar otra opción.  
return { status: true, resultado: { simsimi: trad1.text }};        
} catch {
try {
const response2 = await axios.get(`https://anbusec.xyz/api/v1/simitalk?apikey=${apikeyyy}&ask=${ask}&lc=${language}`);
return { status: true, resultado: { simsimi: response2.data.message }};       
} catch (error2) {
return { status: false, resultado: { msg: "Todas las API's fallarón. Inténtalo de nuevo más tarde.", error: error2.message }};
}}}