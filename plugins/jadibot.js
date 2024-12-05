import fs from 'fs';
import ws from 'ws';
const path = './MeguminJadiBot'; 

let handler = async (m, { conn }) => {
    let sesiones = {
        principales: [],
        premiums: [], 
        subs: [] 
    };

    let totalSessions = 0;
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path);
        totalSessions = files.length;
        files.forEach(file => {
            if (file.startsWith('bot_principal')) {
                sesiones.principales.push(file.replace('.json', ''));
            } else if (file.startsWith('bot_premium')) {
                sesiones.premiums.push(file.replace('.json', ''));
            } else {
                sesiones.subs.push(file.replace('.json', ''));
            }
        });
    }

    const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
    const totalUsers = users.length;

    const message = users.map((v, index) => `• 「 ${index + 1} 」\n✐ Usuario: ${v.user.name || 'Sub-Bot'}\n @${v.user.jid.replace(/[^0-9]/g, '')}`).join('\n\n__________________________\n\n');
    const replyMessage = message.length === 0 ? `` : message;
    const mentions = users.map(v => v.user.jid);
    const responseMessage = `「✦」Lista de bots activos (*${totalSessions}*)\n\n✐ Sesiones: ${totalSessions}\n✧ Sockets: ${totalUsers || '0'}\n\n${replyMessage.trim()}`.trim();

    await conn.sendMessage(m.chat, { text: responseMessage, mentions: mentions }, { quoted: m });
};

handler.help = ['bots'];
handler.tags = ['info'];
handler.command = ['bots', 'listabots', 'subbots'];

export default handler;