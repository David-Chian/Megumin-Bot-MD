import fs from 'fs';
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} from '@whiskeysockets/baileys';

const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./core/characters.json', 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('[Error] characters.json:', error);
    return [];
  }
};

const FALLBACK_IMAGE = 'https://cdn.sockywa.xyz/files/1751246122292.jpg';

const createImageMessage = async (sock, url) => {
  try {
    const { imageMessage } = await generateWAMessageContent(
      { image: { url } },
      { upload: sock.waUploadToServer }
    );
    return imageMessage;
  } catch {
    try {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: FALLBACK_IMAGE } },
        { upload: sock.waUploadToServer }
      );
      return imageMessage;
    } catch {
      return null;
    }
  }
};

export default {
  command: ['verpersonaje', 'vp'],
  category: 'gacha',
  run: async ({ sock, m, args }) => {
    const chatId = m.chat;
    const text = args.join(' ').trim();

    const chat = await getChat(chatId);
    const personajes = obtenerPersonajes();

    if (personajes.length === 0)
      return sock.reply(m.chat,'No hay personajes disponibles en este momento.',m,m.rcanal);

    let matchingCharacters = [];

    if (text) {
      const busqueda = text.toLowerCase();
      matchingCharacters = personajes.filter(p =>
        p?.name?.toLowerCase().includes(busqueda)
      );

      if (matchingCharacters.length === 0)
        return sock.reply(m.chat,`❌ El personaje *${text}* no fue encontrado en la base de datos.`,m,m.rcanal);
    } else {
      matchingCharacters = [personajes[Math.floor(Math.random() * personajes.length)]];
    }

    const buildCardData = async (character) => {
      const votos = character?.votes ?? 0;

      const personajesReservados = Array.isArray(chat.personajesReservados)
        ? chat.personajesReservados
        : [];

      const reservado = personajesReservados.find(p => p.url === character.url);

      const chatUsers = await getChatUser(chatId);
      const poseedor = chatUsers.find(u =>
        Array.isArray(u.characters) && u.characters.some(c => c.url === character.url)
      );

      let estado;
      if (poseedor) {
        const userData = await getUser(poseedor.user_id);
        estado = `Ocupado por ${userData?.name || poseedor.user_id.split('@')[0]}`;
      } else if (reservado) {
        const userData = await getUser(reservado.userId);
        estado = `Reservado por ${userData?.name || reservado.userId.split('@')[0]}`;
      } else {
        estado = 'Libre';
      }

      const texto = `● Nombre: ${character.name}
✧ Género: ${character.gender}
✦ Valor: ${character.value} RWcoins
◆ Votos: ${votos}
✤ Fuente: ${character.source}
★ Estado: ${estado}`.trim();

      return { character, texto, estado };
    };

    const cardsData = await Promise.all(matchingCharacters.map(buildCardData));

    if (cardsData.length === 1) {
      const { character, texto } = cardsData[0];

      if (!character.url)
        return sock.reply(m.chat,`✎ No se encontró imagen para *${character.name}*.`,m,m.rcanal);

      await sock.sendMessage(chatId, {
        image: { url: character.url },
        caption: texto,
        mimetype: 'image/jpeg'
      }, { quoted: m });

      return;
    }

    const cards = await Promise.all(
      cardsData.map(async ({ character, texto }) => {
        const imageMessage = await createImageMessage(sock, character.url);

        return {
          body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: texto,
            hasMediaAttachment: Boolean(imageMessage),
            ...(imageMessage ? { imageMessage } : {})
          }),
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: []
            })
        };
      })
    );

    const messageContent = generateWAMessageFromContent(
      chatId,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: text
                  ? `🏆 Resultados para: ${text}`
                  : `🎲 Personaje aleatorio`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: 'Desliza para ver los personajes.'
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false
              }),
              carouselMessage:
                proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
            })
          }
        }
      },
      { quoted: m }
    );

    await sock.relayMessage(chatId, messageContent.message, {
      messageId: messageContent.key.id
    });
  }
};