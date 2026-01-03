import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import main from '../main.js'
import events from '../commands/events.js'
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import {smsg} from './message.js';
import moment from 'moment-timezone';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  commandFlags = {},
  isCommand = false,
) {

  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()
  // const logger = pino({ level: 'silent' })

  console.info = () => {} 
const sock = makeWASocket({
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  browser: Browsers.macOS('Chrome'),
  auth: state,
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async () => '',
  msgRetryCounterCache,
  userDevicesCache,
  cachedGroupMetadata: async (jid) => groupCache.get(jid),
  version,
  keepAliveIntervalMs: 60_000,
  maxIdleTimeMs: 120_000,
  })

  /* console.info = () => {} 
  const sock = makeWASocket({
    logger,
    version,
    printQRInTerminal: false,
    browser: ['Windows', 'Chrome'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000,
    maxIdleTimeMs: 60000
  })*/

  sock.isInit = false
  sock.ev.on('creds.update', saveCreds)
  // commandFlags[m.sender] = true

  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) sock.isInit = false

    if (connection === 'open') {
      sock.isInit = true
      sock.userId = cleanJid(sock.user?.id?.split('@')[0])
      const botDir = sock.userId + '@s.whatsapp.net'
      if (!globalThis.db.data.settings[botDir]) {
        globalThis.db.data.settings[botDir] = {}
      }
      globalThis.db.data.settings[botDir].botmod = false
      globalThis.db.data.settings[botDir].botprem = false

globalThis.db.data.settings[botDir].type = 'Sub'

      if (!global.conns.find((c) => c.userId === sock.userId)) {
        global.conns.push(sock)
      }

/*if (m && client && isCommand && commandFlags[senderId]) {

client.sendMessage(m.chat, { text: `✎ Has conectado un nuevo Socket de tipo *Gratuito*.` }, { quoted: m })
delete commandFlags[senderId]

}*/

      delete reintentos[sock.userId || id]
     // await joinChannels(sock)
      console.log(chalk.gray(`[ ✿  ]  SUB-BOT conectado: ${sock.userId}`))

    }

    if (connection === 'close') {
      const botId = sock.userId || id
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0
      const intentos = reintentos[botId] || 0
      reintentos[botId] = intentos + 1

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          console.log(
            chalk.gray(
              `[ ✿  ]  SUB-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/5 → Reintentando...`,
            ),
          )
          setTimeout(() => {
            startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
          }, 3000)
        } else {
          console.log(
            chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Falló tras 5 intentos. Eliminando sesión.`),
          )
          try {
            fs.rmSync(sessionFolder, { recursive: true, force: true })
          } catch (e) {
            console.error(`[ ✿  ] No se pudo eliminar la carpeta ${sessionFolder}:`, e)
          }
          delete reintentos[botId]
        }
        return
      }

      if (
        [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.connectionReplaced,
        ].includes(reason)
      ) {
        // console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} desconectado → Reconectando...`))
        setTimeout(() => {
          startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
        }, 3000)
        return
      }

      setTimeout(() => {
        startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand)
      }, 3000)
    }

if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
try {
let codeGen = await sock.requestPairingCode(phone, 'ABCD1234');
codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
const msg = await m.reply(caption)
const msgCode = await m.reply(codeGen);
delete commandFlags[senderId];
setTimeout(async () => {
try {
await client.sendMessage(chatId, { delete: msg.key });
await client.sendMessage(chatId, { delete: msgCode.key });
//delete commandFlags[senderId];
} catch {}
}, 60000);
} catch (err) {
console.error("[Código Error]", err);
}}
});

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = await smsg(sock, raw)
      try {
        main(sock, msg, messages)
      } catch (err) {
        console.log(chalk.gray(`[ ✿  ]  Sub » ${err}`))
      }
    }
  })
 
  try {
  await events(sock, m)
  } catch (err) {
   console.log(chalk.gray(`[ BOT  ]  → ${err}`))
  }

  process.on('uncaughtException', console.error)
   return sock
}

async function joinChannels(client) {
for (const value of Object.values(global.my)) {
if (typeof value === 'string' && value.endsWith('@newsletter')) {
await client.newsletterFollow(value).catch(err => console.log(chalk.gray(`\n[ ✿ ] Error al seguir el canal ${value}`)))
}}}