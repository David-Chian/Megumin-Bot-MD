export default {
  command: ['removerpj'],
  category: 'owner',
  isOwner: true,
  run: async ({ sock, m, text, args }) => {
    try {
      let mentionedJid =
        (m.mentionedJid && m.mentionedJid[0]) ||
        (m.quoted ? m.quoted.sender : null) ||
        (args[0]?.match(/^\d+$/) ? args[0] + '@s.whatsapp.net' : null);

      let personajeNombre;
      if (args[0]?.startsWith('@') || args[0]?.match(/^\d+$/)) {
        personajeNombre = args.slice(1).join(' ').toLowerCase().trim();
      } else {
        personajeNombre = args.join(' ').toLowerCase().trim();
      }

      if (!personajeNombre)
        return m.reply('Uso correcto:\n/removerpj @usuario <nombre del personaje>\n/removerpj <número> <nombre del personaje>');

      if (!mentionedJid)
        return m.reply('❌ Menciona un usuario o indica su número.');

      const userData = getChatUser(m.chat, mentionedJid);
      if (!userData)
        return m.reply('❌ El usuario no tiene datos en este chat.');

      let characters = userData.characters;
      if (typeof characters === 'string') {
        try { characters = JSON.parse(characters) } catch { characters = [] }
      }
      if (!Array.isArray(characters)) characters = [];

      characters = characters.filter(c => c && c.name);

      const index = characters.findIndex(c => c.name.toLowerCase() === personajeNombre);
      if (index === -1)
        return m.reply(`❌ El usuario no tiene el personaje "${personajeNombre}".`);

      const personajeEliminado = characters[index];
      characters.splice(index, 1);

      updateChatUser(m.chat, mentionedJid, 'characters', characters);

      await sock.sendMessage(m.chat, {
        text: `✅ Personaje eliminado correctamente.\n\n👤 Usuario: @${mentionedJid.split('@')[0]}\n❌ Personaje: ${personajeEliminado.name}`,
        mentions: [mentionedJid]
      }, { quoted: m });

    } catch (e) {
      console.error('Error al eliminar personaje:', e);
      m.reply(`Error al eliminar personaje: ${e.message}`);
    }
  }
};