import axios from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("@whiskeysockets/baileys"))["default"];

let handler = async (_0x10bd40, { conn: _0x9c7141, text: _0x27db11, usedPrefix: _0x55e61b, command: _0x5ad406 }) => {
  if (!_0x27db11) {
    return _0x9c7141.reply(_0x10bd40.chat, "🍟 *¿Qué quieres buscar en Pinterest?*", _0x10bd40);
  }

  await _0x10bd40.react("⏳");

  _0x9c7141.reply(_0x10bd40.chat, '🚩 *Buscando en Pinterest...*', _0x10bd40);

  async function _0x3f3fc7(imageUrl) {
    const { imageMessage } = await generateWAMessageContent({
      'image': { 'url': imageUrl }
    }, { 'upload': _0x9c7141.waUploadToServer });

    return imageMessage;
  }
  let { data } = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${_0x27db11}`);
  let imageUrls = data.map(item => item.image_large_url);
  _0x2af019(imageUrls);
  let imagesToShow = imageUrls.slice(0, 6);
  let cards = [];
  let counter = 1;
  for (let url of imagesToShow) {
    cards.push({
      'body': proto.Message.InteractiveMessage.Body.fromObject({
        'text': `Imagen - ${counter++}`
      }),
      'footer': proto.Message.InteractiveMessage.Footer.fromObject({
        'text': '🔎 Resultados de Pinterest'
      }),
      'header': proto.Message.InteractiveMessage.Header.fromObject({
        'title': '',
        'hasMediaAttachment': true,
        'imageMessage': await _0x3f3fc7(url)
      }),
      'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        'buttons': [{
          'name': "cta_url",
          'buttonParamsJson': `{"display_text":"Ver en Pinterest 📫","Url":"https://www.pinterest.com/search/pins/?q=${_0x27db11}"}`
        }]
      })
    });
  }
  const messageContent = generateWAMessageFromContent(_0x10bd40.chat, {
    'viewOnceMessage': {
      'message': {
        'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
          'body': proto.Message.InteractiveMessage.Body.create({
            'text': `🚩 Resultados de: ${_0x27db11}`
          }),
          'footer': proto.Message.InteractiveMessage.Footer.create({
            'text': '🔎 Pinterest - Búsquedas'
          }),
          'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            'cards': cards
          })
        })
      }
    }
  }, { 'quoted': _0x10bd40 });

  await _0x10bd40.react("✅");
  await _0x9c7141.relayMessage(_0x10bd40.chat, messageContent.message, {
    'messageId': messageContent.key.id
  });
};

handler.help = ["pinterest"];
handler.tags = ["buscador"];
handler.estrellas = 1;
handler.group = true;
handler.register = true;
handler.command = ['pinterest'];

export default handler;