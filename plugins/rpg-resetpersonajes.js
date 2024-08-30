import fs from 'fs';
const obtenerDatos = () => {
    if (fs.existsSync('data.json')) {
        return JSON.parse(fs.readFileSync('data.json', 'utf-8'))
    } else {
        return { usuarios: {}, personajesReservados: [] }
    }
};
const guardarDatos = (data) => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2))
};
const tagUser = (id) => '@' + id.split('@')[0]

let handler = async (m, { conn }) => {
    let data = obtenerDatos()  
    let mentionedJid = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted && m.quoted.sender 
            ? m.quoted.sender 
            : null
    if (!mentionedJid) {
        conn.reply(m.chat, '𝑷𝒐𝒓 𝒇𝒂𝒗𝒐𝒓, 𝒎𝒆𝒏𝒄𝒊𝒐𝒏𝒂 𝒂 𝒖𝒏 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 𝒐 𝒓𝒆𝒔𝒑𝒐𝒏𝒅𝒆 𝒂 𝒖𝒏 𝒎𝒆𝒏𝒔𝒂𝒋𝒆 𝒅𝒆𝒍 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 𝒄𝒖𝒚𝒐 𝒑𝒆𝒓𝒇𝒊𝒍 𝒅𝒆𝒔𝒆𝒂𝒔 𝒆𝒍𝒊𝒎𝒊𝒏𝒂𝒓.', m, rcanal)
        return
    }

    if (!data.usuarios[mentionedJid]) {
        conn.reply(m.chat, `𝑬𝒍 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 ${tagUser(mentionedJid)} 𝒏𝒐 𝒕𝒊𝒆𝒏𝒆 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆𝒔 😹🫵.`, m, rcanal)
        return
        }

    data.usuarios[mentionedJid].characters = [];
    data.usuarios[mentionedJid].characterCount = 0;
    data.usuarios[mentionedJid].totalRwcoins = 0;
    guardarDatos(data)

    conn.reply(m.chat, `𝑬𝒍 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 ${tagUser(mentionedJid)} 𝒉𝒂 𝒔𝒊𝒅𝒐 𝒓𝒆𝒔𝒆𝒕𝒆𝒂𝒅𝒐. 𝑻𝒐𝒅𝒐𝒔 𝒔𝒖𝒔 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆𝒔 𝒚 𝒎𝒐𝒏𝒆𝒅𝒂𝒔 𝒉𝒂𝒏 𝒔𝒊𝒅𝒐 𝒆𝒍𝒊𝒎𝒊𝒏𝒂𝒅𝒐𝒔.`, m, rcanal)};

handler.help = ['resetpersonajes']
handler.tags = ['owner']
handler.command = ['resetpersonajes','resetp','eliminarpersonajes','eliminarp']
handler.register = true
handler.group = true
handler.rowner = true
export default handler