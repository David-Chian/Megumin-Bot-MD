/*⚠ PROHIBIDO EDITAR ⚠

Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion

El codigo de este archivo esta inspirado en el codigo original de:
- Aiden_NotLogic >> https://github.com/ferhacks

*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*

El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino
*/
const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮*\n*│🔥 S E R B O T - S U B B O T 🔥*\n*├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴*\n*│ 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅 𝑝𝑎𝑟𝑎 𝑠𝑒𝑟 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│💥 𝑷𝒂𝒔𝒐𝒔 𝒑𝒂𝒓𝒂 𝒆𝒔𝒄𝒂𝒏𝒆𝒂𝒓:*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `3` : 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅*\n*├╶╴╶╴╶╴╶╴╶╴*\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝒄𝒐𝒅𝒊𝒈𝒐 𝑸𝑹 𝒆𝒙𝒑𝒊𝒓𝒂 𝒆𝒏 30 𝒔𝒆𝒈𝒖𝒏𝒅𝒐𝒔.\n*╰━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╯*"
let rtx2 = "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮*\n*│🔥 S E R B O T - S U B B O T 🔥*\n*├╶╴╶ᷟ╴ͤ╶ᷚ╴ͧ╶ͫ╴ͥ╶ᷠ╴̄╶╴ᷨ╶ͦ╴ͭ╶̄╴╶ᷟ╴ͩ╶╴*\n*│ 𝑈𝑠𝑎 𝑒𝑠𝑡𝑒 𝐶ó𝑑𝑖𝑔𝑜 𝑝𝑎𝑟𝑎 𝑐𝑜𝑛𝑣𝑒𝑟𝑡𝑖𝑟𝑡𝑒 𝑒𝑛 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│💥 𝑷𝒂𝒔𝒐𝒔:*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠*\n*├╶╴╶╴╶╴╶╴╶╴╶╴*\n*│ `3` : 𝑆𝑒𝑙𝑒𝑐𝑐𝑖𝑜𝑛𝑎 𝑉𝑖𝑛𝑐𝑢𝑙𝑎𝑟 𝑐𝑜𝑛 𝑒𝑙 𝑛𝑢𝑚𝑒𝑟𝑜 𝑑𝑒 𝑡𝑒𝑙é𝑓𝑜𝑛𝑜*\n*├╶╴╶╴╶╴╶╴╶╴*\n*│ `4` : 𝐸𝑠𝑐𝑟𝑖𝑏𝑎 𝑒𝑙 𝐶𝑜𝑑𝑖𝑔𝑜*\n*├╶╴╶╴╶╴╶╴*\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝑪𝒐𝒅𝒊𝒈𝒐 𝒔𝒐𝒍𝒐 𝒇𝒖𝒏𝒄𝒊𝒐𝒏𝒂 𝒆𝒏 𝒆𝒍 𝒏𝒖𝒎𝒆𝒓𝒐 𝒒𝒖𝒆 𝒍𝒐 𝒔𝒐𝒍𝒊𝒄𝒊𝒕𝒐.\n*╰━╴╶╴╶╴╶╴ꗰ╶╴╶╴╶╴╶━╯*"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const meguminJBOptions = {}
const retryMap = new Map()
const maxAttempts = 5
if (globalThis.conns instanceof Array) console.log()
else globalThis.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isModeration, text }) => {
/*let time = globalThis.db.data.chats[m.chat].users[m.sender].Subs + 120000;
if (new Date - globalThis.db.data.chats[m.chat].users[m.sender].Subs < 120000 && !isModeration) {
return conn.reply(m.chat, `ꕥ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`, m);
}*/
const subBots = [...new Set([...globalThis.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 20) {
return m.reply('✎ Hemos llegado al límite de usos gratuitos. Por favor, intenta nuevamente más tarde.')
}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${text ? text.replace(/\D/g, '') : who.split`@`[0]}`  //conn.getName(who)
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
meguminJBOptions.fromCommand = true
meguminJadiBot(meguminJBOptions, text)
globalThis.db.data.chats[m.chat].users[m.sender].Subs = new Date * 1
} 
handler.help = ['code', 'qr']
handler.tags = ['socket']
handler.command = ['code', 'qr']
export default handler 

export async function meguminJadiBot(options, text) {
let { pathMeguminJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathMeguminJadiBot, "creds.json")
if (!fs.existsSync(pathMeguminJadiBot)){
fs.mkdirSync(pathMeguminJadiBot, { recursive: true })}
try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `❀ *Use correctamente el comando »* ${usedPrefix + command} code`, m)
return
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
let reconnectAttempts = 0

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
} else {
return 
}
if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
}
return
} 
if (qr && mcode) {
let fixTe = text ? text.replace(/\D/g, '') : m.sender.split('@')[0]
let secret = await sock.requestPairingCode((fixTe))
// let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
secret = secret.match(/.{1,4}/g)?.join("-")
//if (m.isWABusiness) {
txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
codeBot = await m.reply(secret)
//} else {
//txtCode = await conn.sendButton(m.chat, rtx2.trim(), wm, null, [], secret, null, m) 
//}
//console.log(secret)
}
if (txtCode && txtCode.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
}
if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
}
const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = globalThis.conns.indexOf(sock)                
if (i < 0) return 
delete globalThis.conns[i]
globalThis.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason === 428) {
if (reconnectAttempts < maxAttempts) {
const delay = 1000 * Math.pow(2, reconnectAttempts)
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`Intentando reconectar a +${path.basename(pathMeguminJadiBot)} en ${delay / 1000} segundos...`)}`)
await sleep(1000)
reconnectAttempts++
await creloadHandler(true).catch(console.error)
} else {
console.log(chalk.redBright(`Sub-bot (+${path.basename(pathMeguminJadiBot)}) agotó intentos de reconexión. intentando más tardes...`))
}
}
if (reason === 408) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`Intentando reconectar a +${path.basename(pathMeguminJadiBot)}.`)}`)
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`La coneción de +${path.basename(pathMeguminJadiBot)} ha sido reemplazada por otra sesión activa.`)}`)
} if (reason == 405 || reason == 401) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`No se encontró sesión activa de +${path.basename(pathMeguminJadiBot)}.`)}`)
fs.rmdirSync(pathMeguminJadiBot, { recursive: true })
}
if (reason === 500) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`Session perdida de +${path.basename(pathMeguminJadiBot)}, borrando datos..`)}`)
return creloadHandler(true).catch(console.error)
// fs.rmdirSync(pathMeguminJadiBot, { recursive: true })
}
if (reason === 515) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`Reinicio automatico para +${path.basename(pathMeguminJadiBot)}.`)}`)
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(`\n${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.magentaBright(`Session cerrada para +${path.basename(pathMeguminJadiBot)}.`)}`)
fs.rmdirSync(pathMeguminJadiBot, { recursive: true })
}}
if (globalThis.db.data == null) loadDatabase()
if (connection == `open`) {
reconnectAttempts = 0
if (!globalThis.db.data?.users) loadDatabase()
let userName, userJid
userName = sock.authState.creds.me.name || 'Anónimo'
userJid = sock.authState.creds.me.jid || `${path.basename(pathMeguminJadiBot)}`
console.log(`\n${chalk.bold.whiteBright.bgGreen('INFO:')} ${chalk.bold.cyanBright(`+${userJid.split('@')[0]} Conectado.`)}`)
sock.isInit = true
globalThis.conns.push(sock)

if (options.fromCommand) {
m?.chat ? await conn.sendMessage(m.chat, {text: `❤️‍🔥 SubBot conectado correctamente.` }, { quoted: m }) : ''
}}}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
//console.log(await creloadHandler(true).catch(console.error))
}
sock.ev.removeAllListeners()
let i = globalThis.conns.indexOf(sock)                
if (i < 0) return
delete globalThis.conns[i]
globalThis.conns.splice(i, 1)
}}, 60000)

let handler = await import('../megumin/handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../megumin/handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler

} catch (e) {
console.error('♡ Nuevo error: ', e)
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

export async function startSubBots() {
const subBotDir = path.resolve(`./${jadi}`);
    if (!fs.existsSync(subBotDir)) return;
    const subBotFolders = fs.readdirSync(subBotDir).filter(folder => 
        fs.statSync(path.join(subBotDir, folder)).isDirectory()
    );
    for (const folder of subBotFolders) {
        const pathMeguminJadiBot = path.join(subBotDir, folder);
        const credsPath = path.join(pathMeguminJadiBot, "creds.json");
        if (fs.existsSync(credsPath)) {
            await meguminJadiBot({
                pathMeguminJadiBot,
                m: null,
                conn: globalThis.conn,
                args: [],
                usedPrefix: '#',
                command: 'jadibot',
                fromCommand: false
            });
        }
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
hours = (hours < 10) ? '0' + hours : hours;
minutes = (minutes > 0) ? minutes : '';
seconds = (seconds < 10 && minutes > 0) ? '0' + seconds : seconds;
if (minutes) {
return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
} else {
return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
}
}

const activeConnections = new Set()
const failedBots = new Map()

async function checkSubBots() {
    const subBotDir = path.resolve(`./${jadi}`)
    if (!fs.existsSync(subBotDir)) return

    const subBotFolders = fs.readdirSync(subBotDir).filter(folder => 
        fs.statSync(path.join(subBotDir, folder)).isDirectory()
    )

    for (const folder of subBotFolders) {
        const pathMeguminJadiBot = path.join(subBotDir, folder)
        const credsPath = path.join(pathMeguminJadiBot, "creds.json")
        if (!fs.existsSync(credsPath)) continue

        const isAlreadyConnected = globalThis.conns.find(conn =>
            conn.user?.jid?.includes(folder) || path.basename(pathMeguminJadiBot) === folder
        )

        if (isAlreadyConnected || activeConnections.has(folder)) continue

        const now = Date.now()
        const pauseInfo = failedBots.get(folder)
        if (pauseInfo && now < pauseInfo.resumeAt) {
            const mins = Math.ceil((pauseInfo.resumeAt - now) / 60000)
           // console.log(chalk.gray(`Sub-bot (+${folder}) está en pausa. Reintento en ${mins} min...`))
            continue
        }

        console.log(chalk.yellow(`Sub-bot (+${folder}) no conectado. Intentando activarlo...`))
        activeConnections.add(folder)

        try {
            await meguminJadiBot({
                pathMeguminJadiBot,
                m: null,
                conn: globalThis.conn,
                args: [],
                usedPrefix: '#',
                command: 'jadibot',
                fromCommand: false
            })
            failedBots.delete(folder) //connection 
        } catch (e) {
            console.error(chalk.red(`Error al activar sub-bot (+${folder}):`), e)
            const retries = (failedBots.get(folder)?.retries || 0) + 1
            if (retries >= 5) {
                console.log(chalk.redBright(`Sub-bot (+${folder}) falló 5 veces. Se pausará 1 hora.`))
                failedBots.set(folder, { retries, resumeAt: Date.now() + 3600000 }) // 1 hora
            } else {
                failedBots.set(folder, { retries, resumeAt: Date.now() + 10000 }) // espera 10s entre intentos
            }
        } finally {
            setTimeout(() => activeConnections.delete(folder), 30000)
        }
    }
}

setInterval(checkSubBots, 60000); //1min