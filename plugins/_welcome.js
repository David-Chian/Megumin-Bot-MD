import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  let vn = 'https://qu.ax/cTDa.mp3';
  let welc = welcome
  let adi = adios
  let chat = global.db.data.chats[m.chat];
  
  const getMentionedJid = () => {
    return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`);
  };

  if (chat.welcome && m.messageStubType === 27) {
    this.sendMessage(m.chat, {
      audio: { url: vn },
      contextInfo: {
        mentionedJid: getMentionedJid(),
        "externalAdReply": {
          "thumbnail": welc,
          "title": "  ͟͞ Ｗ Ｅ Ｌ Ｃ Ｏ Ｍ Ｅ ͟͞  ",
          "body": dev,
          "previewType": "PHOTO",
          "thumbnailUrl": null,
          "showAdAttribution": true,
          sourceUrl: [ yt, md, channel].sort(() => 0.5 - Math.random())[0]
        }
      },
      ptt: true,
      mimetype: 'audio/mpeg',
      fileName: 'error.mp3'
    }, { quoted: fkontak });
  }

  if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
    const mentionedJid = m.messageStubParameters[0];
    const userTag = '@' + m.sender.split('@s.whatsapp.net')[0];

    const text = `Se fue ${userTag} nadie lo va a extrañar 😹`;

    this.sendMessage(m.chat, {
        text: text,
        contextInfo: {
            mentionedJid: [mentionedJid],
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363307382381547@newsletter',
                serverMessageId: '',
                newsletterName: '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐/♡ ͟͞ 𓆩ꪶꪾ𝘿᪶𝙞ᷨ𝙢ᷞ𝙤᪶ͨ𝙣ᷜ𝙙ꫂৎ୭࠱࠭ ͟͞'
            },
            forwardingScore: 9999999,
            isForwarded: true,
            "externalAdReply": {
                "showAdAttribution": true,
                "containsAutoReply": true,
                "title": '  ͟͞ Ａ Ｄ Ｉ Ｏ́ Ｓ ͟͞  ',
                body: 'Esperemos que no vuelva -_-',
                "previewType": "PHOTO",
                "thumbnailUrl": '',
                "thumbnail": adi,
                "sourceUrl": redes
            }
        }
    }, { quoted: null, ephemeralExpiration: 24 * 60 * 100, disappearingMessagesInChat: 24 * 60 * 100 });
}