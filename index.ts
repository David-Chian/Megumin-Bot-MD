import "./settings.ts"
import handler from './handler.ts'
import events from './cmds/events.ts'
import { iniciarImpuestos } from './core/impuestos.ts'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import chalk from "chalk";
import cfonts from "cfonts";
import boxen from "boxen";
import fs from "fs";
import path from "path";
import readlineSync from "readline-sync";
import readline from "readline";
import { smsg } from "./core/message.ts";
import database from "./core/system/database.ts";
import { initBackupScheduler } from "./core/system/database.ts";
import { startSubBot } from './cmds/socket/subbot.ts';
import { exec, execSync } from "child_process";

let sistemasIniciados = false
const log = {
  info: (msg) => console.log(chalk.bgBlue.white.bold(`INFO`), chalk.white(msg)),
  success: (msg) =>
    console.log(chalk.bgGreen.white.bold(`SUCCESS`), chalk.greenBright(msg)),
  warn: (msg) =>
    console.log(
      chalk.bgYellowBright.blueBright.bold(`WARNING`),
      chalk.yellow(msg),
    ),
  warning: (msg) =>
    console.log(chalk.bgYellowBright.red.bold(`WARNING`), chalk.yellow(msg)),
  error: (msg) =>
    console.log(chalk.bgRed.white.bold(`ERROR`), chalk.redBright(msg)),
};

const askQuestion = readlineSync
let usarCodigo = false
let numero = "";
let phoneInput = "";

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

function normalizePhoneForPairing(input) {
  let s = DIGITS(input);
  if (!s) return "";
  if (s.startsWith("0")) s = s.replace(/^0+/, "");
  if (s.length === 10 && s.startsWith("3")) {
    s = "57" + s;
  }
  if (s.startsWith("52") && !s.startsWith("521") && s.length >= 12) {
    s = "521" + s.slice(2);
  }
  if (s.startsWith("54") && !s.startsWith("549") && s.length >= 11) {
    s = "549" + s.slice(2);
  }
  return s;
}

async function mostrarBienvenida() {
  const TOTAL_TIME = 3200
  const STEPS = 60
  const BAR_SIZE = 36
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const mensajes = [
    'Preparando el entorno...',
    'Cargando módulos del núcleo...',
    'Sincronizando base de datos...',
    'Estableciendo protocolos de conexión...',
    'Ajustando los últimos detalles...',
  ]

  for (let i = 0; i <= STEPS; i++) {
    const percent = Math.round((i / STEPS) * 100)
    const filled = Math.floor((percent / 100) * BAR_SIZE)
    const empty = BAR_SIZE - filled

    let colorBar = chalk.red
    if (percent >= 90) colorBar = chalk.greenBright
    else if (percent >= 60) colorBar = chalk.cyanBright
    else if (percent >= 30) colorBar = chalk.yellowBright

    const bar = colorBar('▰'.repeat(filled)) + chalk.gray('▱'.repeat(empty))
    const spinner = chalk.magentaBright(spinnerFrames[i % spinnerFrames.length])
    const msgIndex = Math.min(
      Math.floor((percent / 100) * mensajes.length),
      mensajes.length - 1
    )

    process.stdout.write(
      '\x1b[2J\x1b[0f' +
      chalk.cyan.bold('\n  ✦  I N I C I A N D O   M E G U M I N   B O T  ✦\n\n') +
      `  ${spinner}  ${chalk.white(mensajes[msgIndex])}\n\n` +
      `  ${bar}  ${chalk.bold.white(percent + '%')}\n`
    )

    await new Promise((r) => setTimeout(r, TOTAL_TIME / STEPS))
  }

  console.clear()

  cfonts.say('MEGUMIN', {
    font: 'block',
    align: 'center',
    gradient: ['red', 'magenta'],
    independentGradient: true,
    transitionGradient: true,
  })

  cfonts.say('B O T  ·  M D', {
    font: 'console',
    align: 'center',
    gradient: ['cyan', 'blue'],
  })

  console.log(
    boxen(
      chalk.italic.white('Powered by ') +
        chalk.bold.magentaBright('Fakin David Chian ❨◣_◢❩凸'),
      {
        padding: 1,
        margin: { top: 0, bottom: 1, left: 4, right: 4 },
        borderStyle: 'round',
        borderColor: 'magenta',
        textAlignment: 'center',
      }
    )
  )
}

async function pedirMetodoConexion() {
  await mostrarBienvenida()

  console.log(
    boxen(
      chalk.bold.yellowBright('¿CÓMO DESEA CONECTARSE?\n\n') +
        chalk.redBright('1') + chalk.white('  →  Código QR\n') +
        chalk.redBright('2') + chalk.white('  →  Código de 8 dígitos'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        title: '✿ MÉTODO DE VINCULACIÓN ✿',
        titleAlignment: 'center',
      }
    )
  )

  const opcion = askQuestion.question(chalk.bold.magentaBright('  ➜  Seleccione una opción: '))
  usarCodigo = opcion.trim() === "2"

  if (usarCodigo) {
    console.log(
      boxen(
        chalk.bold.redBright('Ingrese su número de WhatsApp\n') +
          chalk.yellowBright('Ejemplo: +57301XXXXXXX'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'yellow',
          textAlignment: 'center',
        }
      )
    )
    phoneInput = askQuestion.question(chalk.bold.magentaBright('  ➜  Número: '))
    numero = normalizePhoneForPairing(phoneInput)
  }
}

const BOT_TYPES = [
  { name: 'SubBot', folder: './Sessions/Subs', starter: startSubBot }
]

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
  // setTimeout(loadBots, 10 * 60 * 1000)
}

(async () => {
  await loadBots()
})()

async function initDB() {
    database.initDB();
    global.db = database;
    global.getUser = database.getUser;
    global.updateUser = database.updateUser;
    global.getChat = database.getChat;
    global.updateChat = database.updateChat;
    global.getChatUser = database.getChatUser;
    global.updateChatUser = database.updateChatUser;
    global.getSettings = database.getSettings;
    global.updateSettings = database.updateSettings;
    global.getToken = database.getToken;
    global.updateToken = database.updateToken;
    global.getTokenMod = database.getTokenMod;
    global.updateTokenMod = database.updateTokenMod;
    global.getStickersPack = database.getStickersPack;
    global.updateStickersPack = database.updateStickersPack;
    global.deletedb = database.deletedb;
    global.setCreate = database.setCreate;
    global.clearCache = database.clearCache;
    database.clearCache('user');
    database.clearCache('chat');
    database.clearCache('set');
    database.clearCache('chatuser');
    database.clearCache('packsticker');
    log.info('Base de datos cargada correctamente.');
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    try {
      fs.rmSync(folderPath, { recursive: true, force: true });
    } catch (err) {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(folderPath);
    }
  }
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function migrateSessionToOwner(sourcePath) {
  const ownerPath = './Sessions/Owner';
  log.info(`Migrando sesión de ${sourcePath} a ${ownerPath}...`);

  if (fs.existsSync(ownerPath)) {
    deleteFolderRecursive(ownerPath);
  }

  copyFolderSync(sourcePath, ownerPath);
  log.success(`Sesión migrada correctamente a Owner.`);
}

function getBackupSession() {
  const priorities = [
    { type: 'Sub', folder: './Sessions/Subs' }
  ];

  for (const item of priorities) {
    if (!fs.existsSync(item.folder)) continue;

    const files = fs.readdirSync(item.folder).filter(f => {
      try {
        const stats = fs.statSync(path.join(item.folder, f));
        return stats.isDirectory() && fs.existsSync(path.join(item.folder, f, 'creds.json'));
      } catch {
        return false;
      }
    });

    if (files.length > 0) {
      const randomUser = files[Math.floor(Math.random() * files.length)];
      const sessionPath = path.join(item.folder, randomUser);
      return { userId: randomUser, path: sessionPath, type: item.type };
    }
  }
  return null;
}

async function startBot(fallbackInfo = null) {
  let authStatePath = `./Sessions/Owner`;
  let isFallback = false;
  let fallbackType = '';
  let originalFallbackPath = '';

  if (fallbackInfo) {
    originalFallbackPath = fallbackInfo.path;
    migrateSessionToOwner(fallbackInfo.path);
    authStatePath = `./Sessions/Owner`;
    isFallback = true;
    fallbackType = fallbackInfo.type;
    log.warn(`Iniciando con sesión de respaldo migrada: ${fallbackInfo.userId} (${fallbackType})`);
  }

  const { state, saveCreds } = await useMultiFileAuthState(authStatePath)
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const logger = pino({ level: "silent" })

  console.info = () => {}
  console.debug = () => {}

  const clientt = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: ["MacOs", "Safari"],
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

  global.sock = clientt;
  sock.isInit = false
  sock.ev.on("creds.update", saveCreds)

  if (usarCodigo && !state.creds.registered && !isFallback) {
    setTimeout(async () => {
      try {
        const pairing = await sock.requestPairingCode(numero, 'STBOT004');
        const codeBot = pairing?.match(/.{1,4}/g)?.join("-") || pairing
        return console.log(chalk.bold.white(chalk.bgMagenta(`[  ✿  ]  CÓDIGO DE VINCULACIÓN:`)), chalk.bold.white(chalk.white(codeBot)));
      } catch {}
    }, 3000);
  }

  sock.sendText = (jid, text, quoted = "", options) =>
    sock.sendMessage(jid, { text: text, ...options }, { quoted })

  sock.ev.on("connection.update", async (update) => {
     const { qr, connection, lastDisconnect, isNewLogin, receivedPendingNotifications, } = update

    if (qr && !usarCodigo && !isFallback) {
      console.log(
        boxen(chalk.cyan.bold('📸  ESCANEA ESTE CÓDIGO QR'), {
          padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan', textAlignment: 'center'
        })
      )
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;

      const criticalErrors = [
        DisconnectReason.loggedOut,
        DisconnectReason.forbidden,
        DisconnectReason.badSession
      ];

      const reconnectErrors = [
        DisconnectReason.connectionLost,
        DisconnectReason.connectionClosed,
        DisconnectReason.restartRequired,
        DisconnectReason.timedOut
      ];

      if (criticalErrors.includes(reason)) {
         if (!isFallback) {
           log.error("Sesión principal caída críticamente. Buscando reemplazo...");
           const backup = getBackupSession();

           if (backup) {
             log.success(`Sesión de respaldo encontrada: ${backup.userId} (${backup.type})`);

             setTimeout(async () => {
               try {
                 await startBot(backup);

                 setTimeout(async () => {
                   if (sock.user) {
                     const ownerJid = global.owner[0] + "@s.whatsapp.net";
                     const msg = `ღゝ◡╹ )ノ *Bot Activo*\n\nEl antiguo se desconectó.\nSoy un *${backup.type}* convertido en *Owner*!`;
                     await global.sock.sendMessage(ownerJid, { text: msg });
                     log.success("Notificación enviada al creador.");
                   }
                 }, 5000);

               } catch (e) {
                 log.error("Falló al iniciar sesión de respaldo");
               }
             }, 2000);
             return;
           } else {
             log.error("No hay más sesiones de respaldo disponibles. Apagando.");
             exec("rm -rf ./Sessions/Owner/*")
             process.exit(1);
           }
         } else {
           log.error("La sesión de respaldo también falló críticamente. Apagando.");
           process.exit(1);
         }
      } else if (reconnectErrors.includes(reason)) {
        log.warning("Conexión perdida, intentando reconectar...");
        startBot(isFallback ? fallbackInfo : null);
      } else if (reason === DisconnectReason.connectionReplaced) {
        log.warning("Primero cierre la sesión actual...");
      } else if (reason === DisconnectReason.multideviceMismatch) {
        log.warning("Inicia nuevamente")
        exec("rm -rf ./Sessions/Owner/*")
        process.exit(0)
      } else {
        sock.end(`Motivo de desconexión desconocido : ${reason}|${connection}`)
      }
    }

    if (connection == "open") {
  const ownerBotId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  getSettings(ownerBotId);
  updateSettings(ownerBotId, 'type', 'Owner');

  if (!sistemasIniciados) {
    await iniciarImpuestos(sock)
    sistemasIniciados = true
  }

     if (isFallback && originalFallbackPath) {
        try {
            log.info(`PROCEDIENDO A BORRAR CARPETA ORIGINAL: ${originalFallbackPath}`);

            if (fs.existsSync(originalFallbackPath)) {
                deleteFolderRecursive(originalFallbackPath);
                log.success(`CARPETA ORIGINAL ELIMINADA: ${originalFallbackPath}`);
            } else {
                log.warn(`La carpeta original ya no existía: ${originalFallbackPath}`);
            }

            const botDir = fallbackInfo?.userId + "@s.whatsapp.net";
            if (global.SUBBOTSESSIONS && global.SUBBOTSESSIONS.has(botDir)) {
                global.SUBBOTSESSIONS.delete(botDir);
                log.info(`Eliminado de memoria SUBBOTSESSIONS: ${botDir}`);
            }

        } catch (e) {
            log.error(`Error CRÍTICO al borrar carpeta original: ${e}`);
        }
     }

     const userName = sock.user.name || "Desconocido"

     console.log(
       boxen(chalk.bold.greenBright(`✔  Conectado a: ${userName}`), {
         padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green', textAlignment: 'center'
       })
     )
    }

    if (isNewLogin) {
      log.info("Nuevo dispositivo detectado")
    }
    if (receivedPendingNotifications == "true") {
      log.warn("Por favor espere aproximadamente 1 minuto...")
      sock.ev.flush()
    }
})

  let m
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      m = messages[0]
      if (!m.message) return
      m.message =
        Object.keys(m.message)[0] === "ephemeralMessage"
          ? m.message.ephemeralMessage.message
          : m.message
      if (m.key && m.key.remoteJid === "status@broadcast") return
      if (!sock.public && !m.key.fromMe && messages.type === "notify") return
      if (m.key.id.startsWith("BAE5") && m.key.id.length === 16) return
      m = await smsg(sock, m)
      handler(sock, m, messages)
    } catch (err) {
     console.log(err)
    }
  })

  try {
  await events(sock, m)
  } catch (err) {
   console.log(chalk.gray(`[ BOT  ]  → ${err}`))
  }

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      )
    } else return jid
  }
}

(async () => {
    if (!fs.existsSync(`./Sessions/Owner/creds.json`)) {
      await pedirMetodoConexion()
    }
    await initDB();
    initBackupScheduler();
    await startBot()
})()

process.on('uncaughtException', (err) => {
  const msg = err?.message || '';
  if (msg.includes('rate-overlimit') || msg.includes('timed out') || msg.includes('Connection Closed')) return;
});

process.on('unhandledRejection', (reason) => {
  const msg = String(reason?.message || reason || '');
  if (msg.includes('rate-overlimit') || msg.includes('timed out') || msg.includes('Connection Closed')) return;
});
