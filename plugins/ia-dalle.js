import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
    if (!text) throw `*🧧 ingrese una petición para generar una imagen con dalle...*`;
    m.react('🕒')
    await conn.sendMessage(m.chat, {text: '*🧧 Espere un momento...*'}, {quoted: m});
    
    try {
        const response = await fetch(`https://api-xovvip.vercel.app/text2img?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const buffer = await response.buffer();
        m.react('☑️')
        await conn.sendMessage(m.chat, {image: buffer}, {quoted: m});
    } catch {
        throw `Error...`;
    }
}
handler.tags = ['ia']
handler.help = ['dalle']
handler.command = ['dalle'];
export default handler;