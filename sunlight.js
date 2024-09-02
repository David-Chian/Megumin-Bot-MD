process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js';
import { createRequire } from 'module'
import path, { join } from 'path'
import {fileURLToPath, pathToFileURL} from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import fs from 'fs'
import { watchFile, unwatchFile } from 'fs'  
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'
import readline from 'readline'
import NodeCache from 'node-cache'
const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '')
global.timestamp = { start: new Date }

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!global.db.READ) {
clearInterval(this);
resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
}}, 1 * 1000));
}
if (global.db.data !== null) return;
global.db.READ = true;
await global.db.read().catch(console.error);
global.db.READ = null;
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {}),
};
global.db.chain = chain(global.db.data);
};
loadDatabase();

// Inicialización de conexiones globales
if (global.conns instanceof Array) {
console.log('🚩 Conexiones ya inicializadas...');
} else {
global.conns = [];
}

/* ------------------------------------------------*/

global.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
global.loadChatgptDB = async function loadChatgptDB() {
if (global.chatgpt.READ) {
return new Promise((resolve) =>
setInterval(async function() {
if (!global.chatgpt.READ) {
clearInterval(this);
resolve( global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data );
}}, 1 * 1000));
}
if (global.chatgpt.data !== null) return;
global.chatgpt.READ = true;
await global.chatgpt.read().catch(console.error);
global.chatgpt.READ = null;
global.chatgpt.data = {
users: {},
...(global.chatgpt.data || {}),
};
global.chatgpt.chain = lodash.chain(global.chatgpt.data);
};
loadChatgptDB();

/* ------------------------------------------------*/

global.authFile = `MeguminSession`
global.authFileJB = `MeguminJadiBot`

const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()

let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true,
})
const question = (texto) => {
rl.clearLine(rl.input, 0)
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
rl.clearLine(rl.input, 0)
resolver(respuesta.trim())
})})
}

const colores = chalk.bgMagenta.white
const opcionQR = chalk.bold.green
const opcionTexto = chalk.bold.cyan
let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
do {
opcion = await question(colores('Seleccione una opción:\n') + opcionQR('1. Con código QR\n') + opcionTexto('2. Con código de texto de 8 dígitos\n--> '))
if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`🔴  NO SE PERMITE NÚMEROS QUE NO SEAN ${chalk.bold.greenBright("1")} O ${chalk.bold.greenBright("2")}, TAMPOCO LETRAS O SÍMBOLOS ESPECIALES.\n${chalk.bold.yellowBright("CONSEJO: COPIE EL NÚMERO DE LA OPCIÓN Y PÉGUELO EN LA CONSOLA.")}`))
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${authFile}/creds.json`))
}

const filterStrings = [
"Q2xvc2luZyBzdGFsZSBvcGVu", // "Closing stable open"
"Q2xvc2luZyBvcGVuIHNlc3Npb24=", // "Closing open session"
"RmFpbGVkIHRvIGRlY3J5cHQ=", // "Failed to decrypt"
"U2Vzc2lvbiBlcnJvcg==", // "Session error"
"RXJyb3I6IEJhZCBNQUM=", // "Error: Bad MAC" 
"RGVjcnlwdGVkIG1lc3NhZ2U=" // "Decrypted message" 
]

console.info = () => {} 
console.debug = () => {} 
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))

const connectionOptions = {
logger: pino({ level: 'silent' }),
printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
mobile: MethodMobile, 
browser: opcion == '1' ? ['Megumin-Bot', 'Edge', '2.0.0'] : methodCodeQR ? ['Megumin-Bot', 'Edge', '2.0.0'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true, 
generateHighQualityLinkPreview: true, 
syncFullHistory: true,
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache, // Resolver mensajes en espera
msgRetryCounterMap, // Determinar si se debe volver a intentar enviar un mensaje o no
defaultQueryTimeoutMs: undefined,
version,  
}

global.conn = makeWASocket(connectionOptions)
if (!fs.existsSync(`./${authFile}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`🟣  Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright("CONSEJO: Copie el número de WhatsApp y péguelo en la consola.")}\n${chalk.bold.yellowBright("Ejemplo: +573138954963")}\n${chalk.bold.magentaBright('---> ')}`)))
phoneNumber = phoneNumber.replace(/\D/g,'')
} while (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v)))
rl.close()
addNumber = phoneNumber.replace(/\D/g, '')

setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.black(chalk.bgGreen(`👑 CÓDIGO DE VINCULACIÓN 👑`)), chalk.bold.white(chalk.white(codeBot)))
}, 2000)
}}}
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp', authFileJB], tmp.forEach(filename => cp.spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete'])))}, 30 * 1000)}
if (opts['server']) (await import('./server.js')).default(global.conn, PORT)

async function getMessage(key) {
if (store) {
} return {
conversation: 'SimpleBot',
}}

async function connectionUpdate(update) {  
const {connection, lastDisconnect, isNewLogin} = update
global.stopped = connection
if (isNewLogin) conn.isInit = true
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error)
//console.log(await global.reloadHandler(true).catch(console.error));
global.timestamp.connect = new Date
}
if (global.db.data == null) loadDatabase()
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
if (opcion == '1' || methodCodeQR) {
console.log(chalk.bold.yellow(`\n✅ ESCANEA EL CÓDIGO QR EXPIRA EN 45 SEGUNDOS`))}
}
if (connection == 'open') {
//await conn.groupAcceptInvite('H5bw4MJucS1BBHnZ9wv3vI')  //Grupo
console.log(chalk.bold.green('\n❒⸺⸺⸺⸺【• CONECTADO •】⸺⸺⸺⸺❒\n│\n│ 🟢  Se ha conectado con WhatsApp exitosamente.\n│\n❒⸺⸺⸺⸺【• CONECTADO •】⸺⸺⸺⸺❒'))}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
if (reason === DisconnectReason.badSession) {
console.log(chalk.bold.cyanBright(`\n⚠️ SIN CONEXIÓN, BORRE LA CARPETA ${global.authFile} Y ESCANEA EL CÓDIGO QR ⚠️`))
} else if (reason === DisconnectReason.connectionClosed) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹\n┆ ⚠️ CONEXION CERRADA, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.bold.blueBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂\n┆ ⚠️ CONEXIÓN PERDIDA CON EL SERVIDOR, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗\n┆ ⚠️ CONEXIÓN REEMPLAZADA, SE HA ABIERTO OTRA NUEVA SESION, POR FAVOR, CIERRA LA SESIÓN ACTUAL PRIMERO.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗`))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.redBright(`\n⚠️ SIN CONEXIÓN, BORRE LA CARPETA ${global.authFile} Y ESCANEA EL CÓDIGO QR ⚠️`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.bold.cyanBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓\n┆ ❇️ CONECTANDO AL SERVIDOR...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸\n┆ ⌛ TIEMPO DE CONEXIÓN AGOTADO, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸`))
await global.reloadHandler(true).catch(console.error) //process.send('reset')
} else {
console.log(chalk.bold.redBright(`\n⚠️❗ RAZON DE DESCONEXIÓN DESCONOCIDA: ${reason || 'No encontrado'} >> ${connection || 'No encontrado'}`))
}}
}
process.on('uncaughtException', console.error)

/* ------------------------------------------------*/
/* Código reconexión de sub-bots fases beta */
/* Echo por: https://github.com/elrebelde21 */

async function connectSubBots() {
const subBotDirectory = './MeguminJadiBot';
if (!existsSync(subBotDirectory)) {
console.log('🚩 Megumin-Bot no tiene Sub-Bots vinculados.');
return;
}

const subBotFolders = readdirSync(subBotDirectory).filter(file => 
statSync(join(subBotDirectory, file)).isDirectory()
);

const botPromises = subBotFolders.map(async folder => {
const authFile = join(subBotDirectory, folder);
if (existsSync(join(authFile, 'creds.json'))) {
return await connectionUpdate(authFile);
}
});

const bots = await Promise.all(botPromises);
global.conns = bots.filter(Boolean);
console.log(chalk.bold.greenBright(`🍟 Todos los Sub-Bots se conectaron con éxito.`))
}

(async () => {
global.conns = [];

const mainBotAuthFile = 'MeguminSession';
try {
const mainBot = await connectionUpdate(mainBotAuthFile);
global.conns.push(mainBot);
console.log(chalk.bold.greenBright(`🚩 Ai Megumin conectado correctamente.`))

await connectSubBots();
} catch (error) {
console.error(chalk.bold.cyanBright(`🍭 Error al iniciar Megumin-Bot: `, error))
}
})();

/* ------------------------------------------------*/

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
const oldChats = global.conn.chats
try {
global.conn.ws.close()
} catch { }
conn.ev.removeAllListeners()
global.conn = makeWASocket(connectionOptions, {chats: oldChats})
isInit = true
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}

conn.handler = handler.handler.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)

const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
} else {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])}

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename));
const module = await import(file);
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(e);
delete global.plugins[filename];
}}}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true)
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(`Se acaba de actualizar el plugin: '${filename}'`)
else {
conn.logger.warn(`Se acaba de eliminar el plugin: '${filename}'`)
return delete global.plugins[filename]
}
} else conn.logger.info(`Nuevo plugin: '${filename}'`)
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`Error de sintaxis al cargar '${filename}'\n${format(err)}`)
else {
try {
const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(`Error require plugin '${filename}\n${format(e)}'`)
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}}}};
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()
async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127)
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false))
})]);
}));
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find}
Object.freeze(global.support)
}

function clearTmp() {
const tmpDir = join(__dirname, 'tmp')
const filenames = readdirSync(tmpDir)
filenames.forEach(file => {
const filePath = join(tmpDir, file)
unlinkSync(filePath)})
}

function purgeSession() {
let prekey = []
let directorio = readdirSync(`./${authFile}`)
let filesFolderPreKeys = directorio.filter(file => {
return file.startsWith('pre-key-')
})
prekey = [...prekey, ...filesFolderPreKeys]
filesFolderPreKeys.forEach(files => {
unlinkSync(`./${authFile}/${files}`)
})
} 

function purgeSessionSB() {
try {
const listaDirectorios = readdirSync(`./${authFileJB}/`);
let SBprekey = [];
listaDirectorios.forEach(directorio => {
if (statSync(`./${authFileJB}/${directorio}`).isDirectory()) {
const DSBPreKeys = readdirSync(`./${authFileJB}/${directorio}`).filter(fileInDir => {
return fileInDir.startsWith('pre-key-')
})
SBprekey = [...SBprekey, ...DSBPreKeys];
DSBPreKeys.forEach(fileInDir => {
if (fileInDir !== 'creds.json') {
unlinkSync(`./${authFileJB}/${directorio}/${fileInDir}`)
}})
}})
if (SBprekey.length === 0) {
console.log(chalk.bold.green(`\n╭» 🟡 MeguminJadiBot 🟡\n│→ NADA POR ELIMINAR \n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
} else {
console.log(chalk.bold.cyanBright(`\n╭» ⚪ MeguminJadiBot ⚪\n│→ ARCHIVOS NO ESENCIALES ELIMINADOS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
}} catch (err) {
console.log(chalk.bold.red(`\n╭» 🔴 MeguminJadiBot 🔴\n│→ OCURRIÓ UN ERROR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️\n` + err))
}}

function purgeOldFiles() {
const directories = [`./${authFile}/`, `./${authFileJB}/`]
directories.forEach(dir => {
readdirSync(dir, (err, files) => {
if (err) throw err
files.forEach(file => {
if (file !== 'creds.json') {
const filePath = path.join(dir, file);
unlinkSync(filePath, err => {
if (err) {
console.log(chalk.bold.red(`\n╭» 🔴 ARCHIVO 🔴\n│→ ${file} NO SE LOGRÓ BORRAR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️❌\n` + err))
} else {
console.log(chalk.bold.green(`\n╭» 🟣 ARCHIVO 🟣\n│→ ${file} BORRADO CON ÉXITO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))
} }) }
}) }) }) }

function redefineConsoleMethod(methodName, filterStrings) {
const originalConsoleMethod = console[methodName]
console[methodName] = function() {
const message = arguments[0]
if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
arguments[0] = ""
}
originalConsoleMethod.apply(console, arguments)
}}

setInterval(async () => {
if (stopped === 'close' || !conn || !conn.user) return
await clearTmp()
console.log(chalk.bold.cyanBright(`\n╭» 🟢 MULTIMEDIA 🟢\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))}, 1000 * 60 * 4) // 4 min 

//setInterval(async () => {
//if (stopped === 'close' || !conn || !conn.user) return
//await purgeSession()
//console.log(chalk.bold.cyanBright(`\n╭» 🔵 ${global.authFile} 🔵\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))}, 1000 * 60 * 10) // 10 min

//setInterval(async () => {
//if (stopped === 'close' || !conn || !conn.user) return
//await purgeSessionSB()}, 1000 * 60 * 10) 

setInterval(async () => {
if (stopped === 'close' || !conn || !conn.user) return
await purgeOldFiles()
console.log(chalk.bold.cyanBright(`\n╭» 🟠 ARCHIVOS 🟠\n│→ ARCHIVOS RESIDUALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― 🗑️♻️`))}, 1000 * 60 * 10)

_quickTest().then(() => conn.logger.info(chalk.bold(`🚩  H E C H O\n`.trim()))).catch(console.error)

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.bold.greenBright("SE ACTUALIZÓ 'main.js' CON ÉXITO".trim()))
import(`${file}?update=${Date.now()}`)
})
