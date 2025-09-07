let WAMessageStubType = (await import('@whiskeysockets/baileys')).default;
import fetch from 'node-fetch';

async function getUserName(conn, id) {
  try {
    const jid = id.includes('@') ? id : id + '@s.whatsapp.net';

    const user = global.db.data.users[jid];
    if (user && typeof user.name === 'string' && user.name.trim() && !/undef|undefined|null|nan/i.test(user.name)) {
      return user.name.trim();
    }
    const contactName = await conn.getName(jid);
    if (contactName) return contactName;

    return jid.split('@')[0];
  } catch {
    return id.split('@')[0];
  }
}

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  // Usa /tourl sobre una imagen para hacerla url y ponerla aquí si deseas cambiar dichas imágenes.
  let imgWelcome = 'https://files.catbox.moe/vnw5j7.jpg';
  let imgBye = 'https://files.catbox.moe/9bcdi3.jpg';

  let chat = global.db.data.chats[m.chat];
  const getMentionedJid = () => {
    return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`);
  };

  let who = m.messageStubParameters[0];
  let userName = await getUserName(conn, who);

  let total = groupMetadata.participants.length;

  if (chat.welcome && m.messageStubType === 27) {
    await conn.sendMessage(m.chat, {
      image: { url: imgWelcome },
      caption: `
╭────┈┈────╮
│ ✨ *ＢＩＥＮＶＥＮＩＤＯ* ✨
╰──┈┈──╯

🎉 Usuario: *@${who.split('@')[0]}*
👤 Nombre: *${userName}*
👥 Ahora somos: *${total}* participantes  

Disfruta tu estancia 🚀
      `.trim(),
      mentions: getMentionedJid()
    }, { quoted: fkontak });
  }

  if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
    await conn.sendMessage(m.chat, {
      image: { url: imgBye },
      caption: `
╭────┈┈────╮
│ 💔 *ＤＥＳＰＥＤＩＤＡ* 💔
╰───┈┈───╯

😢 Usuario: *@${who.split('@')[0]}*
👤 Nombre: *${userName}*
👥 Ahora somos: *${total}* participantes  

¡Esperamos verte pronto! 🌹
      `.trim(),
      mentions: getMentionedJid()
    }, { quoted: fkontak });
  }
}