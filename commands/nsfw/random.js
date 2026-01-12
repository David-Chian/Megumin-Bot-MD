import axios from 'axios';

const comandos = [
  'nsfwloli', 'nsfwfoot', 'yuri', 'panties', 'tetas',
  'ecchi', 'hentai', 'imagenlesbians', 'pene'
];

export default {
  command: comandos,
  category: 'nsfw',
  group: true,

  run: async ({ client, m, command }) => {
    try {
      if (m.isGroup && !db.data.chats[m.chat]?.nsfw) {
        return m.reply('🚩 *¡Estos comandos están desactivados!*');
      }

      let imageUrl;

      if (command === 'hentai') {
        const { data } = await axios.get(
          'https://api.stellarwa.xyz/nsfw/random/hentai'
        );

        if (!data?.status || !data?.data?.url) {
          return m.reply('❌ No se pudo obtener la imagen.');
        }

        imageUrl = data.data.url;

      } else {
        const url = `https://raw.githubusercontent.com/David-Chian/Megumin-Bot-MD/main/lib/json/${command}.json`;
        const { data } = await axios.get(url);

        if (!Array.isArray(data) || data.length === 0) {
          return m.reply('❌ No hay imágenes disponibles.');
        }

        imageUrl = data[Math.floor(Math.random() * data.length)];
      }

      await client.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption: `🔥 *${command}*`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      m.reply('❌ Error al obtener la imagen');
    }
  }
};