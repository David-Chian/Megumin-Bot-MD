/*
• @David-Chian
- https://github.com/David-Chian
*/

import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys'
async function sendAlbumMessage(jid, medias, options = {}) {
  if (typeof jid !== "string") {
    throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`);
  }

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type} (${media.type?.constructor?.name})`);
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`);
    }
  }

  if (medias.length < 2) {
    throw new RangeError("Minimum 2 media");
  }

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text;
  delete options.caption;
  delete options.delay;

  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(media => media.type === "image").length,
        expectedVideoCount: medias.filter(media => media.type === "video").length,
        ...(options.quoted
          ? {
              contextInfo: {
                remoteJid: options.quoted.key.remoteJid,
                fromMe: options.quoted.key.fromMe,
                stanzaId: options.quoted.key.id,
                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                quotedMessage: options.quoted.message,
              },
            }
          : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
    await baileys.delay(delay);
  }

  return album;
}

const handler = async (m, { conn, args }) => {
    if (!args.length) return m.reply('⚠️ Debes ingresar una palabra clave. Ejemplo: /gimagenes gatos');

    let query = args.join(" ");
    let apiUrl = `https://delirius-apiofc.vercel.app/search/gimage?query=${encodeURIComponent(query)}`;

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status || !json.data.length) return m.reply('❌ No encontré imágenes para tu búsqueda.');

        let images = json.data.slice(0, 15).map(img => ({
            type: "image",
            data: { url: img.url }
        }));

        let caption = `📸 *Resultados para:* ${query}`;

        await sendAlbumMessage(m.chat, images, { caption, quoted: m });

    } catch (error) {
        console.error(error);
        m.reply('⚠️ Hubo un error al obtener las imágenes.');
    }
};

handler.command = /^gimagenes$/i;
export default handler;