const handler = async (m, {conn, participants, groupMetadata}) => {
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch((_) => global.icons);
  const {antiToxic, autoRechazar, autoAceptar, welcome, detect, antiLink, modohorny, primaryBot} = global.db.data.chats[m.chat];
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
  const primary = primaryBot ? `@${primaryBot.split('@')[0]}` : 'Aleatorio'
  try {
  const text = `💥 *INFO GRUPO*
💌 *ID:*
→ ${groupMetadata.id}
🥷 *Nombre:*
→ ${groupMetadata.subject}
🌟 *Descripción:*
→ Leelo puta (￣へ ￣ 凸
💫 *Miembros:*
→ ${participants.length} Participantes
👑 *Creador del Grupo:*
→ @${owner.split('@')[0]}
💣 *Bot primario:*
→ ${primary}
🏆 *Administradores:*
${listAdmin}

💭 *CONFIGURACIÓN*

◈ *Welcome:* ${welcome ? 'Activado' : 'Desactivado'}
◈ *Detect:* ${detect ? 'Activado' : 'Desactivado'}  
◈ *Antilink:* ${antiLink ? 'Activado' : 'Desactivado'} 
◈ *Autoaceptar:* ${autoAceptar ? 'Activado' : 'Desactivado'}
◈ *Autorechazar:* ${autoRechazar ? 'Activado' : 'Desactivado'}
◈ *Modohorny:* ${modohorny ? 'Activado' : 'Desactivado'}
`.trim();
  conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner, peimary]});
  } catch (e) {
    return m.reply(`Ocurrió un error inesperado\n\n> ${e}`);
}};
handler.help = ['infogrupo'];
handler.tags = ['grupo'];
handler.command = ['infogrupo', 'gp'];
handler.register = true
handler.group = true;
export default handler;