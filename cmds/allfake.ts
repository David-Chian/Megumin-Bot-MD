import axios from 'axios';
import sharp from 'sharp';
import { proto } from '@whiskeysockets/baileys';

export async function before(m: any, { sock, client }: any) {
  const _sock  = sock ?? client;
  const selfId = _sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const bot    = await getSettings(selfId);

  const botname   = bot.namebot;
  const botname2  = bot.namebot2;
  const icon      = bot.icon;
  const canalId   = bot.id;
  const canalName = bot.nameid;
  const link      = bot.link;

  const canal = 'https://whatsapp.com/channel/0029Vaxr2YgLCoWy2NS1Ab0a';
  const gpo   = 'https://chat.whatsapp.com/J8zdwcBq05qBBGRtF872zW';
  const gpo2  = 'https://chat.whatsapp.com/J9gyFJLbhVIJXaUZlpo8Xt?mode=gi_t';
  const gpo3  = 'https://chat.whatsapp.com/JrO1REb8ESRAKgRQKaF8KC?mode=gi_t';
  const web   = 'https://diamondbots.xyz';

  (global as any).redes = [canal, gpo, gpo2, gpo3, link, web][Math.floor(Math.random() * 6)];

  let jpegThumbnail: Buffer | undefined;
  try {
    const res = await axios.get(icon, { responseType: 'arraybuffer', timeout: 5000 });
    jpegThumbnail = await sharp(Buffer.from(res.data))
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch {
    jpegThumbnail = undefined;
  }

  const selectedLink = (global as any).redes;

  const contextInfo = {
    forwardingScore: 0,
    isForwarded: true,
    forwardedNewsletterMessageInfo: canalId
      ? { newsletterJid: canalId, newsletterName: canalName, serverMessageId: null }
      : undefined,
  };

  m.replyCanal = async (text: string) => {
    await _sock.sendMessage(m.chat, {
      text: `${link}\n\n${text}`,
      linkPreview: {
        'canonical-url': selectedLink,
        'matched-text':  selectedLink,
        title:           botname2,
        description:     botname,
        jpegThumbnail,
      },
      contextInfo,
    }, { quoted: m });
  };

  m.rcanal = { contextInfo, jpegThumbnail };
}