import { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import fs from 'fs'
import pino from 'pino'
import crypto from 'crypto'
import NodeCache from 'node-cache'
import { makeWASocket } from '../lib/simple.js'
if (global.conns instanceof Array) {
console.log()
} else {
global.conns = []
}
let handler = async (m, { conn, args, usedPrefix, command, isOwner, isPrems, isROwner }) => {
if (!global.db.data.settings[conn.user.jid].jadibotmd && !isROwner) {
conn.reply(m.chat, '🚩 Este Comando está deshabilitado por mi creador.', m, rcanal)
return
}
let parentw = args[0] && args[0] == "plz" ? conn : await global.conn
if (!(args[0] && args[0] == 'plz' || (await global.conn).user.jid == conn.user.jid)) {
return conn.reply(m.chat, `「💭」Solo puedes usar este comando en el bot principal.\n\n• Wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`, m, rcanal)
}
async function serbot() {
let serbotFolder = crypto.randomBytes(10).toString('hex').slice(0, 8)
let folderSub = `./${jadi}/${serbotFolder}`
if (!fs.existsSync(folderSub)) {
fs.mkdirSync(folderSub, { recursive: true })
}
if (args[0]) {
fs.writeFileSync(`${folderSub}/creds.json`, Buffer.from(args[0], 'base64').toString('utf-8'))
}
const { state, saveCreds } = await useMultiFileAuthState(folderSub)
const msgRetryCounterCache = new NodeCache()
const { version } = await fetchLatestBaileysVersion()
const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: true,
browser: [`${nameqr}`, 'Edge', '2.0.0'],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache,
version
}
let conn = makeWASocket(connectionOptions)
conn.isInit = false
let isInit = true
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) {
conn.isInit = true
}
if (qr) {
let txt = '╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮\n│🔥 *S E R B O T - S U B B O T* 🔥\n├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴\n│ *𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅 𝑝𝑎𝑟𝑎 𝑠𝑒𝑟 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│💥 𝑷𝒂𝒔𝒐𝒔 𝒑𝒂𝒓𝒂 𝒆𝒔𝒄𝒂𝒏𝒆𝒂𝒓:\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴\n│ `3` : 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅\n├╶╴╶╴╶╴╶╴╶╴\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝒄ó𝒅𝒊𝒈𝒐 𝑸𝑹 𝒆𝒙𝒑𝒊𝒓𝒂 𝒆𝒏 30 𝒔𝒆𝒈𝒖𝒏𝒅𝒐𝒔.\n╰━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╯'

let sendQR = await parentw.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), "qrcode.png", txt, m, null, rcanal)
setTimeout(() => {
parentw.sendMessage(m.chat, { delete: sendQR.key })
}, 30000)
}
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
let i = global.conns.indexOf(conn)
if (i < 0) {
return console.log(await creloadHandler(true).catch(console.error))
}
delete global.conns[i]
global.conns.splice(i, 1)
if (code !== DisconnectReason.connectionClosed) {
await parentw.reply(conn.user.jid, "🚩 Conexión perdida con el servidor.", m)
}
}
if (global.db.data == null) {
loadDatabase()
}
if (connection == "open") {
conn.isInit = true
global.conns.push(conn)
await parentw.reply(m.chat, args[0] ? '🐢 Conectado con éxito al WhatsApp.' : '🚩 Vinculaste un Sub-Bot con éxito.', m, rcanal)
await sleep(5000)
if (args[0]) {
return
}
await parentw.reply(conn.user.jid, `🚩 *Para volver a vincular un sub Bot use su token*`, m, rcanal)
}
}
const timeoutId = setTimeout(() => {
if (!conn.user) {
try {
conn.ws.close()
} catch {}
conn.ev.removeAllListeners()
let i = global.conns.indexOf(conn)
if (i >= 0) {
delete global.conns[i]
global.conns.splice(i, 1)
}
fs.rmdirSync(`./${jadi}/${serbotFolder}`, { recursive: true })
}
}, 30000)
let handler = await import("../handler.js")
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) {
handler = Handler
}
} catch (e) {
console.error(e)
}
if (restatConn) {
try {
conn.ws.close()
} catch {}
conn.ev.removeAllListeners()
conn = makeWASocket(connectionOptions)
isInit = true
}
if (!isInit) {
conn.ev.off("messages.upsert", conn.handler)
conn.ev.off("connection.update", conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
} 
conn.handler = handler.handler.bind(conn)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds.bind(conn, true)
conn.ev.on("messages.upsert", conn.handler)
conn.ev.on("connection.update", conn.connectionUpdate)
conn.ev.on("creds.update", conn.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}
serbot()
}
handler.help = ["serbot"]
handler.tags = ["jadibot"]
handler.command = ["serbot", "jadibot", "qr", "botclone"]
 handler.register = true
export default handler
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms))
}