import "./settings.js"
import handler from './main.js'
import { participantsUpdate } from './commands/events.js'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import cfonts from 'cfonts';
import pino from "pino";
import crypto from 'crypto';
import chalk from "chalk";
import fs from "fs";
import path from "path";
import boxen from 'boxen';
import readline from "readline";
import os from "os";
import qrcode from "qrcode-terminal";
import parsePhoneNumber from "awesome-phonenumber";
import { smsg } from "./lib/message.js";
import db from "./lib/system/database.js";
import { startSubBot } from './lib/subs.js';
import { exec, execSync } from "child_process";
import moment from 'moment-timezone';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(`INFO`), chalk.white(msg)),
  success: (msg) => console.log(chalk.bgGreen.white.bold(`SUCCESS`), chalk.greenBright(msg)),
  warn: (msg) => console.log(chalk.bgYellowBright.blueBright.bold(`WARNING`), chalk.yellow(msg)),
  warning: (msg) => console.log(chalk.bgYellowBright.red.bold(`WARNING`), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.bgRed.white.bold(`ERROR`), chalk.redBright(msg)),
}

const print = (label, value) =>
  console.log(`${chalk.green.bold("║")} ${chalk.cyan.bold(label.padEnd(16))}${chalk.magenta.bold(":")} ${value}`)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, (answer) => resolve(answer.trim())))

const DIGITS = (s = "") => String(s).replace(/\D/g, "")

function normalizePhoneForPairing(input) {
  let s = DIGITS(input)
  if (!s) return ""
  if (s.startsWith("0")) s = s.replace(/^0+/, "")
  if (s.length === 10 && s.startsWith("3")) s = "57" + s
  if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) s = "521" + s.slice(2)
  if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) s = "549" + s.slice(2)
  return s
}

export async function uPLoader() {
  const TOTAL_TIME = 5000
  const STEPS = 100
  const BAR_SIZE = 40
  const TITLE = 'MEGUMIN-BOT-MD'
  const SUB = 'powered by David-Chian'

  let typedTitle = ''
  let typedSub = ''

  for (let i = 0; i <= STEPS; i++) {
    const percent = i
    const filled = Math.floor((percent / 100) * BAR_SIZE)
    const empty = BAR_SIZE - filled

    let color
    if (percent < 30) color = chalk.red
    else if (percent < 60) color = chalk.yellow
    else if (percent < 90) color = chalk.cyan
    else color = chalk.green

    const bar = color('■'.repeat(filled)) + chalk.gray('□'.repeat(empty))

    if (typedTitle.length < TITLE.length) typedTitle += TITLE[typedTitle.length]
    if (percent > 40 && typedSub.length < SUB.length) typedSub += SUB[typedSub.length]

    process.stdout.write(
      '\x1b[2J\x1b[0f' +
      chalk.cyan.bold('Inicializando sistema...\n\n') +
      `${chalk.white('Cargando datos:')} ${bar} ${chalk.bold(percent + '%')}\n\n` +
      chalk.red.bold(typedTitle) + '\n' +
      chalk.blue(typedSub)
    )

    await new Promise(r => setTimeout(r, TOTAL_TIME / STEPS))
  }

  console.clear()
  cfonts.say('MEGUMIN-BOT-MD', { font: 'block', align: 'center', colors: ['red'] })
  cfonts.say('powered by David-Chian', { font: 'console', align: 'center', gradient: ['blue', 'cyan'] })

  console.log(
    chalk.yellow.bold('\nSeleccione el método de inicio:\n') +
    chalk.green('1') + ' ➜ Código QR\n' +
    chalk.green('2') + ' ➜ Código de 8 dígitos\n'
  )

  let opt
  while (!['1', '2'].includes(opt)) {
    opt = await question(chalk.magentaBright('➤ Opción: '))
  }
  return opt
}

const BOT_TYPES = [
  { name: 'SubBot', folder: './Sessions/Subs', starter: startSubBot }
]

const queue = []
let running = false
const DELAY_NORMAL = 300
const DELAY_AFTER_RATELIMIT = 3000

global.conns = global.conns || []
const reconnecting = new Set()

async function loadBots() {
  for (const { name, folder, starter } of BOT_TYPES) {
    if (!fs.existsSync(folder)) continue
    const botIds = fs.readdirSync(folder)
    for (const userId of botIds) {
      const sessionPath = path.join(folder, userId)
      const credsPath = path.join(sessionPath, 'creds.json')
      if (!fs.existsSync(credsPath)) continue
      if (global.conns.some((conn) => conn.userId === userId)) continue
      if (reconnecting.has(userId)) continue
      try {
        reconnecting.add(userId)
        await starter(null, null, 'Auto reconexión', false, userId, sessionPath)
      } catch (e) {
        reconnecting.delete(userId)
      }
      await new Promise((res) => setTimeout(res, 2500))
    }
  }
  setTimeout(loadBots, 60 * 1000)
}

;(async () => { await loadBots() })()

const realizarLimpieza = () => {
  console.log(chalk.cyanBright('[ ✿ ] Ejecutando revisión de inactividad...'))
  const users = global.db?.data?.users
  if (!users) return
  const quinceDias = 15 * 24 * 60 * 60 * 1000
  const ahora = Date.now()
  let contador = 0

  Object.keys(users).forEach(jid => {
    const user = users[jid]
    const ultimaVez = user.lastSeen ? new Date(user.lastSeen).getTime() : 0
    if (ahora - ultimaVez > quinceDias) {
      const esOwner = global.owner?.some(owner => jid.includes(owner))
      if (!esOwner && jid !== global.client?.user?.id) {
        delete global.db.data.users[jid]
        contador++
      }
    }
  })

  if (contador > 0) {
    global.saveDatabase?.()
    try { global.db.conn?.prepare('VACUUM').run() } catch (e) {}
    console.log(chalk.greenBright(`[ ✿ ] Limpieza terminada: ${contador} usuarios inactivos eliminados.`))
  }
}

let LOGIN_METHOD = null

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: "silent" })

  console.info = () => {}
  console.debug = () => {}

  const clientt = makeWASocket({
    version,
    logger,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => "",
    keepAliveIntervalMs: 45000,
    maxIdleTimeMs: 60000,
  })

  patchSendMessage(clientt)
  global.client = clientt
  client.isInit = false
  client.ev.on("creds.update", saveCreds)

  if (!client.authState.creds.registered) {
    console.clear()
    if (LOGIN_METHOD === '2') {
      console.log(chalk.bold.redBright('\nIngrese su número de WhatsApp\n') + chalk.yellowBright('Ejemplo: +57301XXXXXXX\n'))
      const fixed = await question(chalk.magentaBright('➤ Número: '))
      const phoneNumber = normalizePhoneForPairing(fixed)
      try {
        const pairing = await client.requestPairingCode(phoneNumber)
        console.log(chalk.bgMagenta.white.bold('\n CÓDIGO DE VINCULACIÓN ') + '\n\n' + chalk.white.bold(pairing) + '\n')
      } catch (err) {
        console.log(chalk.red('❌ Error al generar código'))
        exec('rm -rf ./Sessions/Owner/*')
        process.exit(1)
      }
    }
  }

  client.sendText = (jid, text, quoted = "", options) =>
    client.sendMessage(jid, { text: text, ...options }, { quoted })

  client.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications } = update

    if (qr && LOGIN_METHOD === '1') {
      console.clear()
      console.log(chalk.cyan.bold('📸 ESCANEA ESTE CÓDIGO QR\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || 0
      if (reason === DisconnectReason.connectionLost) {
        log.warning("Se perdió la conexión al servidor, intento reconectarme..")
        startBot()
      } else if (reason === DisconnectReason.connectionClosed) {
        log.warning("Conexión cerrada, intentando reconectarse...")
        startBot()
      } else if (reason === DisconnectReason.restartRequired) {
        log.warning("Es necesario reiniciar..")
        startBot()
      } else if (reason === DisconnectReason.timedOut) {
        log.warning("Tiempo de conexión agotado, intentando reconectarse...")
        startBot()
      } else if (reason === DisconnectReason.badSession) {
        log.warning("Eliminar sesión y escanear nuevamente...")
        startBot()
      } else if (reason === DisconnectReason.connectionReplaced) {
        log.warning("Primero cierre la sesión actual...")
      } else if (reason === DisconnectReason.loggedOut) {
        log.warning("Escanee nuevamente y ejecute...")
        exec("rm -rf ./Sessions/Owner/*")
        process.exit(1)
      } else if (reason === DisconnectReason.forbidden) {
        log.error("Error de conexión, escanee nuevamente y ejecute...")
        exec("rm -rf ./Sessions/Owner/*")
        process.exit(1)
      } else if (reason === DisconnectReason.multideviceMismatch) {
        log.warning("Inicia nuevamente")
        exec("rm -rf ./Sessions/Owner/*")
        process.exit(0)
      } else {
        client.end(`Motivo de desconexión desconocido : ${reason}|${connection}`)
      }
    }

    if (connection === "open") {
      console.log(boxen(chalk.bold(' ¡CONECTADO CON WHATSAPP! '), {
        borderStyle: 'round', borderColor: 'green',
        title: chalk.green.bold('● CONEXIÓN ●'), titleAlignment: 'center', float: 'center'
      }))
      setTimeout(realizarLimpieza, 10000)
      setInterval(realizarLimpieza, 24 * 60 * 60 * 1000)
    }

    if (isNewLogin) log.info("Nuevo dispositivo detectado")

    if (receivedPendingNotifications == "true") {
      log.warn("Por favor espere aproximadamente 1 minuto...")
      client.ev.flush()
    }
  })

  let m
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      m = messages[0]
      if (!m.message) return
      m.message =
        Object.keys(m.message)[0] === "ephemeralMessage"
          ? m.message.ephemeralMessage.message
          : m.message
      if (m.key && m.key.remoteJid === "status@broadcast") return
      if (!client.public && !m.key.fromMe && messages.type === "notify") return
      if (m.key.id.startsWith("BAE5") && m.key.id.length === 16) return
      m = await smsg(client, m)
      handler(client, m, messages)
    } catch (err) {
      console.log(err)
    }
  })

client.ev.on("group-participants.update", async (anu) => {
   await participantsUpdate(client, anu)
})

  client.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid
    } else return jid
  }
}
function enqueue(task) {
  queue.push(task)
  run()
}

let lastWasRateLimit = false

async function run() {
  if (running) return
  running = true

  while (queue.length) {
    const job = queue.shift()
    try {
      await job()
      lastWasRateLimit = false
    } catch (e) {
      if (String(e).includes('rate-overlimit')) {
        console.log('⚠️ Rate limit detectado, reintentando…')
        lastWasRateLimit = true
        await new Promise(r => setTimeout(r, 2000))
        queue.unshift(job)
      } else {
        console.error('Send error:', e)
        lastWasRateLimit = false
      }
    }
    await new Promise(r => setTimeout(r, lastWasRateLimit ? DELAY_AFTER_RATELIMIT : DELAY_NORMAL))
  }

  running = false
}

export function patchSendMessage(client) {
  if (client._sendMessagePatched) return
  client._sendMessagePatched = true

  const original = client.sendMessage.bind(client)

  client.sendMessage = (jid, content, options = {}) => {
    return new Promise((resolve, reject) => {
      enqueue(async () => {
        const res = await original(jid, content, options)
        resolve(res)
      })
    })
  }
}

function hasMainSession() {
  const credsPath = path.join(global.sessionName, 'creds.json')
  if (!fs.existsSync(credsPath)) return false
  try {
    const creds = JSON.parse(fs.readFileSync(credsPath))
    return !!creds.registered
  } catch {
    return false
  }
}

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'd ️', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('')
}

;(async () => {
  global.loadDatabase()
  console.log(chalk.gray('[ ✿  ]  Base de datos cargada correctamente.'))

  const hasSession = hasMainSession()
  LOGIN_METHOD = hasSession ? null : await uPLoader()

  await startBot()
})()

process.on('uncaughtException', (err) => {
  console.log(chalk.bgRed.white.bold(' FATAL ERROR '), chalk.red(err.stack || err))
})

process.on('unhandledRejection', (reason) => {
  console.log(chalk.bgYellow.black.bold(' UNHANDLED REJECTION '), chalk.yellow(reason))
})