import ws from 'ws'

const handler = async (m, {conn, participants, groupMetadata}) => {
try {
       const pp = await conn.profilePictureUrl(m.chat, 'image');
    const {antiToxic, reaction, antiTraba, antidelete, antiviewonce, welcome, detect, antiLink, primaryBot, antiLink2, modohorny, antiBot, autosticker, audios} = global.db.data.chats[m.chat];
    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net';
    const botprimary = primaryBot ? `@${primaryBot.split('@')[0]}` : 'Aleatorio';

    const groupParticipants = groupMetadata.participants.map(p => p.id);
    const subBots = globalThis.conns
        .filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
        .filter((conn) => groupParticipants.includes(conn.user.jid))
        .map((conn) => ({ jid: conn.user.jid }));

    const mainBotJid = globalThis.conn.user.jid;

    let text = `💥 *INFO GRUPO*
💌 *ID:*
→ ${groupMetadata.id}
🥷 *Nombre:*
→ ${groupMetadata.subject}
🌟 *Descripción:*
→ Leelo puta (￣へ ￣ 凸
🚩 *Bot Principal:* 
→ ${botprimary}
💫 *Miembros:*
→ ${participants.length} Participantes
👑 *Creador del Grupo:*
→ @${owner.split('@')[0]}
🏆 *Administradores:*
${listAdmin}

💭 *CONFIGURACIÓN*

◈ *Welcome:* ${welcome ? '✅' : '❌'}
◈ *Detect:* ${detect ? '✅' : '❌'}  
◈ *Antilink:* ${antiLink ? '✅' : '❌'} 
◈ *Antilink 𝟸:* ${antiLink2 ? '✅' : '❌'} 
◈ *Autosticker:* ${autosticker ? '✅' : '❌'} 
◈ *Nsfw:* ${modohorny ? '✅' : '❌'}
◈ *Anti Bot:* ${antiBot ? '✅' : '❌'} 
◈ *Audios:* ${audios ? '✅' : '❌'} 
◈ *Antiver:* ${antiviewonce ? '✅' : '❌'} 
◈ *Reacción:* ${reaction ? "✅️" : "❌️"}
◈ *Delete:* ${antidelete ? '✅' : '❌'} 
◈ *Antitoxic:* ${antiToxic ? '✅' : '❌'} 
◈ *Antitraba:* ${antiTraba ? '✅' : '❌'} 

➪ *Bots en el grupo ›* ${subBots.length + 1}
> @${mainBotJid.split('@')[0]} *[Principal]*`;

    subBots.forEach((subBot, index) => {
        text += `\n> @${subBot.jid.split('@')[0]} [Sub-Bot]`;
    });

    await conn.sendFile(m.chat, pp, 'img.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner, primaryBot, ...subBots.map((sb) => sb.jid)]});
  } catch (e) {
    return m.reply(`Ocurrió un error inesperado\n\n> ${e}`);
}};
handler.help = ['infogrupo'];
handler.tags = ['grupo'];
handler.command = ['infogrupo', 'gp'];
handler.register = true
handler.group = true;
export default handler;