import sharp from 'sharp';

export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',
  run: async ({ sock, m, args }) => {
    const chatId = m.chat;
    const userId = m.sender;

    const chatConfig = await getChat(chatId);

    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal);

    const user       = await getChatUser(chatId, userId);
    const globalUser = await getUser(userId);

    const now = Date.now();

    const cooldowns = {
      vote:     Math.max(0, (user.voteCooldown     || 0) - now),
      roll:     Math.max(0, (user.rwCooldown       || 0) - now),
      claim:    Math.max(0, (user.buyCooldown      || 0) - now),
      robo:     Math.max(0, (user.robopCooldown    || 0) - now),
      aventura: Math.max(0, (user.aventuraCooldown || 0) - now),
    };

    const formatTime = (ms) => {
      if (ms <= 0) return 'Ahora.';
      const totalSeconds = Math.floor(ms / 1000);
      const hours   = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const parts = [];
      if (hours   > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
      if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);
      return parts.join(' ');
    };

    const formatCompact = (n: number): string => {
      if (n >= 1_000_000_000_000_000) return (n / 1_000_000_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'Q'
      if (n >= 1_000_000_000_000)     return (n / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '')     + 'T'
      if (n >= 1_000_000_000)         return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')         + 'B'
      if (n >= 1_000_000)             return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')             + 'M'
      if (n >= 1_000)                 return (n / 1_000).toFixed(2).replace(/\.?0+$/, '')                 + 'K'
      return n.toLocaleString()
    }

    const nombre     = globalUser?.name || userId.split('@')[0];
    const personajes = user.characters || [];
    const valorTotal = personajes.reduce((acc, char) => acc + (char.value || 0), 0);
    const valorStr   = formatCompact(valorTotal);

    const mensaje =
      `ׅ  ׄ  ꕤ   ׅ り Usuario \`<${nombre}>\`\n\n` +
      `𖹭᳔ㅤㅤㅤׄㅤㅤ✿ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾\n\n` +
      `ׅ  ׄ  ✤   ׅ り RollWaifu » *${cooldowns.roll     > 0 ? formatTime(cooldowns.roll)     : 'Ahora.'}*\n` +
      `ׅ  ׄ  ✤   ׅ り Claim » *${cooldowns.claim    > 0 ? formatTime(cooldowns.claim)    : 'Ahora.'}*\n` +
      `ׅ  ׄ  ✤   ׅ り Robar » *${cooldowns.robo     > 0 ? formatTime(cooldowns.robo)     : 'Ahora.'}*\n` +
      `ׅ  ׄ  ✤   ׅ り Vote » *${cooldowns.vote     > 0 ? formatTime(cooldowns.vote)     : 'Ahora.'}*\n` +
      `ׅ  ׄ  ✤   ׅ り Aventura » *${cooldowns.aventura > 0 ? formatTime(cooldowns.aventura) : 'Ahora.'}*\n\n` +
      `𖹭᳔ㅤㅤㅤׄㅤㅤ✿ㅤㅤׅㅤㅤゕㅤㅤׄㅤㅤㅤ𑄾𑄾\n\n` +
      `ׅ  ׄ  ❀   ׅ り Personajes reclamados » *${personajes.length}*`;

    const botId       = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = await getSettings(botId);
    const canalId     = botSettings.id       || '';
    const canalName   = botSettings.nameid   || '';
    const link        = botSettings.link     || '';
    const botname     = botSettings.namebot  || '';
    const botname2    = botSettings.namebot2 || '';

    const ppUrl = await sock.profilePictureUrl(userId, 'image')
      .catch(() => botSettings.icon || '');

    let jpegThumbnail: Buffer | undefined;
    if (ppUrl) {
      try {
        const response    = await fetch(ppUrl);
        const arrayBuffer = await response.arrayBuffer();
        jpegThumbnail = await sharp(Buffer.from(arrayBuffer))
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch {
        jpegThumbnail = undefined;
      }
    }

    await sock.sendMessage(m.chat, {
      text: link ? `${link}\n\n${mensaje}` : mensaje,

      linkPreview: link
        ? {
            'canonical-url': link,
            'matched-text':  link,
            title:           `ꕤ ${nombre}`,
            description:     `Personajes: ${personajes.length} • Valor: ${valorStr}`,
            jpegThumbnail,
          }
        : undefined,

      contextInfo: {
        mentionedJid: [userId],
        forwardingScore: 0,
        isForwarded: true,
        forwardedNewsletterMessageInfo: canalId
          ? { newsletterJid: canalId, serverMessageId: null, newsletterName: canalName }
          : undefined,
      },
    }, { quoted: m });
  },
};