import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  generateWAMessageContent
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

    const carouselContent = documents.map((doc, index) => ({
      documentMessage: {
        title: doc.title,
        document: {
          url: doc.url,
          mimetype: 'application/pdf',
          fileName: doc.fileName,
          fileLength: 99999999999,
          pageCount: 1
        },
        caption: `📄 ${doc.title} - Únete al grupo`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: true,
            mediaType: 1,
            title: doc.title,
            body: 'Haz clic para unirte al grupo o canal',
            previewType: 'PHOTO',
            thumbnail: global.photoSity.getRandom(), // Si tienes una imagen miniatura
            sourceUrl: doc.url
          }
        }
      }
    }));

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: "🗂️ Grupos y Canales Oficiales"
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "Selecciona un grupo para unirte"
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: carouselContent
            })
          })
        }
      }
    }, {
      quoted: m
    });

    await conn.relayMessage(m.chat, messageContent.message, {
      messageId: messageContent.key.id
    });

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, `❌️ *OCURRIÓ UN ERROR:* ${error.message}`, m);
  }
};

handler.command = ['test4'];

export default handler;