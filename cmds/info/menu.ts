import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';
import moment from 'moment-timezone';
import { commands } from '../../core/system/comandos.ts';

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ sock, m, args, command, text, prefix }) => {
    try {
      const now = new Date();
      const colombianTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Havana' })
      );
      const tiempo = colombianTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/,/g, '');
      const tiempo2 = moment.tz('America/Havana').format('hh:mm A');
      const jam = moment.tz('America/Havana').locale('id').format('HH:mm:ss')
const ucapan = jam < '05:00:00' ? 'Buen día' : jam < '11:00:00' ? 'Buen día' : jam < '15:00:00' ? 'Buenas tardes' : jam < '18:00:00' ? 'Buenas tardes' : jam < '19:00:00' ? 'Buenas tardes' : jam < '23:59:00' ? 'Buenas noches' : 'Buenas noches';

      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
      const botSettings = await getSettings(botId);
      const botname  = botSettings.namebot  || '';
      const botname2 = botSettings.namebot2 || '';
      const banner   = botSettings.banner   || '';
      const owner    = botSettings.owner    || '';
      const link     = botSettings.link     || '';
      const canalId   = botSettings.id      || '';
      const canalName = botSettings.nameid  || '';

      const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net';

      const botType = isOficialBot
        ? 'Owner'
        : 'Sub Bot';

      const userr  = await getUser();
      const users  = Object.keys(userr).length || 0;
      const time   = sock.uptime ? formatearMs(Date.now() - sock.uptime) : 'Desconocido';
      const device = getDevice(m.key.id);
      const own    = await getUser(owner);

      const categoriesSet = new Set<string>();
      commands.forEach(cmd => {
        if (cmd.category) categoriesSet.add(cmd.category.toLowerCase());
      });
      const uniqueCategories = Array.from(categoriesSet).sort();

      const sections = [{
        title: 'Տᥱᥣᥱᥴᥴі᥆ᥒᥲ ᥙᥒᥲ ᑕᥲ𝗍ᥱg᥆rі́ᥲ',
        rows: uniqueCategories.map(cat => ({
          header: `ᑕᥲ𝗍ᥱg᥆rі́ᥲ: ${cat.toUpperCase()}`,
          title: `ᐯᥱr ᥴ᥆mᥲᥒძ᥆s ძᥱ ${cat}`,
          description: `ᗰᥙᥱs𝗍rᥲ ᥣᥲ ᥣіs𝗍ᥲ ძᥱ ${cat}`,
          id: `${prefix}menn2 ${cat}`,
        })),
      }];
let menu = `\n\n`
menu += `•...․⁀⸱⁀⸱︵⸌⸃૰⳹․💥․⳼૰⸂⸍︵⸱⁀⸱⁀․...•\n`
menu += `𔓕꯭ ꯭ 𓏲꯭֟፝੭ ꯭⌑𝐄꯭𝐗꯭𝐏꯭𝐋꯭𝐎꯭𝐒꯭𝐈𝐎꯭𝐍꯭⌑꯭ 𓏲꯭֟፝੭꯭  ꯭𔓕\n`
menu += `▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬\n`
menu += `> ${ucapan}  *${m.pushName ? m.pushName : 'Sin nombre'}*\n\n`
menu += `.   ╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🍨⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
menu += `. ☁️⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪ 🄼🄴🄽🅄-🄱🄾🅃໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
menu += `֪࣪   ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🍧⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Creador ›* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "5351524614"}\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Versión ›* ^4.0.0 ⋆. 𐙚 ˚\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Link ›* ${link}\n\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Fecha ›* ${tiempo}, ${tiempo2}\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Users ›* ${users.toLocaleString()} ฅ(ᯫ᳐ꔷ⩊ꔷ˶ᯫ᳐)\n`
menu += `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n`

      const categoryArg = args[0]?.toLowerCase();
      const categories: Record<string, any[]> = {};

      for (const cmd of commands) {
        const cat = cmd.category || 'otros';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
      }

      if (categoryArg && !categories[categoryArg]) {
        return m.reply(`《✤》 La categoría *${categoryArg}* no fue encontrada.`);
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
      menu += `\n.    ╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🔥⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n.   ☁️⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪ *${catName}* ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪☁️ׅ\n֪࣪    ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🔥⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
        cmds.forEach(cmd => {
          const aliases = cmd.alias
            .map(a => `${prefix}${a.split(/[\/#!+.\-]+/).pop().toLowerCase()}`)
            .join(' › ');
          menu += `֯　ׅ🫟ֶ֟፝֯ㅤ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
          menu += `> ✺ ${cmd.desc}\n`;
        });
      }

      menu += `> *${botname2} desarrollado por Diamond* ❨◣_◢❩凸`;

const buttonMessage: any = {
  caption: menu,
  footer: '⊹⏤͟͟͞͞Tһᥱ ᗪіᥲm᥆ᥒძ ᑭr᥆ȷᥱᥴ𝗍 ❨◣_◢❩凸',
  buttons: [
    {
      text: 'ᐯᥱr ᥴᥲ𝗍ᥱg᥆rі́ᥲs',
      sections, // el array de secciones que ya armaste arriba
    },
  ],
  contextInfo: {
    mentionedJid: [
      ...(owner ? [owner] : []),
      m.sender,
      ...[...menu.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net'),
    ],
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: canalId,
      serverMessageId: '0',
      newsletterName: canalName,
    },
  },
};

if (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm')) {
  buttonMessage.video = { url: banner };
  buttonMessage.gifPlayback = true;
} else {
  buttonMessage.image = { url: banner };
}

await sock.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (e: any) {
      await m.reply(e?.message || String(e));
    }
  },
};

function formatearMs(ms: number): string {
  const segundos = Math.floor(ms / 1000);
  const minutos  = Math.floor(segundos / 60);
  const horas    = Math.floor(minutos / 60);
  const dias     = Math.floor(horas / 24);
  return [
    dias && `${dias}d`,
    `${horas % 24}h`,
    `${minutos % 60}m`,
    `${segundos % 60}s`,
  ].filter(Boolean).join(' ');
}