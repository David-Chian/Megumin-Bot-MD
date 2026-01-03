import fetch from 'node-fetch'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
import { commands } from '../../lib/commands.js'

export default {
  command: ['menu', 'help'],
  category: 'info',
  run: async ({client, m, text, args, usedPrefix}) => {
  try {
  
    const cmdsList = commands
    let now = new Date()
    let colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    let tiempo = colombianTime.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric', 
    }).replace(/,/g, '')

    let tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

    let plugins = commands.length

    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    let botSettings = global.db.data.settings[botId]
    let botname = botSettings.namebot
    let botname2 = botSettings.namebot2
    let banner = botSettings.banner
    const owner = botSettings.owner
    const canalId = botSettings.id
    const canalName = botSettings.nameid
    const link = botSettings.link
    let desar = "Oculto";
    if (owner && !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
      const userData = global.db.data.users[owner];
      desar = userData?.genre || "Oculto";
     }
    let isOficialBot = botId === botId

    let botType = isOficialBot ? 'Principal' : 'Sub-Bot'

const jam = moment.tz('America/Bogota').locale('id').format('HH:mm:ss')
const ucapan = jam < '05:00:00' ? 'Buen día' : jam < '11:00:00' ? 'Buen día' : jam < '15:00:00' ? 'Buenas tardes' : jam < '18:00:00' ? 'Buenas tardes' : jam < '19:00:00' ? 'Buenas tardes' : jam < '23:59:00' ? 'Buenas noches' : 'Buenas noches';

let menu = `\n\n`
menu += `....․⁀⸱⁀⸱︵⸌⸃૰⳹․💥․⳼૰⸂⸍︵⸱⁀⸱⁀․....\n`
menu += `𔓕꯭ ꯭ 𓏲꯭֟፝੭ ꯭⌑𝐄꯭𝐗꯭𝐏꯭𝐋꯭𝐎꯭𝐒꯭𝐈𝐎꯭𝐍꯭⌑꯭ 𓏲꯭֟፝੭꯭  ꯭𔓕\n`
menu += `▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬͞▭͞▬\n`
menu += `> ${ucapan}  *${m.pushName ? m.pushName : 'Sin nombre'}*\n\n`
menu += `.   ╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🍨⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
menu += `. ☁️⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪ 🄼🄴🄽🅄-🄱🄾🅃໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
menu += `֪࣪   ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🍧⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *${desar === 'Hombre' ? 'Creador' : desar === 'Mujer' ? 'Creadora' : 'Creador(a)'} ›* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "Oculto por privacidad"}\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Plugins ›* ${plugins}\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Versión ›* ^3.0.0 ⋆. 𐙚 ˚\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Link ›* ${link}\n\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Fecha ›* ${tiempo}, ${tiempo2}\n`
menu += `ׅㅤ𓏸𓈒ㅤׄ *Users ›* ${Object.keys(global.db.data.users).length.toLocaleString()} ฅ(ᯫ᳐ꔷ⩊ꔷ˶ᯫ᳐)\n`
menu += `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n`

    const categoryArg = args[0]?.toLowerCase();
    const categories = {};

    for (const command of cmdsList) {
      const category = command.category || 'otros';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(command);
    }

if (categoryArg && !categories[categoryArg]) {
  return m.reply(`「✎」La categoría *${categoryArg}* no fue encontrada.\n\nCategorías disponibles:\n${Object.keys(categories).map(c => `「${c}」`).join('\n')}`);
}

    if (categoryArg && !categories[categoryArg]) {
      return m.reply(`「✎」La categoría *${categoryArg}* no encontrada.`);
    }

    for (const [category, cmds] of Object.entries(categories)) {
      if (categoryArg && category.toLowerCase() !== categoryArg) {
        continue;
      }
      const catName = category.charAt(0).toUpperCase() + category.slice(1)
      menu += `\n.    ╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🔥⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n.   ☁️⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪ *${catName}* ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪☁️ׅ\n֪࣪    ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🔥⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
      cmds.forEach(cmd => {
      const match = usedPrefix.match(/[#\/+.!-]$/);
const separator = match ? match[0] : '';
      const cleanPrefix = separator ? separator : usedPrefix;
      const aliases = cmd.alias.map(a => {
  const aliasClean = a.split(/[\/#!+.\-]+/).pop().toLowerCase();
      return `${cleanPrefix}${aliasClean}`}).join(' › ');
        menu += `֯　ׅ🫟ֶ֟፝֯ㅤ *${aliases}* ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
        menu += `> _*${cmd.desc}*_\n\n`;
      });
    }

 await client.sendMessage(m.chat, {
document: await (await fetch(banner)).buffer(),
fileName: '^3.0.0 | Lastest 🥧',
mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
fileLength: '0',
pageCount: '1',
caption: menu.trim(),
contextInfo: {
mentionedJid: [owner],
forwardingScore: 0,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: canalId,
serverMessageId: null,
newsletterName: canalName
},
externalAdReply: {
title: botname,
body: `${botname2}, Built With Megumin Bot`, 
showAdAttribution: false,
thumbnailUrl: banner,
mediaType: 1,
previewType: 0,
renderLargerThumbnail: true,
mediaUrl: null,
sourceUrl: null,
}
}}, { quoted: m })

  } catch (e) {
    await m.reply(`${msgglobal + e}`)
  }
}}