import yts from 'yt-search' 
const handler = async (m, { conn, text, usedPrefix, command }) => {
try {
    if (!text) { return conn.reply(m.chat, `*💥 Hace falta el título o enlace del video de YouTube.*\n\n*𔔢 𝗘𝗷𝗲𝗺𝗽𝗹𝗼: _${usedPrefix + command} JAWNY - Honeypie Animation*`,m ,rcanal)
}
    const randomReduction = Math.floor(Math.random() * 5) + 1;
    let search = await yts(text);
    let isVideo = /play2$/.test(command);
    let urls = search.all[0].url;
    let body = `*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ♡̫𝗆𝖾𝗀֟፝𝗎꯭𝗆𝗂꯭𝗇♡ִ̫ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*\n> ♡ *Título:* ${search.all[0].title}\n> ♡ *Vistas:* ${search.all[0].views}\n> ♡ *Duración:* ${search.all[0].timestamp}\n> ♡ *Subido:* ${search.all[0].ago}\n> ♡ *Url:* ${urls}\n*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*\n🕒 *Su ${isVideo ? 'Video' : 'Audio'} se está enviando, espere un momento...*`;
    
let sentMessage = await conn.sendMessage(m.chat, { 
        image: { url: search.all[0].thumbnail }, 
        caption: body,
        contextInfo: { externalAdReply: { title: '♡  ͜ ۬︵࣪᷼⏜݊᷼𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨⏜࣪᷼︵۬ ͜ ', body: '<(✿◠‿◠)> 𝙈𝙚𝙜𝙪𝙢𝙞𝙣🔥', sourceUrl: cn, thumbnail: logo7 }}, quoted: estilo, rcanal});
    m.react('💥')

    let res = await dl_vid(urls)
    let type = isVideo ? 'video' : 'audio';
    let video = res.data.mp4;
    let audio = res.data.mp3;
    conn.sendMessage(m.chat, { 
        [type]: { url: isVideo ? video : audio }, 
        gifPlayback: false, 
        mimetype: isVideo ? "video/mp4" : "audio/mpeg" 
    }, { quoted: m });
  // await conn.sendMessage(m.chat, { delete: sentMessage.key });
    } catch(error) {
    conn.reply(m.chat, `Hubo un error en la descarga.\nDetalles: ${error}.`, m, rcanal)
    return
        }
}

handler.command = ['play', 'play2'];
handler.help = ['play', 'play2'];
handler.tags = ['descargas'];
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
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}
