import fetch from 'node-fetch';
import FormData from 'form-data';

async function uploadToCatbox(buffer, mime) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, {
    filename: `banner.${mime.split('/')[1] || 'bin'}`,
    contentType: mime
  });

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });

  const url = await res.text();

  if (!url.startsWith('https://')) {
    throw new Error('Falló la subida a Catbox: ' + url);
  }

  return url;
}

export default {
  command: ['setbanner', 'setmenubanner'],
  category: 'socket',
  run: async ({client, m, args}) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = global.db.data.settings[idBot];
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender);
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket);

    const value = args.join(' ').trim();

    if (!value && !m.quoted && !m.message.imageMessage && !m.message.videoMessage)
      return m.reply('💣 Debes enviar o citar una imagen o video para cambiar el banner del bot.');

    if (value.startsWith('http')) {
      config.banner = value;
      return m.reply(`💥 Se ha actualizado el banner de *${config.namebot2}*!`);
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime))
      return m.reply('💣 Responde a una imagen o video válido.');

    const media = await q.download();
    if (!media) return m.reply('💣 No se pudo descargar el archivo.');

    const link = await uploadToCatbox(media, mime);
    config.banner = link;

    return m.reply(`💥 Se ha actualizado el banner de *${config.namebot2}*!`);
  },
};