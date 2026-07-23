import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import sharp from 'sharp';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async ({ sock, m }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = await getSettings(botId);
    const botname  = bot.namebot  || '';
    const botname2 = bot.namebot2 || '';
    const banner   = bot.icon     || '';
    const canalId   = bot.id     || '';
    const canalName = bot.nameid || '';
    const link      = bot.link   || '';

    const from = m.key.remoteJid;
    const groupMetadata = m.isGroup ? await sock.groupMetadata(from).catch(() => {}) : '';
    const groupParticipants = groupMetadata?.participants?.map(
      (p) => p.phoneNumber || p.jid || p.lid || p.id
    ) || [];

    const mainBotJid = global.sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isMainBotInGroup = groupParticipants.includes(mainBotJid);

    const basePath = path.join(dirname, '../../Sessions');
    const folders = { Subs: 'Subs' }; 

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName);
      if (!fs.existsSync(folderPath)) return [];
      return fs
        .readdirSync(folderPath)
        .filter((dir) => fs.existsSync(path.join(folderPath, dir, 'creds.json')))
        .map((id) => id.replace(/\D/g, ''));
    };
    const subs  = getBotsFromFolder(folders.Subs);
    const categorizedBots = { Owner: [], Sub: [] };
    const mentionedJid = [];

    const formatBot = async (number, label) => {
      const jid = number + '@s.whatsapp.net';
      if (!groupParticipants.includes(jid)) return null;
      mentionedJid.push(jid);
      const data = await getSettings(jid);
      const name = data?.namebot2 || 'Bot';
      return `- [${label} *${name}*] › @${number}`;
    };

    if (getSettings(mainBotJid)) {
      const name   = (await getSettings(mainBotJid))?.namebot2;
      const handle = `@${mainBotJid.split('@')[0]}`;
      if (isMainBotInGroup) {
        mentionedJid.push(mainBotJid);
        categorizedBots.Owner.push(`- [Owner *${name}*] › ${handle}`);
      }
    }

    for (const num of subs)  { const l = await formatBot(num, 'Sub');     if (l) categorizedBots.Sub.push(l);     }
    const totalCounts = {
      Owner:   1,
      Sub:     subs.length,
    };

    const totalBots = totalCounts.Owner + totalCounts.Sub;
    const totalInGroup =
      categorizedBots.Owner.length +
      categorizedBots.Sub.length;

    let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`;
    message += `ੈ❖‧₊˚ Principales › *${totalCounts.Owner}*\n`;
    message += `ੈ✿‧₊˚ Subs › *${totalCounts.Sub}*\n\n`;  
    message += `➭ *Bots en el grupo ›* ${totalInGroup}\n`;

    for (const category of ['Owner', 'Sub']) {
      if (categorizedBots[category].length) {
        message += categorizedBots[category].join('\n') + '\n';
      }
    }

let jpegThumbnail: Buffer | undefined;

if (banner) {
  try {
    const response = await fetch(banner);
    const arrayBuffer = await response.arrayBuffer();
    jpegThumbnail = await sharp(Buffer.from(arrayBuffer))
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();
  } catch {
    jpegThumbnail = undefined;
  }
}
    await sock.sendMessage(
      m.chat,
      {
        text: link ? `${link}\n\n${message.trim()}` : message.trim(),

        linkPreview: link
          ? {
              'canonical-url': link,
              'matched-text': link,
              title: botname,
              description: `${botname2} • Sockets activos: ${totalBots}`,
              jpegThumbnail,
            }
          : undefined,

        contextInfo: {
          mentionedJid,
          forwardingScore: 0,
          isForwarded: true,
          forwardedNewsletterMessageInfo: canalId
            ? {
                newsletterJid: canalId,
                serverMessageId: null,
                newsletterName: canalName,
              }
            : undefined,
        },
      },
      { quoted: m }
    );
  },
};