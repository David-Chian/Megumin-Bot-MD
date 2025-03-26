// Porque cojones perdí tiempo yo haciendo esta mierda en serio no tenía nada mejor que hacer.... Nesesito una novia enseguida....

import { delay } from '@whiskeysockets/baileys';

const pensandoUsuarios = {};

const handler = async (m, { conn }) => {
    const senderId = m.sender;

    if (pensandoUsuarios[senderId]) 
        return conn.reply(m.chat, '⚠️ Ya estás en una sesión de pensamiento. Envía un número del 1 al 100.', m);

    pensandoUsuarios[senderId] = true;

    await conn.sendMessage(m.chat, { 
        text: `🧠 *Piensa en un número* 🧠\n\n@${senderId.split('@')[0]}, piensa en un número del *1 al 100* y envíamelo en un mensaje.`,
        mentions: [senderId]
    }, { quoted: m });

    await delay(30000);
    if (pensandoUsuarios[senderId]) {
        delete pensandoUsuarios[senderId];
        await conn.sendMessage(m.chat, { text: '⌛ Se acabó el tiempo. Inténtalo de nuevo con *pensar*.' });
    }
};

handler.command = ['pensar'];
export default handler;

handler.before = async (m, { conn }) => {
    const senderId = m.sender;
    const texto = m.text?.trim();

    if (!pensandoUsuarios[senderId]) return;

    if (!/^\d+$/.test(texto) || texto < 1 || texto > 100) 
        return conn.reply(m.chat, '⚠️ Debes enviar un número válido del 1 al 100.', m);

    delete pensandoUsuarios[senderId];

    const loadingMessages = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%\n- Analizando tu pensamiento...",
        "《 ████▒▒▒▒▒▒▒▒》30%\n- Leyendo tu mente...",
        "《 ███████▒▒▒▒▒》50%\n- Interpretando señales cerebrales...",
        "《 ██████████▒▒》80%\n- Conectando con el universo...",
        "《 ████████████》100%\n- ¡He descubierto tu número!"
    ];

    let { key } = await conn.sendMessage(m.chat, { text: "🔮 Conectando con tu mente..." }, { quoted: m });
        await conn.sendMessage(m.chat, { 
            audio: { url: "https://qu.ax/nLbte.mp3" }, 
            mimetype: "audio/mp4", 
            ptt: true 
        });
    for (let msg of loadingMessages) {
        await delay(2000);
        await conn.sendMessage(m.chat, { text: msg, edit: key }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { 
        text: `🔢 *Has pensado en el número:* *${texto}* 🎉`
    });
};