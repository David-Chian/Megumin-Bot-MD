import db from '../lib/database.js';
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i;

let handler = async (m, { conn, text, isOwner }) => {
  if (!text) return m.reply(`> _📝 Ingresa el link del grupo para rentar el bot._`);

  let [_, code] = text.match(linkRegex) || [];
  if (!code) return m.reply('🚩 Enlace inválido.');

  let groupId = await conn.groupAcceptInvite(code);
 
  let groupData = global.db.data.groupRents[m.sender]; 

  if (!groupData || Date.now() >= (groupData.startTime + groupData.duration)) {
    return m.reply('❎ No tienes tokens disponibles para rentar el bot en este grupo. Compra más tokens con /rentar.');
  }

  conn.reply(m.chat, `> _📝 Me uní correctamente al grupo_ *${groupId}* por ${groupData.tokenCount} día(s).`);
 
  let chats = global.db.data.chats[groupId];
  if (!chats) chats = global.db.data.chats[groupId] = {};
  
  if (groupData.duration) chats.expired = groupData.startTime + groupData.duration;
  
  let pp = 'https://telegra.ph/file/bdfed459dae8ec29d7e42.mp4';
  await conn.sendMessage(groupId, { video: { url: pp }, gifPlayback: true, caption: '> ¡Ya llegué! El bot estará disponible por el tiempo acordado.', mentions: [m.sender] });
};

handler.help = ['rentar2 *<link>*'];
handler.command = ['rentar2'];

export default handler;