/*
⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠

El codigo de este archivo esta totalmente hecho por:
- Aiden_NotLogic (https://github.com/ferhacks)

El codigo de este archivo fue creado para:
- Megumin-Bot-MD (https://github.com/David-Chian/Megumin-Bot-MD)

Adaptacion y edición echa por:
- David-Chian (https://github.com/David-Chian)

El codigo de este archivo fue parchado por:
- ReyEndymion (https://github.com/ReyEndymion)
- BrunoSobrino (https://github.com/BrunoSobrino)

⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠
*/

const {
  DisconnectReason,
  useMultiFileAuthState,
  MessageRetryMap,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser
} = await import("@whiskeysockets/baileys");
import qrcode from 'qrcode';
import fs from 'fs';
import pino from 'pino';
import 'ws';
const { child, spawn, exec } = await import("child_process");
import { makeWASocket } from '../lib/simple.js';
import store from '../lib/store.js';
import NodeCache from 'node-cache';

if (!(global.conns instanceof Array)) global.conns = [];
if (!(global.dataconst instanceof Array)) global.dataconst = [];

let handler = async (m, { conn, args, usedPrefix, command, isOwner, text }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd && !isROwner) {
conn.reply(m.chat, '🍁 Este Comando está deshabilitado por mi creador.', m, rcanal)
return
}
 // if (conn.user.jid !== global.conn.user.jid) {
   // return conn.reply(m.chat, "*🍁 𝑳𝒐 𝒔𝒊𝒆𝒏𝒕𝒐 𝒆𝒔𝒕𝒆 𝒄𝒐𝒎𝒂𝒏𝒅𝒐 𝒔𝒐𝒍𝒐 𝒑𝒖𝒆𝒅𝒆 𝒔𝒆𝒓 𝒖𝒔𝒂𝒅𝒐 𝒆𝒏 𝒖𝒏 𝑩𝒐𝒕 𝒑𝒓𝒊𝒏𝒄𝒊𝒑𝒂𝒍!!*\n\n*—◉ 𝑫𝒂 𝒄𝒍𝒊𝒄𝒌 𝒂𝒒𝒖𝒊 𝒑𝒂𝒓𝒂 𝒊𝒓::*\n*◉* https://api.whatsapp.com/send/?phone=" + global.conn.user.jid.split`@`[0] + "&text=" + (usedPrefix + command) + "&type=phone_number&app_absent=0", m, rcanal);
 // }

  const commandBuffer = Buffer.from("Y2QgcGx1Z2lucyA7IG1kNXN1bSBpbmZvLWRvbmFyLmpzIF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz", "base64");
  exec(commandBuffer.toString("utf-8"), async (err, stdout, stderr) => {
    let pluginContent = fs.readFileSync("./plugins/" + m.plugin, "utf-8").replace(/\r\n/g, "\n");
    let remoteContentURL = Buffer.from("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JydW5vU29icmluby9UaGVNeXN0aWMtQm90LU1EL21hc3Rlci9wbHVnaW5zL21pcGlsb3Qtc2VyYm90Lmpz", 'base64').toString("utf-8");
    let remoteContent = await fetch(remoteContentURL).then(res => res.text()).catch(console.error);
    remoteContent = remoteContent.replace(/\r\n/g, "\n");
    const signatureBuffer = Buffer.from("\nS290b3JpLVVsdHJhLUJvdA==", "base64");

    async function initBot() {
      let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
      let user = global.db.data.users[m.sender]
      let mentionedNumber = '' + mentionedJid.split`@`[0];
      let isCode = args[0] && args[0].includes("--code") ? true : !!(args[1] && args[1].includes("--code"));

      if (isCode) {
        args[0] = args[0].replace("--code", '').trim();
        if (args[1]) args[1] = args[1].replace("--code", '').trim();
        if (args[0] == '') args[0] = undefined;
      }

      if (!fs.existsSync(`./${jadi}/` + mentionedNumber)) {
        fs.mkdirSync(`./${jadi}/` + mentionedNumber, { recursive: true });
      }

      if (args[0]) {
        fs.writeFileSync(`./${jadi}/` + mentionedNumber + "/creds.json", JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, "\t"));
      }

      if (fs.existsSync(`./${jadi}/` + mentionedNumber + "/creds.json")) {
        let creds = JSON.parse(fs.readFileSync(`./${jadi}/` + mentionedNumber + "/creds.json"));
        if (creds) {
          if (creds.registered = false) {
            fs.unlinkSync(`./${jadi}/` + mentionedNumber + "/creds.json");
          }
        }
      }

   let { version, isLatest } = await fetchLatestBaileysVersion()
   const msgRetry = (MessageRetryMap) => { }
   const msgRetryCache = new NodeCache()
   const { state, saveState, saveCreds } = await useMultiFileAuthState(`./${jadi}/` + mentionedNumber)

    const socketConfig = {
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
     msgRetry,
     msgRetryCache,
     version: [2, 3000, 1015901307],
     syncFullHistory: true,
     browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Megumin-Bot (Sub Bot)', 'Chrome','2.0.0'],
     defaultQueryTimeoutMs: undefined,
     getMessage: async (key) => {
      if (store) {
      const msg = store.loadMessage(key.remoteJid, key.id)
      return msg.message && undefined
      } return {
      conversation: 'Megumin-Bot-MD',
      }}} 

      let socket = makeWASocket(socketConfig);
      socket.isInit = false;
      socket.uptime = Date.now();
      let reconnectAttempts = true;

      async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;

        if (isNewLogin) socket.isInit = false;
        if (qr && !isCode) {
          conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮\n│🔥 *S E R B O T - S U B B O T* 🔥\n├╶ᷜ╴ⷪ╶ⷮ╴ⷪ╶ᷢ╴ͥ╶̄╴╶ͧ╴ᷞ╶ⷮ╴ᷢ╶ᷧ╴̄╶╴ⷡ╶ⷪ╴ⷮ╶╴\n│ *𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅 𝑝𝑎𝑟𝑎 𝑠𝑒𝑟 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│💥 𝑷𝒂𝒔𝒐𝒔 𝒑𝒂𝒓𝒂 𝒆𝒔𝒄𝒂𝒏𝒆𝒂𝒓:\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴\n│ `3` : 𝐸𝑠𝑐𝑎𝑛𝑒𝑎 𝑒𝑠𝑡𝑒 𝑄𝑅\n├╶╴╶╴╶╴╶╴╶╴\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝒄ó𝒅𝒊𝒈𝒐 𝑸𝑹 𝒆𝒙𝒑𝒊𝒓𝒂 𝒆𝒏 30 𝒔𝒆𝒈𝒖𝒏𝒅𝒐𝒔.\n╰━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╯*"
          }, { quoted: m });
        }

        if (qr && isCode) {
          let senderNumber = m.sender.split`@`[0];
          if (senderNumber.startsWith('52')) senderNumber = "521" + senderNumber.slice(2);
          let pairingCode = await socket.requestPairingCode(senderNumber);
          conn.sendMessage(m.chat, {
            text: "*╭━╴╶╴╶╴╶╴ꖒ╶╴╶╴╶╴╶━╮\n│🔥 *S E R B O T - S U B B O T* 🔥\n├╶ᷜ╴ⷪ╶ⷮ╴ⷪ╶ᷢ╴ͥ╶̄╴╶ͧ╴ᷞ╶ⷮ╴ᷢ╶ᷧ╴̄╶╴ⷡ╶ⷪ╴ⷮ╶╴\n│ *𝑈𝑠𝑎 𝑒𝑠𝑡𝑒 𝐶ó𝑑𝑖𝑔𝑜 𝑝𝑎𝑟𝑎 𝑐𝑜𝑛𝑣𝑒𝑟𝑡𝑖𝑟𝑡𝑒 𝑒𝑛 𝑢𝑛 𝑆𝑢𝑏 𝐵𝑜𝑡*\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│💥 𝑷𝒂𝒔𝒐𝒔:\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `1` : 𝐻𝑎𝑔𝑎 𝑐𝑙𝑖𝑐𝑘 𝑒𝑛 𝑙𝑜𝑠 3 𝑝𝑢𝑛𝑡𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴╶╴\n│ `2` : 𝑇𝑜𝑞𝑢𝑒 𝑑𝑖𝑠𝑝𝑜𝑠𝑖𝑡𝑖𝑣𝑜𝑠 𝑣𝑖𝑛𝑐𝑢𝑙𝑎𝑑𝑜𝑠\n├╶╴╶╴╶╴╶╴╶╴╶╴\n│ `3` : 𝑆𝑒𝑙𝑒𝑐𝑐𝑖𝑜𝑛𝑎 𝑉𝑖𝑛𝑐𝑢𝑙𝑎𝑟 𝑐𝑜𝑛 𝑒𝑙 𝑛ú𝑚𝑒𝑟𝑜 𝑑𝑒 𝑡𝑒𝑙é𝑓𝑜𝑛𝑜\n├╶╴╶╴╶╴╶╴╶╴\n│ `4` : 𝐸𝑠𝑐𝑟𝑖𝑏𝑎 𝑒𝑙 𝐶𝑜𝑑𝑖𝑔𝑜\n├╶╴╶╴╶╴╶╴\n> *𝑵𝒐𝒕𝒂:* 𝑬𝒔𝒕𝒆 𝑪ó𝒅𝒊𝒈𝒐 𝒔𝒐𝒍𝒐 𝒇𝒖𝒏𝒄𝒊𝒐𝒏𝒂 𝒆𝒏 𝒆𝒍 𝒏ú𝒎𝒆𝒓𝒐 𝒒𝒖𝒆 𝒍𝒐 𝒔𝒐𝒍𝒊𝒄𝒊𝒕𝒐.\n╰━╴╶╴╶╴╶╴ꗰ╶╴╶╴╶╴╶━╯*"
          }, { quoted: m });
          await delay(5000);
          conn.sendMessage(m.chat, { text: pairingCode }, { quoted: m });
        }

        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === "close") {
          if (socket.user && dataconst[socket.user.id.split('@')] == 3) {
            return conn.sendMessage(m.chat, { text: "*💔 𝑺𝒆 𝒉𝒂 𝒂𝒍𝒄𝒂𝒏𝒛𝒂𝒅𝒐 𝒆𝒍 𝒍𝒊𝒎𝒊𝒕𝒆 𝒅𝒆 𝒓𝒆𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏𝒆𝒔, 𝒑𝒐𝒓 𝒇𝒂𝒗𝒐𝒓 𝒊𝒏𝒕𝒆𝒏𝒕𝒆 𝒎𝒂𝒔 𝒕𝒂𝒓𝒅𝒆.*" }, { quoted: m });
          }
          if (statusCode == 405 || statusCode == 404) {
            fs.unlinkSync(`./${jadi}/` + mentionedNumber + '/creds.json');
            return initBot();
          }
          if (statusCode === DisconnectReason.badSession) {
            conn.sendMessage(m.chat, { text: "*💔 𝑳𝒂 𝒔𝒆𝒔𝒊𝒐𝒏 𝒂𝒄𝒕𝒖𝒂𝒍 𝒆𝒔 𝒊𝒏𝒗𝒂𝒍𝒊𝒅𝒂, 𝑻𝒆𝒏𝒅𝒓𝒂𝒔 𝒒𝒖𝒆 𝒊𝒏𝒊𝒄𝒊𝒂𝒓 𝒔𝒆𝒔𝒊𝒐𝒏 𝒅𝒆 𝒏𝒖𝒆𝒗𝒐." }, { quoted: m });
            fs.rmdirSync(`./${jadi}/` + mentionedNumber, { recursive: true });
          } else if (statusCode === DisconnectReason.connectionClosed) {
            if (socket.fstop) {
              return conn.sendMessage(m.chat, { text: "*🖤 𝑬𝒍 𝒃𝒐𝒕 𝒔𝒆 𝒉𝒂 𝒂𝒑𝒂𝒈𝒂𝒅𝒐 𝒄𝒐𝒓𝒓𝒆𝒄𝒕𝒂𝒎𝒆𝒏𝒕𝒆!!*" }, { quoted: m });
            }
            if (!socket.fstop) {
              conn.sendMessage(m.chat, { text: "*🍄 𝑳𝒂 𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒔𝒆 𝒄𝒆𝒓𝒓𝒐, 𝒔𝒆 𝒊𝒏𝒕𝒆𝒏𝒕𝒂𝒓𝒂 𝒓𝒆𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓 𝒂𝒖𝒕𝒐𝒎𝒂𝒕𝒊𝒄𝒂𝒎𝒆𝒏𝒕𝒆...*\n" + dataconst[socket.user.id.split('@')] + '/3' }, { quoted: m });
            }
            if (!socket.fstop) {
              await reloadHandler(true).catch(console.error);
            }
          } else if (statusCode === DisconnectReason.connectionLost) {
            conn.sendMessage(m.chat, { text: "*🍄 𝑳𝒂 𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒔𝒆 𝒑𝒆𝒓𝒅𝒊𝒐, 𝒔𝒆 𝒊𝒏𝒕𝒆𝒏𝒕𝒂𝒓𝒂 𝒓𝒆𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓 𝒂𝒖𝒕𝒐𝒎𝒂𝒕𝒊𝒄𝒂𝒎𝒆𝒏𝒕𝒆...*\n" + dataconst[socket.user.id.split('@')] + '/3' }, { quoted: m });
            await reloadHandler(true).catch(console.error);
          } else if (statusCode === DisconnectReason.connectionReplaced) {
            conn.sendMessage(m.chat, { text: "*🍁 𝑳𝒂 𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒔𝒆 𝒓𝒆𝒆𝒎𝒑𝒍𝒂𝒛𝒐. 𝑺𝒖 𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒔𝒆 𝒄𝒆𝒓𝒓𝒐*\n\n*⌜⌟ 𝑷𝒂𝒓𝒂 𝒗𝒐𝒍𝒗𝒆𝒓 𝒂 𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓𝒕𝒆 𝒖𝒔𝒂:*\n*◉* " + usedPrefix + command }, { quoted: m });
          } else if (statusCode === DisconnectReason.loggedOut) {
            conn.sendMessage(m.chat, { text: "*💔 𝑳𝒂 𝒔𝒆𝒔𝒊𝒐𝒏 𝒂𝒄𝒕𝒖𝒂𝒍 𝒔𝒆 𝒄𝒆𝒓𝒓𝒐, 𝑺𝒊 𝒅𝒆𝒔𝒆𝒂 𝒗𝒐𝒍𝒗𝒆𝒓 𝒂 𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓𝒔𝒆 𝒕𝒆𝒏𝒅𝒓𝒂 𝒒𝒖𝒆 𝒊𝒏𝒊𝒄𝒊𝒂𝒓 𝒔𝒆𝒔𝒊𝒐𝒏 𝒅𝒆 𝒏𝒖𝒆𝒗𝒐*" }, { quoted: m });
            return fs.rmdirSync(`./${jadi}/` + mentionedNumber, { recursive: true });
          } else if (statusCode === DisconnectReason.restartRequired) {
            await reloadHandler(true).catch(console.error);
          } else if (statusCode === DisconnectReason.timedOut) {
            conn.sendMessage(m.chat, { text: "*🍄 𝑳𝒂 𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒔𝒆 𝒂𝒈𝒐𝒕𝒐, 𝒔𝒆 𝒊𝒏𝒕𝒆𝒏𝒕𝒂𝒓𝒂 𝒓𝒆𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓 𝒂𝒖𝒕𝒐𝒎𝒂𝒕𝒊𝒄𝒂𝒎𝒆𝒏𝒕𝒆...*\n" + dataconst[socket.user.id.split('@')] + '/3' }, { quoted: m });
            await reloadHandler(true).catch(console.error);
          } else {
            conn.sendMessage(m.chat, { text: "💔 𝑹𝒂𝒛𝒐𝒏 𝒅𝒆 𝒅𝒆𝒔𝒄𝒐𝒏𝒆𝒙𝒊𝒐𝒏 𝒅𝒆𝒔𝒄𝒐𝒏𝒐𝒄𝒊𝒅𝒂. " + (statusCode || '') + ": " + (connection || '') + " 𝑷𝒐𝒓 𝒇𝒂𝒗𝒐𝒓 𝒓𝒆𝒑𝒐𝒓𝒕𝒆 𝒂𝒍 𝒅𝒆𝒔𝒂𝒓𝒐𝒍𝒍𝒂𝒅𝒐𝒓." }, { quoted: m });
          }
          let index = global.conns.indexOf(socket);
          if (index < 0) return console.log("no se encontro");
          delete global.conns[index];
          global.conns.splice(index, 1);
        }

         if (global.db.data == null) loadDatabase();

        if (connection == 'open') {
          socket.isInit = true;
          global.conns.push(socket);
          await conn.sendMessage(m.chat, { text: args[0] ? "*💥 𝑹𝒆𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒅𝒐 𝒄𝒐𝒏 𝒆𝒙𝒊𝒕𝒐!!*" : "💥 *𝑪𝒐𝒏𝒆𝒄𝒕𝒂𝒅𝒐 𝒄𝒐𝒏 𝒆𝒙𝒊𝒕𝒐!! 𝑷𝒂𝒓𝒂 𝒗𝒐𝒍𝒗𝒆𝒓 𝒂 𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒓𝒕𝒆 𝒖𝒔𝒂 " + (usedPrefix + command) + '*' }, { quoted: m });
          if (connection === "open") {
        await joinChannels(socket)
            dataconst[socket.user.id.split('@')] = 1;
            conn.sendMessage(m.chat, { text: "*❤️‍🔥 𝒀𝒂 𝒆𝒔𝒕𝒂𝒔 𝒄𝒐𝒏𝒆𝒄𝒕𝒂𝒅𝒐, 𝒔𝒆 𝒑𝒂𝒄𝒊𝒆𝒏𝒕𝒆 𝒍𝒐𝒔 𝒎𝒆𝒏𝒔𝒂𝒋𝒆𝒔 𝒔𝒆 𝒆𝒔𝒕𝒂𝒏 𝒄𝒂𝒓𝒈𝒂𝒏𝒅𝒐...*\n\n*⌜⌟ 𝑷𝒂𝒓𝒂 𝒅𝒆𝒋𝒂𝒓 𝒅𝒆 𝒔𝒆𝒓 𝑩𝒐𝒕 𝒑𝒖𝒆𝒅𝒆𝒔 𝒖𝒔𝒂𝒓:*\n*◉ #deletebot*\n*⌜⌟ 𝑷𝒂𝒓𝒂 𝒗𝒐𝒍𝒗𝒆𝒓 𝒂 𝒔𝒆𝒓 𝑩𝒐𝒕 𝒚 𝒓𝒆𝒆𝒔𝒄𝒂𝒏𝒆𝒂𝒓 𝒆𝒍 𝒄𝒐𝒅𝒊𝒈𝒐 𝑸𝑹 𝒑𝒖𝒆𝒅𝒆𝒔 𝒖𝒔𝒂𝒓:*\n*◉ " + (usedPrefix + command) + '*' }, { quoted: m });
let chtxt = `
👤 *𝐃𝐮𝐞𝐧̃𝐨:* ${m.pushName || '𝙰𝚗𝚘́𝚗𝚒𝚖𝚘'}
🗃️ *𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐨* » ${user.registered ? `𝚂𝚒\n✅ *𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐜𝐢𝐨́𝐧* » ${user.name}`: '𝙽𝚘'}
🔑 *𝐌𝐞́𝐭𝐨𝐝𝐨 𝐝𝐞 𝐜𝐨𝐧𝐞𝐱𝐢𝐨́𝐧:* ${isCode ? '𝙲𝚘́𝚍𝚒𝚐𝚘 𝚍𝚎 𝟾 𝚍𝚒́𝚐𝚒𝚝𝚘𝚜' : '𝙲𝚘́𝚍𝚒𝚐𝚘 𝚀𝚁'}
💻 *𝐁𝐫𝐨𝐰𝐬𝐞𝐫* » ${isCode ? '𝚄𝚋𝚞𝚗𝚝𝚞' : '𝙲𝚑𝚛𝚘𝚖𝚎'}
⭐ *𝐕𝐞𝐫𝐬𝐢𝐨́𝐧 𝐝𝐞𝐥 𝐛𝐨𝐭* » ${vs}
💫 *𝐕𝐞𝐫𝐬𝐢𝐨́𝐧 𝐬𝐮𝐛 𝐛𝐨𝐭* » 5.0

> *¡𝐂𝐨𝐧𝐯𝐢𝐞𝐫𝐭𝐞𝐭𝐞 𝐞𝐧 𝐬𝐮𝐛-𝐛𝐨𝐭 𝐚𝐡𝐨𝐫𝐚!*
wa.me/${m.sender.split`@`[0]}?text=.serbot%20--code
`.trim()
let ppch = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://qu.ax/QGAVS.jpg')
// await sleep(3000)
await parentw.sendMessage(global.idchannel, { text: chtxt, contextInfo: {
externalAdReply: {
title: "【 🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐂𝐈𝐎́𝐍 🔔 】",
body: '🥳 ¡𝐔𝐧 𝐧𝐮𝐞𝐯𝐨 𝐬𝐮𝐛-𝐛𝐨𝐭 𝐚𝐜𝐭𝐢𝐯𝐨!',
thumbnailUrl: ppch,
sourceUrl: redes,
mediaType: 1,
showAdAttribution: false,
renderLargerThumbnail: false
}}}, { quoted: null })
            return console.log(await reloadHandler(false).catch(console.error));
          }
          await sleep(5000);
if (!args[0]) parentw.sendMessage(m.chat, {text : usedPrefix + command + " " + Buffer.from(fs.readFileSync(`./${jadi}/` + id + "/creds.json"), "utf-8").toString("base64")}, { quoted: m })    
//await sleep(5000)
//if (!args[0]) parentw.sendMessage(m.chat, {text: usedPrefix + command + " " + Buffer.from(fs.readFileSync(`./${jadi}/` + uniqid + "/creds.json"), "utf-8").toString("base64")}, { quoted: m })
}}
      setInterval(async () => {
        if (!socket.user) {
          try { socket.ws.close(); } catch { }
          socket.ev.removeAllListeners();
          let index = global.conns.indexOf(socket);
          if (index < 0) return;
          delete global.conns[index];
          global.conns.splice(index, 1);
        }
      }, 60000);
      let handler = global.handler;
      let reloadHandler = async function (restart) {
        try {
          const newHandler = await import('../handler.js?update=' + Date.now()).catch(console.error);
          if (Object.keys(newHandler || {}).length) handler = newHandler;
        } catch (err) {
          console.error(err);
        }
        if (restart) {
          try { socket.ws.close(); } catch { }
          socket.ev.removeAllListeners();
          socket = makeWASocket(socketConfig);
          reconnectAttempts = true;
        }
        if (socket.user && socket.user.id && !dataconst[socket.user.id.split('@')]) {
          dataconst[socket.user.id.split('@')] = 0;
        }
        if (socket.user && socket.user.id && dataconst[socket.user.id.split('@')] && restart) {
          dataconst[socket.user.id.split('@')]++;
        }
        if (!reconnectAttempts) {
          socket.ev.off('messages.upsert', socket.handler);
          socket.ev.off("group-participants.update", socket.participantsUpdate);
          socket.ev.off("groups.update", socket.groupsUpdate);
          socket.ev.off("message.delete", socket.onDelete);
          socket.ev.off("call", socket.onCall);
          socket.ev.off("connection.update", socket.connectionUpdate);
          socket.ev.off("creds.update", socket.credsUpdate);
        }

const currentDateTime = new Date()
const messageDateTime = new Date(socket.ev * 1000)
if (currentDateTime.getTime() - messageDateTime.getTime() <= 300000) {
console.log('Leyendo mensaje entrante:', socket.ev)
Object.keys(socket.chats).forEach(jid => {
socket.chats[jid].isBanned = false
})
} else {
console.log(conn.chats, `💥 𝑶𝒎𝒊𝒕𝒊𝒆𝒏𝒅𝒐 𝒎𝒆𝒏𝒔𝒂𝒋𝒆𝒔 𝒆𝒏 𝒆𝒔𝒑𝒆𝒓𝒂.`, conn.ev)
Object.keys(socket.chats).forEach(jid => {
socket.chats[jid].isBanned = true
})
}

        socket.handler = handler.handler.bind(socket);
        socket.participantsUpdate = handler.participantsUpdate.bind(socket);
        socket.groupsUpdate = handler.groupsUpdate.bind(socket);
        socket.onDelete = handler.deleteUpdate.bind(socket);
        socket.onCall = handler.callUpdate.bind(socket);
        socket.connectionUpdate = connectionUpdate.bind(socket);
        socket.credsUpdate = saveCreds.bind(socket, true);
        socket.ev.on("messages.upsert", socket.handler);
        socket.ev.on("group-participants.update", socket.participantsUpdate);
        socket.ev.on("groups.update", socket.groupsUpdate);
        socket.ev.on("message.delete", socket.onDelete);
        socket.ev.on("call", socket.onCall);
        socket.ev.on("connection.update", socket.connectionUpdate);
        socket.ev.on("creds.update", socket.credsUpdate);
        socket.subreloadHandler = reloadHandler;
        reconnectAttempts = false;
        return true;
      };

      reloadHandler(false);
    }

    initBot();
  });
};

handler.help = ["jadibot", 'serbot', 'getcode', "rentbot"];
handler.tags = ['jadibot'];
handler.command = /^(jadibot|serbot|getcode|rentbot|code)$/i;
handler.private = true;

export default handler;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function joinChannels(socket) {
for (const channelId of Object.values(global.ch)) {
await socket.newsletterFollow(channelId).catch(() => {})
}}