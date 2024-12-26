const { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys');
import moment from 'moment-timezone';
import NodeCache from 'node-cache';
import readline from 'readline';
import qrcode from 'qrcode';
import fs from 'fs';
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws;
import { Boom } from '@hapi/boom';
import { makeWASocket } from '../lib/simple.js';

if (!Array.isArray(global.conns)) {
  global.conns = [];
}

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner }) => {
  let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn;
  if (!((args[0] && args[0] == 'plz') || (await global.conn).user.jid == _conn.user.jid)) {
    return m.reply(`Este comando solo puede ser usado en el bot principal! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`);
  }

  async function serbot() {
    let authFolderB = m.sender.split('@')[0];
    if (!fs.existsSync(`./serbot/${authFolderB}`)) {
      fs.mkdirSync(`./serbot/${authFolderB}`, { recursive: true });
    }
    if (args[0]) {
      fs.writeFileSync(`./serbot/${authFolderB}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8')), null, '\t'));
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./serbot/${authFolderB}`);
    const msgRetryCounterMap = (MessageRetryMap) => {};
    const msgRetryCounterCache = new NodeCache();
    const { version } = await fetchLatestBaileysVersion();
    let phoneNumber = m.sender.split('@')[0];

    const methodCodeQR = process.argv.includes('qr');
    const methodCode = !!phoneNumber || process.argv.includes('code');
    const MethodMobile = process.argv.includes('mobile');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

    const connectionOptions = {
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      mobile: MethodMobile,
      browser: methodCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Senko San (Sub-Bot)', 'Chrome', '2.0.0'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'silent' })),
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return msg.message && undefined;
        }
        return {
          conversation: 'SenkoBot-MD',
        };
      },
      msgRetryCounterCache,
      msgRetryCounterMap,
      defaultQueryTimeoutMs: undefined,
      version: [2, 3000, 1015901307],
      syncFullHistory: true
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
        codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot;
        let txt = `✿ *Vincula tu cuenta usando el código.*\n\n`;
        txt += `[ ✰ ] Sigue las instrucciones:\n`;
        txt += `*» Mas opciones*\n`;
        txt += `*» Dispositivos vinculados*\n`;
        txt += `*» Vincular nuevo dispositivo*\n`;
        txt += `*» Vincular usando número*\n\n`;
        txt += `> *Nota:* Este código solo funciona en el número que lo solicitó`;
        let sendTxt = await parent.reply(m.chat, txt, m, rcanal);
        let sendCode = await parent.reply(m.chat, codeBot, m, rcanal);

        setTimeout(() => {
          parent.sendMessage(m.chat, { delete: sendTxt.key });
          parent.sendMessage(m.chat, { delete: sendCode.key });
        }, 30000);
        rl.close();
      }, 3000);
    }

    conn.isInit = false;
    let isInit = true;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update;
      if (isNewLogin) conn.isInit = true;
      const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
      const reason = lastDisconnect?.error?.output?.payload?.message;

      if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
        let i = global.conns.indexOf(conn);
        if (i < 0) return console.log(await creloadHandler(true).catch(console.error));
        delete global.conns[i];
        global.conns.splice(i, 1);

        if (code !== DisconnectReason.connectionClosed) {
          parent.sendMessage(m.chat, { text: 'Conexión perdida...' }, { quoted: m });
        }
      }

      if (reason == 405) {
        await fs.unlinkSync(`./serbot/${authFolderB}/creds.json`);
        return await m.reply(`✐ Reenvía nuevamente el comando.`);
      } else if (reason === DisconnectReason.restartRequired) {
        jddt();
        return console.log(`\n𖢺 Tiempo de la conexión agotado, reconectando...`);
      } else if (reason === DisconnectReason.loggedOut) {
        sleep(4000);
        await m.reply(`✧ *La conexión se ha cerrado, tendrás que volver a conectarte usando:*\n> » #serbot`);
        return fs.rmdirSync(`./serbot/${authFolderB}`, { recursive: true });
      } else if (reason == 428) {
        await endSesion(false);
        return m.reply(`✿ La conexión se ha cerrado de manera inesperada, intentaremos reconectar...`);
      } else if (reason === DisconnectReason.connectionLost) {
        await jddt();
        return console.log(`\n✦ Conexión perdida con el servidor, reconectando...`);
      } else if (reason === DisconnectReason.badSession) {
        return await m.reply(`❀ La conexión se ha cerrado, deberás conectarte manualmente.`);
      } else if (reason === DisconnectReason.timedOut) {
        await endSesion(false);
        return console.log(`\n✰ Tiempo de la conexión agotado, reconectando...`);
      } else {
        console.log(`\n★ Razón de la desconexión desconocida: ${reason || ''} >> ${connection || ''}`);
      }

      if (global.db.data == null) loadDatabase();
      if (connection == 'open') {
        conn.isInit = true;
        global.conns.push(conn);
        await conn.reply(m.chat, args[0] ? 'Conectado con éxito' : 'Conectado exitosamente con WhatsApp\n\n*Nota:* Esto es temporal\nSi el Bot principal se reinicia o se desactiva, todos los sub bots también lo harán\n\nEl número del bot puede cambiar, guarda este enlace:\n*-* https://whatsapp.com/channel/0029VaBfsIwGk1FyaqFcK91S', m, rcanal);
        await sleep(5000);
       // if (args[0]) return;

       // await parent.reply(conn.user.jid, `La siguiente vez que se conecte envía el siguiente mensaje para iniciar sesión sin utilizar otro código `, m, rcanal);
       // await parent.sendMessage(conn.user.jid, { text: usedPrefix + command + ' ' + Buffer.from(fs.readFileSync(`./serbot/${authFolderB}/creds.json`), 'utf-8').toString('base64') }, { quoted: m });
      }
    }
    const timeoutId = setTimeout(() => {
        if (!conn.user) {
            try {
                conn.ws.close();
            } catch {}
            conn.ev.removeAllListeners();
            let i = global.conns.indexOf(conn);
            if (i >= 0) {
                delete global.conns[i];
                global.conns.splice(i, 1);
            }
            fs.rmdirSync(`./serbot/${serbotFolder}`, { recursive: true });
        }
    }, 30000);

    let handler = await import("../handler.js");

    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) {
          handler = Handler;
        }
      } catch (e) {
        console.error(e);
      }
      if (restatConn) {
        try {
          conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners();
        conn = makeWASocket(connectionOptions);
        isInit = true;
      }
      if (!isInit) {
        conn.ev.off("messages.upsert", conn.handler);
        conn.ev.off("connection.update", conn.connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
      }
      conn.handler = handler.handler.bind(conn);
      conn.connectionUpdate = connectionUpdate.bind(conn);
      conn.credsUpdate = saveCreds.bind(conn, true);

      conn.ev.on("messages.upsert", conn.handler);
      conn.ev.on("connection.update", conn.connectionUpdate);
      conn.ev.on("creds.update", conn.credsUpdate);
      isInit = false;
      return true;
    };
    creloadHandler(false);
  }
  serbot();
}

handler.help = ["code"];
handler.tags = ["serbot"];
handler.command = ['code'];

export default handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}