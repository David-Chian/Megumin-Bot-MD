export default {
  command: ['removerpj'],
  category: 'owner',
  isOwner: true,
  run: async ({client, m, text, args}) => {
    try {
        let mentionedJid = 
            (m.mentionedJid && m.mentionedJid[0]) ||
            (m.quoted ? m.quoted.sender : null) ||
            (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null);

    /*    if (!mentionedJid) {
            conn.reply(m.chat, 'Uso correcto:\n/removerpj @usuario <nombre del personaje>\n/removerpj <número> <nombre del personaje>', m);
            return;
        }*/

        let personajeNombre;
        if (args[0]?.startsWith('@') || args[0]?.match(/^\d+$/)) {
            personajeNombre = args.slice(1).join(' ').toLowerCase().trim();
        } else {
            personajeNombre = args.join(' ').toLowerCase().trim();
        }

        if (!personajeNombre) {
            client.reply(m.chat, 'Uso correcto:\n/removerpj @usuario <nombre del personaje>\n/removerpj <número> <nombre del personaje>', m);
            return;
        }

        if (!global.db) global.db = {};
        if (!global.db.data) global.db.data = { chats: {}, settings: {} };
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { users: {}, personajesReservados: [] };
        if (!global.db.data.chats[m.chat].users[mentionedJid]) {
            client.reply(m.chat, '❌ El usuario no tiene datos en este chat.', m);
            return;
        }

        let userData = global.db.data.chats[m.chat].users[mentionedJid];

        if (Array.isArray(userData.characters)) {
            userData.characters = userData.characters.filter(c => c && c.name);
        } else {
            userData.characters = [];
        }

        let index = userData.characters.findIndex(c => c.name.toLowerCase() === personajeNombre);

        if (index === -1) {
            client.reply(m.chat, `❌ El usuario no tiene el personaje "${personajeNombre}".`, m);
            return;
        }

        let personajeEliminado = userData.characters[index];

        userData.characters.splice(index, 1);

        userData.characterCount = userData.characters.length;
        userData.totalRwcoins = userData.characters.reduce((acc, c) => acc + (Number(c.value) || 0), 0);

        await client.reply(
            m.chat,
            `✅ Personaje eliminado correctamente.\n\n👤 Usuario: @${mentionedJid.split('@')[0]}\n❌ Personaje: ${personajeEliminado.name}`,
            m,
            { mentions: [mentionedJid] }
        );

    } catch (e) {
        console.error('Error al eliminar personaje:', e);
        m.reply(`Error al eliminar personaje: ${e.message}`);
    }
}}