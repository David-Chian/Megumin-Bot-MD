let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/]*)?)\b/i
export async function before(m, {isAdmin, isBotAdmin, text}) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  const chat = global.db.data.chats[m.chat];
  const delet = m.key.participant;
  const bang = m.key.id;
  const bot = global.db.data.settings[this.user.jid] || {};
  const user = `@${m.sender.split`@`[0]}`;
  const isGroupLink = linkRegex.exec(m.text);
  if (chat.antiLink2 && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`
      const linkThisGroup2 = `https://www.youtube.com/`;
      const linkThisGroup3 = `https://youtu.be/`;
      if (m.text.includes(linkThisGroup)) return !0;
      if (m.text.includes(linkThisGroup2)) return !0;
      if (m.text.includes(linkThisGroup3)) return !0;
    }
    await this.sendMessage(m.chat, {text: `*「 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊𝐒 」*\n𝐍𝐮𝐧𝐜𝐚 𝐚𝐩𝐫𝐞𝐧𝐝𝐞𝐧 🙄 ${user} 𝐀𝐬 𝐫𝐨𝐭𝐨 𝐥𝐚𝐬 𝐫𝐞𝐠𝐥𝐚𝐬 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨, 𝐬𝐞𝐫𝐚𝐬 𝐞𝐱𝐩𝐮𝐥𝐬𝐚𝐝𝐨/𝐚...!!`, mentions: [m.sender]}, {quoted: m});
    if (!isBotAdmin) return m.reply('[🚫] 𝐍𝐨 𝐬𝐨𝐲 𝐚𝐝𝐦𝐢𝐧 ! 𝐩𝐨𝐫 𝐭𝐚𝐧𝐭𝐨 𝐧𝐨 𝐩𝐮𝐞𝐝𝐨 𝐞𝐣𝐞𝐜𝐮𝐭𝐚𝐫 𝐥𝐚 𝐚𝐜𝐜𝐢𝐨𝐧 𝐝𝐞 𝐞𝐱𝐩𝐮𝐥𝐬𝐚𝐫');
    // await conn.sendButton(m.chat, `*「 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊𝐒 」*\n𝐍𝐮𝐧𝐜𝐚 𝐚𝐩𝐫𝐞𝐧𝐝𝐞𝐧 🙄, ${await this.getName(m.sender) 𝐀𝐬 𝐫𝐨𝐭𝐨 𝐥𝐚𝐬 𝐫𝐞𝐠𝐥𝐚𝐬 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨, 𝐬𝐞𝐫𝐚𝐬 𝐞𝐱𝐩𝐮𝐥𝐬𝐚𝐝𝐨/𝐚...!!*${isBotAdmin ? '' : '\n\n*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝙴𝚂 𝙰𝙳𝙼𝙸𝙽, 𝙽𝙾 𝙿𝚄𝙴𝙳𝙴 𝙴𝚇𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝚁 𝙰 𝙻𝙰𝚂 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝚂*'}`, author, ['𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝚁 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺𝚂', '/disable antilink'], m)
    if (isBotAdmin && bot.restrict) {
      await conn.sendMessage(m.chat, {delete: {remoteJid: m.chat, fromMe: false, id: bang, participant: delet}});
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    } else if (!bot.restrict) return m.reply('*[🚫] 𝐄𝐥 𝐎𝐰𝐧𝐞𝐫 𝐧𝐨 𝐭𝐢𝐞𝐧𝐞 𝐚𝐜𝐭𝐢𝐯𝐚 𝐥𝐚 𝐨𝐩𝐜𝐢𝐨́𝐧 𝐝𝐞 𝐫𝐞𝐬𝐭𝐫𝐢𝐧𝐠𝐢𝐫, 𝐍𝐨 𝐩𝐮𝐞𝐝𝐨 𝐞𝐣𝐞𝐜𝐮𝐭𝐚𝐫 𝐥𝐚 𝐚𝐜𝐜𝐢𝐨́𝐧');
  }
  return !0;
}