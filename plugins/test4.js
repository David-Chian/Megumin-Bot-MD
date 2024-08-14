import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
const {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
} = (await import("@whiskeysockets/baileys")).default;

const handler = async (m, { conn }) => {
  try {
    const documents = [
      {
        title: "Grupo 1",
        url: "https://chat.whatsapp.com/J9gyFJLbhVIJXaUZlpo8Xt",
        fileName: "Grupo 1 - WhatsApp"
      },
      {
        title: "Grupo 2",
        url: "https://chat.whatsapp.com/J9gyFJLbhVIJXaUZlpo8Xt",
        fileName: "Grupo 2 - WhatsApp"
      },
      {
        title: "Grupo 3",
        url: "https://chat.whatsapp.com/LJKcR8QBJgu37bVFWuhRVn",
        fileName: "Grupo 3 - WhatsApp"
      },
      {
        title: "Canal Oficial",
        url: "https://whatsapp.com/channel/0029VacDy0R6hENqnTKnG820",
        fileName: "Canal Oficial - WhatsApp"
      }
    ];

    for (const doc of documents) {
      const buttonMessage = {
        document: {
          url: doc.url
        },
        mimetype: 'application/pdf',
        fileName: doc.fileName,
        fileLength: '99999999999999',
        pageCount: 1,
        caption: `📄 ${doc.title} - Únete al grupo`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 1,
            title: doc.title,
            body: 'Haz clic para unirte al grupo o canal',
            previewType: 'PHOTO',
            thumbnail: global.photoSity.getRandom(),
            sourceUrl: doc.url
          }
        },
        buttons: [
          { buttonId: `link_${doc.url}`, buttonText: { displayText: `Unirme a ${doc.title}` }, type: 1 }
        ],
        headerType: 1
      };

      await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    }
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, `❌️ *OCURRIÓ UN ERROR:* ${error.message}`, m);
  }
};

handler.command = ['test4'];

export default handler;