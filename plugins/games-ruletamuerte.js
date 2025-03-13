import { delay } from '@whiskeysockets/baileys';

const salasRuleta = {};

const handler = async (m, { conn }) => {
    const chatId = m.chat;
    const senderId = m.sender;

    if (salasRuleta[chatId]) 
        return conn.reply(m.chat, '⚠️ Ya hay una sala activa en este grupo. Espera a que termine.', m);

    salasRuleta[chatId] = { jugadores: [senderId], estado: 'esperando' };

    await conn.sendMessage(m.chat, { 
        text: `🎲 *Ruleta de la Muerte* 🎲\n\n@${senderId.split('@')[0]} quiere jugar. Responde con *acepto* para entrar.\n\n⏳ Tienes 60 segundos...`, 
        mentions: [senderId] 
    }, { quoted: m });

    await delay(60000);
    if (salasRuleta[chatId] && salasRuleta[chatId].estado === 'esperando') {
        delete salasRuleta[chatId];
        await conn.sendMessage(m.chat, { text: '⌛ Nadie aceptó el reto. La sala ha sido cerrada.' });
    }
};

handler.command = ['ruletamuerte'];
handler.botAdmin = true
export default handler;

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const senderId = m.sender;
    const texto = m.text?.toLowerCase();

    if (!salasRuleta[chatId]) return

    if (texto === 'acepto' || texto === 'aceptar') {
        if (salasRuleta[chatId].jugadores.length >= 2) 
            return conn.reply(m.chat, '⚠️ Ya hay dos jugadores en esta sala.', m);

        if (senderId === salasRuleta[chatId].jugadores[0])
            return conn.reply(m.chat, '⚠️ No puedes aceptar tu propio reto.', m);

        salasRuleta[chatId].jugadores.push(senderId);
        salasRuleta[chatId].estado = 'completa';

        await conn.sendMessage(m.chat, { 
            audio: { url: "https://qu.ax/iwAmy.mp3" }, 
            mimetype: "audio/mp4", 
            ptt: true 
        });

        await conn.sendMessage(m.chat, { 
            text: '🎲 *Ruleta de la Muerte* 🎲\n\n✅ ¡La sala está completa!\n\n⚠️ Seleccionando al perdedor...' 
        });

        const loadingMessages = [
            "《 █▒▒▒▒▒▒▒▒▒▒▒》10%\n- Calculando probabilidades...",
            "《 ████▒▒▒▒▒▒▒▒》30%\n- El destino está echado...",
            "《 ███████▒▒▒▒▒》50%\n- La suerte está decidida...",
            "《 ██████████▒▒》80%\n- ¡Pronto conoceremos al perdedor!",
            "《 ████████████》100%\n- ¡Resultado final!"
        ];

        let { key } = await conn.sendMessage(m.chat, { text: "🤍 ¡Calculando resultado!" }, { quoted: m });

        for (let msg of loadingMessages) {
            await delay(3000);
            await conn.sendMessage(m.chat, { text: msg, edit: key }, { quoted: m });
        }

        const [jugador1, jugador2] = salasRuleta[chatId].jugadores;
        const perdedor = Math.random() < 0.5 ? jugador1 : jugador2;

        await conn.sendMessage(m.chat, { 
            text: `💀 *Veredicto final*\n\n😭 @${perdedor.split('@')[0]} ha sido el perdedor. Tiene 60 segundos para sus últimas palabras...`, 
            mentions: [perdedor] 
        });

        await delay(60000);        
            await conn.groupParticipantsUpdate(m.chat, [perdedor], 'remove');
            await conn.sendMessage(m.chat, { 
                text: `☠️ @${perdedor.split('@')[0]} ha sido eliminado. Fin del juego.`, 
                mentions: [perdedor] 
            });        
        delete salasRuleta[chatId];
    }

    if (texto === 'rechazar' && senderId === salasRuleta[chatId].jugadores[0]) {
        delete salasRuleta[chatId];
        await conn.sendMessage(m.chat, { text: '❌ El juego ha sido cancelado por el retador.' });
    }
};