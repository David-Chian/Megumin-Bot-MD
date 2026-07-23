import { detectNSFW, isModelReady, downloadFromUrl } from '../core/detect.ts';

const types = new Set(['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage']);
const mimetypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp', 'video/mp4', 'video/3gpp', 'video/mpeg', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo', 'video/webm']);
const extensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.mp4', '.3gp', '.mpeg', '.mov', '.mkv', '.avi', '.webm']);
const urlregex = /https?:\/\/[^\s]+/gi;

function extractMediaUrl(text) {
  if (!text) return null;
  const urls = text.match(urlregex) || [];
  for (const url of urls) {
    const ext = url.split('?')[0].match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();
    if (ext && extensions.has(ext)) return url;
  }
  return null;
}

export default async (sock, m) => {
  if (!m.isGroup) return;
  if (m.isBot) return;
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const chat = await getChat(m.chat);
  if (!chat?.antinsfw) return;
  const settings = await getSettings(botId);
  const isSelf = (settings.self ?? false) || (chat.isMute ?? false);
  if (isSelf) return;
  const primaryBotId = chat?.primaryBot;
  if (primaryBotId && primaryBotId !== botId) return;
  const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null);
  if (!groupMetadata) return;
  const participants = groupMetadata.participants || [];
  const groupAdmins = participants.filter(p => p.admin).map(p => p.phoneNumber || p.jid)
  const isAdmin = groupAdmins.includes(m.sender)
  const isBotAdmin = groupAdmins.includes(botId)
  if (isAdmin || !isBotAdmin) return;
  if (!isModelReady()) return;
  try {
    let buffer = null;
    let mimeType = null;
    if (m.isMedia && types.has(m.type) && m.mime && mimetypes.has(m.mime)) {
      buffer = await m.download();
      mimeType = m.mime;
    } else {
      const url = extractMediaUrl(m.text || m.caption || '');
      if (!url) return;
      const downloaded = await downloadFromUrl(url);
      buffer = downloaded.buffer;
      mimeType = downloaded.mimeType;
    }
    if (!buffer || buffer.length < 1024) return;
    const result = await detectNSFW(buffer, mimeType);
    if (!result.isNSFW) return;
    await Promise.allSettled([
      sock.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.key.participant }}),
      sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove'),
    ]);
    const user = await getUser(m.sender);
    const userName = user?.name || m.pushName || 'Usuario';
    await sock.reply(m.chat, `> ꕥ Se eliminó a *${userName}* del grupo por \`Anti-NSFW\`.\n> *${result.label}* (${result.confidence}%)`, null);
  } catch (err) {
    console.error('[ AntiNSFW ] Error:', err?.message);
  }
};
