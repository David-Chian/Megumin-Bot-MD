/*⚠ PROHIBIDO EDITAR ⚠

Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion

El codigo de este archivo esta inspirado en el codigo original de:
- Aiden_NotLogic >> https://github.com/ferhacks

*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*

El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino

Contenido adaptado para GataBot-MD por:
- GataNina-Li >> https://github.com/GataNina-Li
- elrebelde21 >> https://github.com/elrebelde21
*/

const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import { unlinkSync } from 'fs'
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮*\n*│🔥 S E R B O T - S U B B O T 🔥*\n*├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴*\n*│ 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅 𝑝𝑎𝑟𝑎 𝑠𝑒𝑟 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│💥 𝑷𝒂𝒔𝒐𝒔 𝒑𝒂𝒓𝒂 𝒆𝒔𝒄𝒂𝒏𝒆𝒂𝒓:*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `3` : 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅*\n*├╶╴╶╴╶╴╶╴╶╴*\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝒄𝒐𝒅𝒊𝒈𝒐 𝑸𝑹 𝒆𝒙𝒑𝒊𝒓𝒂 𝒆𝒏 30 𝒔𝒆𝒈𝒖𝒏𝒅𝒐𝒔.\n*╰━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╯*"
let rtx2 = "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮*\n*│🔥 S E R B O T - S U B B O T 🔥*\n*├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴*\n*│ 𝑈𝑠𝑎 𝑒𝑠𝑡𝑒 𝐶ó𝑑𝑖𝑔𝑜 𝑝𝑎𝑟𝑎 𝑐𝑜𝑛𝑣𝑒𝑟𝑡𝑖𝑟𝑡𝑒 𝑒𝑛 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│💥 𝑷𝒂𝒔𝒐𝒔:*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `3` : 𝑆𝑒𝑙𝑒𝑐𝑐𝑖𝑜𝑛𝑎 𝑉𝑖𝑛𝑐𝑢𝑙𝑎𝑟 𝑐𝑜𝑛 𝑒𝑙 𝑛𝑢𝑚𝑒𝑟𝑜 𝑑𝑒 𝑡𝑒𝑙é𝑓𝑜𝑛𝑜*\n*├╶╴╶╴╶╴╶╴╶╴*\n*│ `4` : 𝐸𝑠𝑐𝑟𝑖𝑏𝑎 𝑒𝑙 𝐶𝑜𝑑𝑖𝑔𝑜*\n*├╶╴╶╴╶╴╶╴*\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝑪𝒐𝒅𝒊𝒈𝒐 𝒔𝒐𝒍𝒐 𝒇𝒖𝒏𝒄𝒊𝒐𝒏𝒂 𝒆𝒏 𝒆𝒍 𝒏𝒖𝒎𝒆𝒓𝒐 𝒒𝒖𝒆 𝒍𝒐 𝒔𝒐𝒍𝒊𝒄𝒊𝒕𝒐.\n*╰━╴╶╴╶╴╶╴ꗰ╶╴╶╴╶╴╶━╯*"

const meguminJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
let time = global.db.data.users[m.sender].Subs + 12000
if (new Date - global.db.data.users[m.sender].Subs < 12000) return conn.reply(m.chat, `🕝 Debes esperar ${msToTime(time - new Date())} para volver a intentar vincular un subbot.`, m)
if (Object.values(global.conns).length === 40) {
return m.reply('❤️‍🔥 no hay espacio disponible para sub- bots.')
}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`  //conn.getName(who)
let pathMeguminJadiBot = path.join(`./${jadi}/`, id)
if (!fs.existsSync(pathMeguminJadiBot)){
fs.mkdirSync(pathMeguminJadiBot, { recursive: true })
}
meguminJBOptions.pathMeguminJadiBot = pathMeguminJadiBot
meguminJBOptions.m = m
meguminJBOptions.conn = conn
meguminJBOptions.args = args
meguminJBOptions.usedPrefix = usedPrefix
meguminJBOptions.command = command
meguminJadiBot(meguminJBOptions, text)
global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.command = ['jadibot', 'serbot']
handler.help = ['serbot', 'serbot code']
handler.tags = ['socket']
export default handler 

export async function meguminJadiBot(options) {
let { pathMeguminJadiBot, m, conn, args, usedPrefix, text, command } = options
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
//let user = global.db.data.users[m.sender]
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathMeguminJadiBot, "creds.json")
if (!fs.existsSync(pathMeguminJadiBot)){
fs.mkdirSync(pathMeguminJadiBot, { recursive: true })}
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""

if (fs.existsSync(pathCreds)) {
    try{
        try{
            let creds = JSON.parse(fs.readFileSync(pathCreds))
            if(!creds){
                const files = fs.readdirSync(pathMeguminJadiBot);
                for(const o of files){
                    unlinkSync(pathMeguminJadiBot+'/'+o);
                }
                unlinkSync(pathMeguminJadiBot)
            }
        }catch{
            const files = fs.readdirSync(pathMeguminJadiBot);
            for(const o of files){
                unlinkSync(pathMeguminJadiBot+'/'+o);
            }
            unlinkSync(pathMeguminJadiBot)
            return;
        }
    }catch{ return console.log(chalk.green('[ BOT DELETE ]'))}
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)

let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathMeguminJadiBot)

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache, 
browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
version: version,
generateHighQualityLinkPreview: true
}

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
return
} 
if (qr && mcode) {
txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
await sleep(3000)
// let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
let fixTe = text ? text.replace(/\D/g, '') : m.sender.split('@')[0]
let secret = await sock.requestPairingCode((fixTe))
secret = secret.match(/.{1,4}/g)?.join("-")
codeBot = await m.reply(secret)}
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason == 405) {
fs.unlinkSync(pathCreds);
return await conn.sendMessage(m.chat, {text : `💫❤️‍🔥 Reenvia nuevamente el comando.` }, { quoted: null })
}
if (reason === DisconnectReason.restartRequired) {
await creloadHandler(true).catch(console.error)
return console.log(`\n🦋 Tiempo de la conexión agotado, reconectando...`);  
} else if (reason === DisconnectReason.loggedOut) {
sleep(4000)
if (m === null) return
return m.reply(`❤️‍🔥 Conexión cerrada, deberás conectarse nuevamente pidiendo el código QR o el código de 8 digitos, primero elimina la session actual usando: .deletebot`)
} else if (reason == 428) {
await endSesion(false)
if (m === null) return
return m.reply(`❤️‍🔥 La conexión se ha cerrado de manera inesperada, intentaremos reconectar...`)
} else if (reason === DisconnectReason.connectionLost) {
await creloadHandler(true).catch(console.error)
return console.log(`\n🦋 Conexión perdida con el servidor, reconectando...`); 
} else if (reason === DisconnectReason.badSession) {
if (m === null) return
return m.reply(`🦋 La conexión se ha cerrado, deberás conectarse manualmente.`)
} else if (reason === DisconnectReason.timedOut) {
await endSesion(false)
return console.log(`\n🦋 Tiempo de la conexión agotado, reconectando...`)
} else {
console.log( `\n💫 Razon de la desconexión desconocida: ${reason || ''} >> ${connection || ''}`);
}}
if (connection == `open`) {
if (global.db.data == null) global.loadDatabase()
let nameOrNumber = '[ UNDEFINED ]';
try{ conn.getName(`${path.basename(pathMeguminJadiBot)}@s.whatsapp.net`) }catch{}
const baseName = path.basename(pathMeguminJadiBot)
const displayName = nameOrNumber.replace(/\D/g, '') === baseName ? `+${baseName}` : `${nameOrNumber} (${baseName})`
console.log(chalk.bold.cyanBright(`\n${displayName} fué conectado correctamente.`))
sock.isInit = true
global.conns.push(sock)
await joinChannels(sock)
m?.chat? await conn.sendMessage(m.chat, { text: `❤️‍🔥 SubBot conectado correctamente.`, mentions: [m.sender]}, { quoted: m }) : ''
}
}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler

} catch (e) {
console.error(e)
}
if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
}

if (!isInit) {
sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
}

sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)
sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
})
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds
return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
for (const channelId of Object.values(global.ch)) {
await conn.newsletterFollow(channelId).catch(() => {})
}}