import { upload } from '../../core/uploadImage.ts';

export default {
  command: ['tourl'],
  category: 'utils',
  run: async ({ sock, m }) => {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) {
      return m.reply(`《✧》 Por favor, responde a una imagen, video o audio con el comando */tourl* para convertirlo en una URL.`);
    }

    let isImage = /image\/(png|jpe?g|gif|webp)/.test(mime);
    let isVideo = /video\/mp4/.test(mime);
    let isAudio = /audio\/(mpeg|mp3|wav|ogg)/.test(mime);

    if (!isImage && !isVideo && !isAudio) {
      return m.reply('⚠️ El archivo no es compatible, solo se permiten *imágenes, videos y audios*.');
    }

    await sock.sendMessage(m.chat, { react: { text: '💥', key: m.key } });

    try {
      let media = await q.download();
      if (!media) throw new Error('No se pudo descargar el archivo.');

      const extMap = {
        'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
        'image/gif': 'gif', 'video/mp4': 'mp4',
        'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
        'audio/wav': 'wav', 'audio/ogg': 'ogg'
      };
      const ext = extMap[mime] || 'bin';
      const filename = `file.${ext}`;

      const { url: link } = await upload(media, filename);

      let txt = `乂  *L I N K - E N L A C E* 乂\n\n`;
      txt += `*» Enlace* : ${link}\n`;
      txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
      txt += `*» Tipo* : ${mime}\n`;
      txt += `*» Expiración* : No expira\n\n`;
      txt += `> *${dev}*`;

      if (isImage && !mime.includes('gif')) {
        await sock.sendMessage(m.chat, {
          image: media,
          caption: txt
        }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, { text: txt }, { quoted: m });
      }

    } catch (e) {
      console.error('Error en tourl:', e);
      m.reply(`❌ Error al procesar el archivo: ${e.message}`);
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}