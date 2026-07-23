import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import handler from '../../handler.ts';
import events from '../../cmds/events.ts';
import qrcode from "qrcode";
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { smsg } from '../../core/message.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {};
let commandFlags = {};
global.SUBBOTSESSIONS = global.SUBBOTSESSIONS || new Map()

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

export async function startSubBot(
  m,
  client,
  caption = '',
  isCode = false,
  phone = '',
  chatId = '',
  isCommand = false,
) {
  const id = phone || (m?.sender || '').split('@')[0];
  const sessionFolder = `./Sessions/Subs/${id}`;
  const senderId = m?.sender;

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  console.info = () => {};
  
  const clientes = makeWASocket({
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
  });

  clientes.isInit = false;
  clientes.commandTriggered = isCommand;
  clientes.triggerSender = senderId;
  clientes.triggerChatId = chatId;
  clientes.triggerClient = client;
  clientes.triggerIsCode = isCode;
  clientes.sessionFolder = sessionFolder;
  
  clientes.ev.on('creds.update', saveCreds);

  clientes.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
    } else return jid;
  };

  clientes.ev.on('connection.update', async ({ connection, lastDisconnect, isNewLogin, qr }) => {
    if (isNewLogin) clientes.isInit = false;

    if (connection === 'open') {
      clientes.uptime = Date.now();
      clientes.isInit = true;
      clientes.userId = cleanJid(clientes.user?.id?.split('@')[0]);
      const botDir = clientes.userId + '@s.whatsapp.net';
      
      let settings = await getSettings(botDir);
      if (!settings) {
        settings = {};
      }

      settings.botmod = 0;
      settings.botprem = 0;
      settings.type = 'Sub';

      await updateSettings(botDir, 'botmod', settings.botmod);
      await updateSettings(botDir, 'botprem', settings.botprem);
      await updateSettings(botDir, 'type', settings.type);

      if (!global.conns.find((c) => c.userId === clientes.userId)) {
        global.conns.push(clientes);
      }

      delete reintentos[clientes.userId || id];
      global.SUBBOTSESSIONS.set(botDir, clientes)
      console.log(chalk.gray(`[ ✿  ]  SUB-BOT conectado: ${clientes.userId}`));

      const sentFlagFile = path.join(clientes.sessionFolder, 'msg_sent.flag');
      const channelFlagFile = path.join(clientes.sessionFolder, 'channels_joined.flag');

if (!fs.existsSync(channelFlagFile)) {
  await joinChannels(clientes);
  fs.writeFileSync(channelFlagFile, '1');
}
      const hasSentMessage = fs.existsSync(sentFlagFile);

      if (clientes.commandTriggered && !hasSentMessage && clientes.triggerClient && clientes.triggerChatId) {

       await client.sendMessage(m.chat, { text: `✎ Has conectado un nuevo socket de tipo *Gratuito*.` }, { quoted: m })

        fs.writeFileSync(sentFlagFile, '1'); 
        clientes.commandTriggered = false;
        
        if (commandFlags[clientes.triggerSender]) {
          delete commandFlags[clientes.triggerSender];
        }
      }
    }

    if (connection === 'close') {
      const botId = clientes.userId || id;
      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.reason || 0;
      const intentos = reintentos[botId] || 0;
      reintentos[botId] = intentos + 1;

      if ([401, 403].includes(reason)) {
        if (intentos < 5) {
          console.log(
            chalk.gray(
              `[ ✿  ]  SUB-BOT ${botId} Conexión cerrada (código ${reason}) intento ${intentos}/5 → Reintentando...`,
            ),
          );
          setTimeout(() => {
            startSubBot(m, client, caption, isCode, phone, chatId, isCommand);
          }, 3000);
} else {
  const botJid = botId + '@s.whatsapp.net'
  global.SUBBOTSESSIONS.delete(botJid)

/*  try {
    const allChats = getChat(null) as any[]
    if (Array.isArray(allChats)) {
      for (const c of allChats) {
        if (c.primaryBot === botJid) {
          await updateChat(c.id, 'primaryBot', null)
          clearCache('chat', c.id)
          console.log(chalk.yellow(`[ primaryBot ] Reset en ${c.id} → sesión caída: ${botJid}`))
        }
      }
    }
  } catch (e) {
    console.error('[ primaryBot ] Error reseteando tras sesión caída:', e)
  }*/

  console.log(chalk.gray(`[ ✿  ]  SUB-BOT ${botId} Falló tras 5 intentos. Eliminando sesión.`))
  try {
    fs.rmSync(sessionFolder, { recursive: true, force: true })
  } catch (e) {
    console.error(`[ ✿  ] No se pudo eliminar la carpeta ${sessionFolder}:`, e)
  }
  delete reintentos[botId]
}
        return;
      }

      if (
        [
          DisconnectReason.connectionClosed,
          DisconnectReason.connectionLost,
          DisconnectReason.timedOut,
          DisconnectReason.connectionReplaced,
        ].includes(reason)
      ) {
        setTimeout(() => {
          startSubBot(m, client, caption, isCode, phone, chatId, isCommand);
        }, 3000);
        return;
      }

      setTimeout(() => {
        startSubBot(m, client, caption, isCode, phone, chatId, isCommand);
      }, 3000);
    }

    if (qr && isCode && phone && client && chatId && commandFlags[senderId]) {
      try {
        let codeGen = await clientes.requestPairingCode(phone);
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen;
        const msg = await m.reply(caption);
        const msgCode = await m.reply(codeGen);
        delete commandFlags[senderId];
        setTimeout(async () => {
          try {
            await client.sendMessage(chatId, { delete: msg.key });
            await client.sendMessage(chatId, { delete: msgCode.key });
          } catch {}
        }, 60000);
      } catch (err) {
        console.error("[Código Error]", err);
      }
    }
    
    if (qr && !isCode && client && chatId && commandFlags[senderId]) {
      try {
        const msgQR = await client.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption }, { quoted: m });
        delete commandFlags[senderId];
        setTimeout(async () => {
          try {
            await client.sendMessage(chatId, { delete: msgQR.key });
          } catch {}
        }, 60000);
      } catch (err) {
        console.error("[QR Error]", err);
      }
    }
  });

  clientes.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (let raw of messages) {
      if (!raw.message) continue;
      let msg = await smsg(clientes, raw);
      try {
        handler(clientes, msg, messages);
      } catch (err) {
        console.log(chalk.gray(`[ ✿  ]  Sub » ${err}`));
      }
    }
  });

  try {
    await events(clientes, m);
  } catch (err) {
    console.log(chalk.gray(`[ BOT  ]  → ${err}`));
  }

  process.on('uncaughtException', console.error);
  return clientes;
}

async function joinChannels(client) {
  for (const value of Object.values(global.my)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await client.newsletterFollow(value).catch(err => console.log(chalk.gray(`\n[ ✿ ] Error al seguir el canal ${value}`)));
    }
  }
}

export default {
  command: ['code', 'qr'],
  category: 'socket',
  run: async ({client, m, args, command}) => {
    let user = await getUser(m.sender);
    let time = user.Subs + 120000 || '';
    
    if (new Date() - user.Subs < 120000) {
      return client.reply(
        m.chat,
        `❖ Debes esperar *${msToTime(time - new Date())}* para volver a intentar vincular un socket.`,
        m,
      );
    }

    const subsPath = path.join(dirname, '../../Sessions/Subs');
    const subsCount = fs.existsSync(subsPath)
      ? fs.readdirSync(subsPath).filter((dir) => {
          const credsPath = path.join(subsPath, dir, 'creds.json');
          return fs.existsSync(credsPath);
        }).length
      : 0;

    const maxSubs = 100;
    if (subsCount >= maxSubs) {
      return client.reply(
        m.chat,
        '✎ No se han encontrado espacios disponibles para registrar un `Sub-Bot`.',
        m,
      );
    }

    commandFlags[m.sender] = true;

    const rtx = '`✤` Vincula tu *cuenta* usando el *codigo.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Selecciona *Vincular con el número de teléfono*\n\nꕤ *`Importante`*\n> ₊·( 🜸 ) ➭ Este *Código* solo funciona en el *número que lo solicito*';
    const rtx2 = "`✤` Vincula tu *cuenta* usando *codigo qr.*\n\n> ✥ Sigue las *instrucciones*\n\n*›* Click en los *3 puntos*\n*›* Toque *dispositivos vinculados*\n*›* Vincular *nuevo dispositivo*\n*›* Escanea el código *QR.*\n\n> ₊·( 🜸 ) ➭ Recuerda que no es recomendable usar tu cuenta principal para registrar un socket.";

    const isCode = /^(code)$/.test(command);
    const isCommands = /^(code|qr)$/.test(command);
    const isCommand = isCommands ? true : false;
    const caption = isCode ? rtx : rtx2;
    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0];

    await startSubBot(m, client, caption, isCode, phone, m.chat, isCommand);
    user.Subs = new Date() * 1;

    await updateUser(m.sender, 'Subs', user.Subs);
  }
};

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes > 0 ? minutes : '';
  seconds = seconds < 10 && minutes > 0 ? '0' + seconds : seconds;
  if (minutes) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  } else {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
}
