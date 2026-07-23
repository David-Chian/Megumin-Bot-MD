import sharp from 'sharp';

export default {
  command: ['report', 'reporte', 'sug', 'suggest'],
  category: 'info',
  run: async ({ sock, m, args, command }) => {
    const texto = args.join(' ').trim();
    const now = Date.now();

    try {
      const userData = await getUser(m.sender);

      const cooldown = userData.sugCooldown || 0;
      const restante = cooldown - now;
      if (restante > 0) {
        return m.reply(`《✤》 Espera *${msToTime(restante)}* para volver a usar este comando.`);
      }

      if (!texto) {
        return m.reply(`《✤》 Debes *escribir* el *reporte* o *sugerencia*.`);
      }

      if (texto.length < 10) {
        return m.reply('✿ Tu mensaje es *demasiado corto*. Explica mejor tu reporte/sugerencia (mínimo 10 caracteres)');
      }

      const fecha = new Date();
      const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fechaLocal = fecha.toLocaleDateString('es-MX', opcionesFecha);

      const tipo  = (command === 'report' || command === 'reporte') ? '🆁ҽ𝕡σɾƚҽ' : '🆂մց𝕖ɾҽ𝚗cíᥲ';
      const tipo2 = (command === 'report' || command === 'reporte') ? 'ꕥ Reporte' : 'ꕥ Sugerencia';
      const displayName = m.pushName || 'Usuario desconocido';
      const numero = m.sender.split('@')[0];
      const pp = await sock.profilePictureUrl(m.sender, 'image')
        .catch(() => 'https://cdn.sockywa.xyz/files/1755559736781.jpeg');

      const reportMsg =
        `🫗۫᷒ᰰ⃘ׅ᷒  ۟　\`${tipo}\`　ׅ　ᩡ\n\n` +
        `𖹭  ׄ  ְ 💥 *Nombre*\n> ${displayName}\n\n` +
        `𖹭  ׄ  ְ 🦩 *Número*\n> wa.me/${numero}\n\n` +
        `𖹭  ׄ  ְ 🌱 *Fecha*\n> ${fechaLocal}\n\n` +
        `𖹭  ׄ  ְ 🔥 *Mensaje*\n> ${texto}\n\n` +
        dev;

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = await getSettings(botId);
      const canalId   = botSettings.id       || '';
      const canalName = botSettings.nameid   || '';
      const link      = botSettings.link     || '';
      const botname   = botSettings.namebot  || '';
      const botname2  = botSettings.namebot2 || '';

let jpegThumbnail: Buffer | undefined;

if (pp) {
  try {
    const response = await fetch(pp);
    const arrayBuffer = await response.arrayBuffer();
    jpegThumbnail = await sharp(Buffer.from(arrayBuffer))
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    jpegThumbnail = undefined;
  }
}

      const sendReport = async (chatId: string) => {
        await sock.sendMessage(chatId, {
          text: link ? `${link}\n\n${reportMsg}` : reportMsg,

linkPreview: link
  ? {
      'canonical-url': link,
      'matched-text':  link,
      title:           tipo2,
      description:     `${displayName} • wa.me/${numero}`,
      jpegThumbnail,
    }
  : undefined,

          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 0,
            isForwarded: true,
            forwardedNewsletterMessageInfo: canalId
              ? { newsletterJid: canalId, serverMessageId: null, newsletterName: canalName }
              : undefined,
          },
        });
      };

        try {
          for (const nums of global.mods) {
            await sendReport(`${nums}@s.whatsapp.net`);
          }
        } catch {
        m.reply('● Hubo un error al mandar el mensaje a los moderadores. Intentelo más tarde.')
        }

      userData.sugCooldown = now + 24 * 60 * 60000;
      await updateUser(m.sender, 'sugCooldown', userData.sugCooldown);

      m.reply(
        `《✤》 Gracias por tu *${(command === 'report' || command === 'reporte') ? 'reporte' : 'sugerencia'}*\n\n> Tu mensaje fue enviado correctamente a los moderadores`
      );

    } catch {
      m.reply(msgglobal);
    }
  },
};

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours   = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days    = Math.floor(duration / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days    > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
  if (hours   > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  parts.push(`${seconds.toString().padStart(2, '0')} segundo${seconds !== 1 ? 's' : ''}`);

  return parts.join(', ');
};