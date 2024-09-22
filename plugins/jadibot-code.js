const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageRetryMap, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys');
import moment from 'moment-timezone';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from "qrcode";
import crypto from 'crypto';
import fs from "fs";
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws;
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';
if (!(global.conns instanceof Array)) global.conns = [];
let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner, isROwner }) => {
if (!global.db.data.settings[_conn.user.jid].jadibotmd && !isROwner) {
conn.reply(m.chat, '🚩 Este Comando está deshabilitado por mi creador.', m, rcanal)
return
}
let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn;
if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
return conn.reply(m.chat, `「💭」Solo puedes usar este comando en el bot principal.\n\n• Wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`, m, rcanal)
}
async function serbot() {
let authFolderB = crypto.randomBytes(10).toString('hex').slice(0, 8);
if (!fs.existsSync(`./${jadi}/` + authFolderB)) {
fs.mkdirSync(`./${jadi}/` + authFolderB, { recursive: true });
}
if (args[0]) {
fs.writeFileSync(`${jadi}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'))
}
const { state, saveState, saveCreds } = await useMultiFileAuthState(`./MeguminJadiBot/${authFolderB}`);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = m.sender.split('@')[0];
const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));
const connectionOptions = {logger: pino({ level: 'silent' }),printQRInTerminal: false,mobile: MethodMobile,browser: ['Ubuntu', 'Edge', '110.0.1587.56'], 
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid);
let msg = await store.loadMessage(jid, clave.id);
return msg?.message || "";
},
msgRetryCounterCache,
msgRetryCounterMap,
defaultQueryTimeoutMs: undefined,
version
};
let conn = makeWASocket(connectionOptions);
if (methodCode && !conn.authState.creds.registered) {
if (!phoneNumber) {
process.exit(0);
}
let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
process.exit(0);
}
setTimeout(async () => {
let codeBot = await conn.requestPairingCode(cleanedNumber);
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
let txt = '╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮\n│🔥 *S E R B O T - S U B B O T* 🔥\n├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴\n│ *𝑈𝑠𝑎 𝑒𝑠𝑡𝑒 𝐶ó𝑑𝑖𝑔𝑜 𝑝𝑎𝑟𝑎 𝑐𝑜𝑛𝑣𝑒𝑟𝑡𝑖𝑟𝑡𝑒 𝑒𝑛 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│💥 𝑷𝒂𝒔𝒐𝒔:\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴\n│ `3` : 𝑆𝑒𝑙𝑒𝑐𝑐𝑖𝑜𝑛𝑎 𝑉𝑖𝑛𝑐𝑢𝑙𝑎𝑟 𝑐𝑜𝑛 𝑒𝑙 𝑛ú𝑚𝑒𝑟𝑜 𝑑𝑒 𝑡𝑒𝑙é𝑓𝑜𝑛𝑜\n├╶╴╶╴╶╴╶╴╶╴\n│ `4` : 𝐸𝑠𝑐𝑟𝑖𝑏𝑎 𝑒𝑙 𝐶𝑜𝑑𝑖𝑔𝑜\n├╶╴╶╴╶╴╶╴\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝑪ó𝒅𝒊𝒈𝒐 𝒔𝒐𝒍𝒐 𝒇𝒖𝒏𝒄𝒊𝒐𝒏𝒂 𝒆𝒏 𝒆𝒍 𝒏ú𝒎𝒆𝒓𝒐 𝒒𝒖𝒆 𝒍𝒐 𝒔𝒐𝒍𝒊𝒄𝒊𝒕𝒐.\n╰━╴╶╴╶╴╶╴ꗰ╶╴╶╴╶╴╶━╯';
await parent.reply(m.chat, txt, m, rcanal);
await parent.reply(m.chat, codeBot, m, rcanal);
rl.close();
}, 3000);
}
conn.isInit = false;
let isInit = true;
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update;
if (isNewLogin) conn.isInit = true;
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
let i = global.conns.indexOf(conn);
if (i < 0) return console.log(await creloadHandler(true).catch(console.error));
delete global.conns[i];
global.conns.splice(i, 1);
if (code !== DisconnectReason.connectionClosed) { parent.sendMessage(m.chat, { text: "🚩 Conexión perdida con el servidor." }, { quoted: m });
}}
if (global.db.data == null) loadDatabase();
if (connection == 'open') {
conn.isInit = true;
global.conns.push(conn);
await parent.reply(m.chat, args[0] ? '🐢 Conectado con éxito al WhatsApp.' : '🚩 Vinculaste un Sub-Bot con éxito.', m, rcanal);
await sleep(5000);
if (args[0]) return;
await parentw.reply(conn.user.jid, `🚩 *Para volver a vincular un sub Bot use su token`, m, rcanal)
}}
setInterval(async () => {
if (!conn.user) {
try { conn.ws.close(); } catch { }conn.ev.removeAllListeners();
let i = global.conns.indexOf(conn);
if (i < 0) return;
delete global.conns[i];
global.conns.splice(i, 1);
}
}, 60000);
let handler = await import('../handler.js');
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler;
} catch (e) {
console.error(e);
}
if (restatConn) {
try { conn.ws.close(); } catch { }
conn.ev.removeAllListeners();
conn = makeWASocket(connectionOptions);
isInit = true;
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler);
conn.ev.off('connection.update', conn.connectionUpdate);
conn.ev.off('creds.update', conn.credsUpdate);
} 
conn.handler = handler.handler.bind(conn);
conn.connectionUpdate = connectionUpdate.bind(conn);
conn.credsUpdate = saveCreds.bind(conn, true);
conn.ev.on('messages.upsert', conn.handler);
conn.ev.on('connection.update', conn.connectionUpdate);
conn.ev.on('creds.update', conn.credsUpdate);
isInit = false;
return true;
};
creloadHandler(false);
}
serbot();
};
handler.help = ['code'];
handler.tags = ['jadibot'];
handler.command = ['code'];
// handler.register = true;
export default handler;
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}