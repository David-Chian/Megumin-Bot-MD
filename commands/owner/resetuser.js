export default {
    command: ['restablecerdatos', 'deletedatauser', 'resetuser', 'borrardatos'],
    category: 'owner',
    isOwner: true,
    run: async ({ client, m, text }) => {
        try {
            let user = '';

            if (m.mentionedJid && m.mentionedJid[0]) {
                user = m.mentionedJid[0];
            } else if (text) {
                const number = text.replace(/[^0-9]/g, '');
                if (number.length > 5) user = number + '@s.whatsapp.net';
            } else if (m.quoted) {
                user = m.quoted.sender;
            }

            if (!user) {
                return m.reply(`🚩 *Por favor, menciona a un usuario, responde a su mensaje o escribe su número.*`);
            }

            const userNumber = user.split('@')[0];

            global.db.data = global.db.data || {};
            global.db.data.users = global.db.data.users || {};
            global.db.data.chats = global.db.data.chats || {};

            const chatData = global.db.data.chats[m.chat] || {};

            let datosEliminados = false;

            if (global.db.data.users[user]) {
                delete global.db.data.users[user];
                datosEliminados = true;
            }

            if (chatData.users && chatData.users[user]) {
                delete chatData.users[user];
                datosEliminados = true;
            }

            if (!datosEliminados) {
                return client.sendMessage(m.chat, { 
                    text: `🚩 *El usuario @${userNumber} no tiene datos registrados en mi base de datos.*`, 
                    mentions: [user] 
                }, { quoted: m });
            }

            await client.sendMessage(m.chat, { 
                text: `✅ *Éxito:* Se han borrado todos los registros de @${userNumber} (Inventario, experiencia y personajes).`, 
                mentions: [user] 
            }, { quoted: m });

        } catch (e) {
            console.error('Error al restablecer datos del usuario:', e);
            m.reply(`❌ Ocurrió un error: ${e.message}`);
        }
    }
};