import db from '../lib/database.js';
const xpperestrellas = 150;

const handler = async (m, { conn, command, args, text, isOwner, usedPrefix }) => {
  let type = command.startsWith('rentar') ? 'buy' : 'use';

  if (type === 'buy') {
    let count = command.replace(/^rentar/i, '');
    count = count 
      ? /all/i.test(count) 
        ? Math.floor(global.db.data.users[m.sender].estrellas / xpperestrellas)
        : parseInt(count) 
      : args[0] 
        ? parseInt(args[0]) 
        : 1;
        
    const minutesPerToken = 5;
    count = Math.max(1, count);

    if (global.db.data.users[m.sender].estrellas >= xpperestrellas * count) {
      let discount = count >= 12 ? 0.9 : 1;
      let finalCost = Math.floor(xpperestrellas * count * discount);

      global.db.data.users[m.sender].estrellas -= finalCost;
      global.db.data.users[m.sender].premium += count;
      global.db.data.users[m.sender].tokens = (global.db.data.users[m.sender].tokens || 0) + Math.floor(count / minutesPerToken);

      conn.reply(m.chat, 
*┌─『 𝑅𝑒𝑛𝑡𝑎𝑟 𝑎 𝑀𝑒𝑔𝑢𝑚𝑖𝑛 』*
*├Compra nominal* : + ${Math.floor(count / minutesPerToken)} Token(s)
*├Gastado* : -${finalCost} ⭐ Estrellas (con descuento: ${discount * 100}%)
*├Utiliza* : .rentar2 + el link
*└──────────────*, m);
    } else {
      conn.reply(m.chat, ❎ Lo siento, no tienes suficientes *⭐ Estrellas* para comprar *${Math.floor(count / minutesPerToken)}* Token(s), m);
    }

  } else if (type === 'use') {

    let linkRegex = /chat.whatsapp.com/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i;
    if (!text) return m.reply(> _📝 Ingresa el link del grupo para unirme durante el tiempo que has rentado._);
    
    let [_, code, expired] = text.match(linkRegex) || [];
    if (!code) return m.reply('🚩 Enlace inválido. Asegúrate de que sea un enlace de grupo de WhatsApp.');

    let tokens = global.db.data.users[m.sender].tokens || 0;
    if (tokens <= 0) {
      return m.reply('❎ No tienes tokens comprados. Usa el comando !rentar para comprar un Token.');
    }

    let res;
    try {
      res = await conn.groupAcceptInvite(code);
    } catch (e) {
      return m.reply('⚠️ Error al unirse al grupo. Asegúrate de que el enlace sea válido.');
    }

    expired = Math.min(999, Math.max(1, isOwner ? isNumber(expired) ? parseInt(expired) : 0 : tokens * minutesPerToken));

    global.db.data.users[m.sender].tokens -= Math.ceil(expired / minutesPerToken);

    m.reply(> _📝 Me uní correctamente al grupo_ *${res}* durante *${expired}* minuto(s).);
    
    let chats = global.db.data.chats[res];
    if (!chats) chats = global.db.data.chats[res] = {};
    chats.expired = +new Date() + expired * 1000 * 60;

    setTimeout(() => {
      conn.sendMessage(res, { text: '⏳ Mi tiempo en el grupo está por expirar, compra más tokens si quieres que me quede más tiempo.' });
    }, (expired - 1) * 60 * 1000);

    let pp = 'https://telegra.ph/file/32e696946433c03588726.mp4';
    await conn.sendMessage(res, { video: { url: pp }, gifPlayback: true, caption: '> ¡Ya llegué perras! :D', mentions: [m.sender] }, { quoted: m });
  }
};

const isNumber = (x) => (x = parseInt(x), typeof x === 'number' && !isNaN(x));

handler.help = ['rentar', 'rentar2'];
handler.tags = ['xp', 'grupo'];
handler.command = ['rentar', 'rentarbot', 'rentar2'];
handler.disabled = false;

export default handler;