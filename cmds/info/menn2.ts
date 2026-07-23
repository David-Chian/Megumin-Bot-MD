import fetch from 'node-fetch';
import {
  prepareWAMessageMedia
} from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { commands } from '../../core/system/comandos.ts';

export default {
  command: ['menn2'],
  category: 'info',
  run: async ({ sock, m, text, args, prefix }) => {
    try {
      const cmdsList = commands;

      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Havana' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).replace(/,/g, '');

      const tiempo2 = moment.tz('America/Havana').format('hh:mm A');
      const plugins = commands.length;

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = await getSettings(botId);
      const botname  = botSettings.namebot  || '';
      const botname2 = botSettings.namebot2 || '';
      const banner   = botSettings.banner   || '';
      const owner    = botSettings.owner    || '';
      const canalId   = botSettings.id     || '';
      const canalName = botSettings.nameid || '';
      const link     = botSettings.link    || '';

      const userr      = await getUser();
      const totalUsers = Object.keys(userr).length || 0;

      let desar = 'Oculto';
      if (owner && !isNaN(Number(owner.replace(/@s\.whatsapp\.net$/, '')))) {
        const userData = await getUser(owner);
        desar = userData?.genre || 'Oculto';
      }

      const jam     = moment.tz('America/Havana').locale('id').format('HH:mm:ss');
      const ucapan  = jam < '05:00:00' ? 'Buen día'
        : jam < '11:00:00' ? 'Buen día'
        : jam < '15:00:00' ? 'Buenas tardes'
        : jam < '18:00:00' ? 'Buenas tardes'
        : jam < '19:00:00' ? 'Buenas tardes'
        : jam < '23:59:00' ? 'Buenas noches'
        : 'Buenas noches';

      let menu = `\n\n`;
      menu += `> . ﹡ ﹟ 💥 ׄ ⬭ ${ucapan}  *${m.pushName || 'Sin nombre'}*\n\n`;
      menu += `ׅㅤꨶ𓏴. ㅤׄㅤ⸼ㅤׄ *͜🔥͜* ㅤ֢ㅤ⸱ㅤᯭִ\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *${desar === 'Hombre' ? 'Creador' : desar === 'Mujer' ? 'Creadora' : 'Creador(a)'} ›* ${owner ? (!isNaN(Number(owner.replace(/@s\.whatsapp\.net$/, ''))) ? `@${owner.split('@')[0]}` : owner) : 'Oculto por privacidad'}\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *Plugins ›* ${plugins}\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *Versión ›* ^4.0.0 ⋆. 𐙚 ˚\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *Web ›* diamond.stellarwa.xyz\n\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *Fecha ›* ${tiempo}, ${tiempo2}\n`;
      menu += `ׅㅤ𓍢𓈒ㅤׄ *Users ›* ${totalUsers.toLocaleString()} ฅ(ᯫ᳐ꔷ⩊ꔷ˶ᯫ᳐)\n`;

      const categoryArg = args[0]?.toLowerCase();
      const categories: Record<string, any[]> = {};

      for (const command of cmdsList) {
        const category = command.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      }

      if (categoryArg && !categories[categoryArg]) {
        return m.reply(
          `「✎」La categoría *${categoryArg}* no fue encontrada.\n\nCategorías disponibles:\n${Object.keys(categories).map(c => `「${c}」`).join('\n')}`
        );
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;

        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        menu += `\n\n  ═━━── ❖ ${catName} ❖ ──━━═\n*.・。✨ ₊˚.⋆☾⋆.˚₊ ✨ ・。.*\n`;

        cmds.forEach(cmd => {
          const match     = prefix.match(/[#\/+.!-]$/);
          const separator = match ? match[0] : '';
          const cleanPrefix = separator || prefix;
          const aliases = cmd.alias
            .map(a => `${cleanPrefix}${a.split(/[\/#!+.\-]+/).pop().toLowerCase()}`)
            .join(' › ');
          menu += `\n➤  *${prefix + aliases}* ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
          menu += `> _*${cmd.desc}*_`;
        });
      }

const thumbnailMedia = banner
  ? await prepareWAMessageMedia(
      {
        image: { url: banner },
      },
      {
        upload: sock.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link',
      }
    )
  : null;

const menuText = `${link}\n\n${menu.trim()}`;

await sock.sendMessage(
  m.chat,
  {
    text: menuText,

    linkPreview: link && banner
      ? {
          'canonical-url': link,
          'matched-text': link,
          title: botname,
          description: `${botname2}, Built With ❨◣_◢❩凸 💎`,
          jpegThumbnail: thumbnailMedia?.imageMessage?.jpegThumbnail
            ? Buffer.from(thumbnailMedia.imageMessage.jpegThumbnail)
            : undefined,
          highQualityThumbnail: thumbnailMedia?.imageMessage || undefined,
        }
      : undefined,

    contextInfo: {
      mentionedJid: owner ? [owner] : [],
      forwardingScore: 0,
      isForwarded: true,

      forwardedNewsletterMessageInfo: {
        newsletterJid: canalId,
        serverMessageId: null,
        newsletterName: canalName,
      },
    },
  },
  {
    quoted: m,
  }
);

    } catch (e: any) {
      await m.reply(e?.message || String(e));
    }
  },
};