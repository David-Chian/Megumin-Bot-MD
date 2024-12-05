import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';

const jadi = 'MeguminJadiBot';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
    const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
    const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command);
    const isCommand3 = /^(bots|listjadibots|subbots)$/i.test(command);

    async function reportError(e) {
        await m.reply(`❌️ Ocurrió un error.`);
        console.log(e);
    }

    switch (true) {
        case isCommand1:
            let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
            let uniqid = `${mentionedJid.split`@`[0]}`;
            const path = `./${jadi}/${uniqid}`;

            if (!await fs.existsSync(path)) {
                await conn.sendMessage(m.chat, { text: `💥 Usted no tiene una sesión, puede crear una usando:\n${usedPrefix + command}\n\nSi tiene una *(ID)* puede usar para saltarse el paso anterior usando:\n*${usedPrefix + command}* \`\`\`(ID)\`\`\`` }, { quoted: m });
                return;
            }
            if (global.conn.user.jid !== conn.user.jid) return conn.sendMessage(m.chat, { text: `💥 Use este comando al *Bot* principal.\n\n*https://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0*` }, { quoted: m });
            else {
                await conn.sendMessage(m.chat, { text: `💫 Tu sesión como *Sub-Bot* se ha eliminado` }, { quoted: m });
            }
            try {
                fs.rmdir(`./${jadi}/` + uniqid, { recursive: true, force: true });
                await conn.sendMessage(m.chat, { text: `Ha cerrado sesión y borrado todo rastro.` }, { quoted: m });
            } catch (e) {
                reportError(e);
            }
            break;

        case isCommand2:
            if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `💥 Si no es *SubBot* comuníquese al numero principal del *Bot* para ser *SubBot*`, m);
            else {
                await conn.reply(m.chat, `💥 Megumin desactivada.`, m);
                conn.ws.close();
            }
            break;

        case isCommand3:
            let totalSessions = 0;
            if (fs.existsSync(jadi)) {
                const files = fs.readdirSync(jadi);
                totalSessions = files.length;
            }
            const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
            const message = users.map((v, index) => `• 「 ${index + 1} 」\n✐ Usuario: ${v.user.name || 'Sub-Bot'}\n @${v.user.jid.replace(/[^0-9]/g, '')}`).join('\n\n__________________________\n\n');
            const replyMessage = message.length === 0 ? `` : message;
            const totalUsers = users.length;
            const responseMessage = `「✦」Lista de bots activos (*${totalSessions}*)\n\n✐ Sesiones: ${totalSessions}\n✧ Sockets: ${totalUsers || '0'}\n\n${replyMessage.trim()}`.trim();
            await _envio.sendMessage(m.chat, { text: responseMessage, mentions: _envio.parseMention(responseMessage) }, { quoted: m });
            break;
    }
};

handler.command = ['deletesesion', 'deletebot', 'deletesession', 'deletesesaion', 'stop', 'pausarai', 'pausarbot', 'bots', 'listjadibots', 'subbots'];
export default handler;