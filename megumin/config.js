import {watchFile, unwatchFile} from 'fs';
import chalk from 'chalk';
import {fileURLToPath} from 'url';
import fs from 'fs'; 
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';
import '../plugins/main-allfake.js';

//BETA: Si quiere evitar escribir el número que será bot en la consola, agregué desde aquí entonces:
//Sólo aplica para opción 2 (ser bot con código de texto de 8 digitos)
global.botnumber = '' //Ejemplo: +573138954963
global.confirmCode = ''

//• ↳𝑺𝑶𝑳𝑶 𝑫𝑬𝑺𝑨𝑹𝑹𝑶𝑳𝑳𝑨𝑫𝑶𝑹𝑬𝑺 𝑨𝑷𝑹𝑶𝑩𝑨𝑫𝑶𝑺
global.owner = [
  ['573138954963', '💥 𝗠𝗲𝗴𝘂𝗺𝗶𝗻-𝗕𝗼𝘁 (^_^♪)', true],
  ['5351524614', '🔥 𝗖𝗿𝗲𝗮𝗱𝗼𝗿 (◣_◢)凸', true],
  ['5493876432076'],
  ['573012482597'],
  ['593984964830'],
  ['5218711426787'],
  ['50492280729'],
  ['5218715746374']
];

//• ↳𝑺𝑶𝑳𝑶 𝑴𝑶𝑫𝑬𝑹𝑨𝑫𝑶𝑹𝑬𝑺!
global.mods = ['5351524614', '5218711426787', '', '', '']

global.suittag = ['5351524614']
global.prems = []

global.libreria = 'Baileys'
global.baileys = '^6.7.5'
global.vs = '^3.0.3'
global.languaje = 'Español'
global.nameqr = 'Megumin Bot - MD'
global.sessions = 'MeguminSession'
global.jadi = 'MeguminJadiBot'
global.meguminJadibts = true

//• ↳ ◜𝑴𝑨𝑹𝑪𝑨𝑺 𝑫𝑬 𝑨𝑮𝑼𝑨◞ • 💌
global.packsticker = `♾ ━━━━━━━━\n├ ɓσƭ:\n├ ρяοριєταяιο:\n├ ƒєϲнα ∂є ϲяєαϲιόи:\n├ нοяα:\n♾━━━━━━━━`
global.packname = `🔥⭑𝗠𝗲𝗴𝘂𝗺𝗶𝗻-𝗕𝗼𝘁⭑(^_^♪)`
global.author = `♾━━━━━━━━\n⇝͟͞ ۵̤͟𝚳̶̤𝚵̅𝔾̈͟𝖀𝐌̶̤𝚰̅𝚴̈͟♡̵̑ ͟͞   ᷨᜳ ͦ ̵ͭ⋆\n⇝ ۵-̱̅𝐃𝖆𝒗𝖏𝖉𐝃𐋃ᶜʱⁱᵃᶯ-͞ˍ\n⇝ ${moment.tz('America/Los_Angeles').format('DD/MM/YY')}\n⇝ ${moment.tz('America/Los_Angeles').format('HH:mm:ss')} \n♾━━━━━━━━\n\n\n\nѕτιϲκєя ϐγ: ৎ୭࠭͢𝑴𝒆̤𝒈𝒖̣֟፝֯𝒎̤𝒊̣𝒏🔥̤ʙⷪᴏ͓ᷫᴛⷭ𓆪͟͞ `;
global.wm = 'ৎ୭࠭͢𝑴𝒆̤𝒈𝒖̣֟፝֯𝒎̤𝒊̣𝒏🔥̤ʙⷪᴏ͓ᷫᴛⷭ𓆪͟͞ ';
global.titulowm = '͟͞ ৎ୭࠭͢💥͟𝑬̶𝒙͞𝒑͟𝒍𝒐̶𝒔̅𝒊͟𝒐́𝒏̶🔥̤𓆪 ͟͞';
global.titulowm2 = `͟͞ ৎ୭࠭͢💥͟𝑬̶𝒙͞𝒑͟𝒍𝒐̶𝒔̅𝒊͟𝒐́𝒏̶🔥̤𓆪 ͟͞`
global.igfg = 'ᥫᩣᎠ꯭I𝚫⃥꯭M꯭Ꭷ꯭Ꮑ꯭Ꭰ࠭⋆̟(◣_◢)凸'
global.botname = '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐'
global.dev = '© ⍴᥆ᥕᥱrᥱძ ᑲᥡ ძᥲ᥎іძ ᥴһіᥲᥒ ❀'
global.textbot = '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐ : ᥫᩣᎠ꯭I𝚫⃥꯭M꯭Ꭷ꯭Ꮑ꯭Ꭰ࠭⋆̟(◣_◢)凸'
global.gt = '͟͞ ৎ୭࠭͢💥͟𝑬̶𝒙͞𝒑͟𝒍𝒐̶𝒔̅𝒊͟𝒐́𝒏̶🔥̤𓆪 ͟͞';
global.namechannel = '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐/ᥫᩣᎠ꯭I𝚫⃥꯭M꯭Ꭷ꯭Ꮑ꯭Ꭰ࠭⋆̟(◣_◢)凸'


//• ↳ ◜𝑰𝑴𝑨́𝑮𝑬𝑵𝑬𝑺◞ • 🌇
global.imagen1 = 'https://files.catbox.moe/6lhjit.jpg'
global.imagen2 = 'https://files.catbox.moe/bm0q3s.jpg'
global.imagen3 = 'https://files.catbox.moe/zrbazr.jpg'
global.imagenadult = 'https://files.catbox.moe/3dbuvw.jpg'

global.miniurl = fs.readFileSync('./src/Grupo.jpg');
global.logo = 'https://files.catbox.moe/magmik.jpg'

//• ↳ ◜𝑭𝑨𝑲𝑬 𝑬𝑺𝑻𝑰𝑳𝑶◞ • 🪩
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐', orderTitle: 'Bang', thumbnailUrl: logo, sellerJid: '0@s.whatsapp.net'}}}

//• ↳ ◜𝑳𝑰𝑵𝑲𝑺◞ • 🌿
global.ofcgp = 'https://chat.whatsapp.com/F4QEFF2Hn4102NdbPJ2ZOi' //Grupo Oficial De Megumin
global.gp1 = 'https://chat.whatsapp.com/DSz2abnPgfE4IzZjynQLu3' //Grupo de Kotori Bot
global.gp2 = 'https://chat.whatsapp.com/J9gyFJLbhVIJXaUZlpo8Xt'//Grupo de enlaces
global.comunidad1 = 'https://chat.whatsapp.com/DWQb1xZClyR98ogvwI3qae' //Comunidad Megumin
global.channel = 'https://whatsapp.com/channel/0029VaqAtuIK0IBsHYXtvA3e' //Canal Oficial
global.channel2 = 'https://whatsapp.com/channel/0029Vb7Ji66KbYMTYLU9km3p' //Canal de Legends
global.yt = 'https://youtube.com/@davidchian4957' //Canal De Youtube
global.md = 'https://github.com/David-Chian/Megumin-Bot-MD' //Github Oficial
global.correo = 'noisebot@gmail.com'

var ase = new Date(); var hour = ase.getHours(); switch(hour){ case 0: hour = 'Linda Mañana'; break; case 1: hour = 'Linda Mañana'; break; case 2: hour = 'Linda Mañana'; break; case 3: hour = 'Linda Mañana'; break; case 4: hour = 'linda mañana'; break; case 5: hour = 'Linda Mañana'; break; case 6: hour = 'Linda Mañana'; break; case 7: hour = 'Linda Mañana'; break; case 8: hour = 'Linda Mañana'; break; case 9: hour = 'Linda Mañana'; break; case 10: hour = 'Lindo Dia'; break; case 11: hour = 'Lindo Dia'; break; case 12: hour = 'Lindo Dia'; break; case 13: hour = 'Lindo Dia'; break; case 14: hour = 'Linda Tarde'; break; case 15: hour = 'Linda Tarde'; break; case 16: hour = 'Linda Tarde'; break; case 17: hour = 'Linda Tarde'; break; case 18: hour = 'Linda Noche'; break; case 19: hour = 'Linda Noche'; break; case 20: hour = 'Linda Noche'; break; case 21: hour = 'Linda Noche'; break; case 22: hour = 'Linda Noche'; break; case 23: hour = 'Linda Noche'; break;}
global.saludo = '🍭' + hour;

global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: "120363358338732714@newsletter", serverMessageId: 100, newsletterName: namechannel, }, }, }
//• ↳ ◜𝑻𝑰𝑬𝑴𝑷𝑶◞ • 🕒
global.d = new Date(new Date + 3600000);
global.locale = 'es';
global.dia = d.toLocaleDateString(locale, {weekday: 'long'});
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'});
global.mes = d.toLocaleDateString('es', {month: 'long'});
global.año = d.toLocaleDateString('es', {year: 'numeric'});
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true});

/** ************************/
global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;
global.multiplier = 99
global.maxwarn = '3'
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'megumin/config.js\''));
  import(`${file}?update=${Date.now()}`);
});