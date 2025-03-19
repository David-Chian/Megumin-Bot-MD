/*
• @David-Chian
- https://github.com/David-Chian
*/

import { googleImage } from '@bochilteam/scraper';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    delete options.text;
    delete options.caption;
    delete options.delay;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
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

const megumin = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*💜 Uso Correcto: ${usedPrefix + command} Kotori*`, m);

    await m.react('⏳');
    conn.reply(m.chat, '💜 *Descargando su imagen...*', m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
title: packname,
body: wm,
previewType: 0, thumbnail: icons,
sourceUrl: channel }}})

    try {
        const res = await googleImage(text);
        const images = [];

        for (let i = 0; i < 10; i++) {
            const image = await res.getRandom();
            if (image) images.push({ type: "image", data: { url: image } });
        }

        if (images.length < 2) return conn.reply(m.chat, '❌ No se encontraron suficientes imágenes para un álbum.', m);

        const caption = `💜 *Resultados de búsqueda para:* ${text}`;
        await sendAlbumMessage(m.chat, images, { caption, quoted: m });

        await m.react('✅');
    } catch (error) {
        console.error(error);
        await m.react('❌');
        conn.reply(m.chat, '⚠️ Hubo un error al obtener las imágenes.', m);
    }
};

megumin.help = ['imagen <query>'];
megumin.tags = ['buscador', 'tools', 'descargas'];
megumin.command = /^(gimage|image|imagen)$/i;
megumin.register = true;

export default megumin;