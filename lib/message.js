import {
  proto,
  delay,
  areJidsSameUser,
  generateWAMessage,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  generateMessageID,
  generateWAMessageContent,
  getContentType,
  getDevice,
  extractMessageContent,
} from '@whiskeysockets/baileys';
import { resolveLidToRealJid } from "./utils.js"
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { sizeFormatter } from 'human-readable';
import util from 'util';
import * as Jimp from 'jimp';
import fetch from 'node-fetch';
import FileType from 'file-type';
import path from 'path';
import exif from './exif.js';
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = exif;

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

export {unixTimestampSeconds};

export function generateMessageTag(epoch) {
  let tag = (0, exports.unixTimestampSeconds)().toString()
  if (epoch) tag += '.--' + epoch
  return tag
}

export function processTime(timestamp, now) {
  return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

export function getRandom(ext) {
  return `${Math.floor(Math.random() * 10000)}${ext}`
}

export async function getBuffer(url, options) {
  try {
    options ? options : {}
    const res = await axios({
      method: 'get',
      url,
      headers: {
        DNT: 1,
        'Upgrade-Insecure-Request': 1,
      },
      ...options,
      responseType: 'arraybuffer',
    })
    return res.data
  } catch (err) {
    return err
  }
}

export async function fetchJson(url, options) {
  try {
    options ? options : {}
    const res = await axios({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
      },
      ...options,
    })
    return res.data
  } catch (err) {
    return err
  }
}

export function runtime(seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor((seconds % (3600 * 24)) / 3600)
  var m = Math.floor((seconds % 3600) / 60)
  var s = Math.floor(seconds % 60)
  var dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : ''
  var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : ''
  var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : ''
  var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':')
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isUrl(url) {
  return url.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      'gi',
    ),
  )
}

export function getTime(format, date) {
  if (date) {
    return moment(date).locale('id').format(format)
  } else {
    return moment.tz('America/Bogota').locale('id').format(format)
  }
}

export function sanitizeFileName(str) {
  return str
    .replace(/[<>:"/\\|?*]/g, '')
    .substring(0, 64)
    .trim()
}

export function formatDate(n, locale = 'id') {
  let d = new Date(n)
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export function tanggal(numer) {
  myMonths = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'diciembre',
  ]
  myDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  var tgl = new Date(numer)
  var day = tgl.getDate()
  bulan = tgl.getMonth()
  var thisDay = tgl.getDay(),
    thisDay = myDays[thisDay]
  var yy = tgl.getYear()
  var year = yy < 1000 ? yy + 1900 : yy
  const time = moment.tz('America/Bogota').format('DD/MM HH:mm:ss')
  let d = new Date()
  let locale = 'id'
  let gmt = new Date(0).getTime() - new Date('1 Enero 1970').getTime()
  let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor((d * 1 + gmt) / 84600000) % 5]
  return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`
}

export var formatp = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

export function jsonformat(string) {
  return JSON.stringify(string, null, 2)
}

function format(...args) {
  return util.format(...args)
}

export function logic(check, inp, out) {
  if (inp.length !== out.length)
    throw new Error('La entrada y la salida deben tener la misma longitud')
  for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
  return null
}

export async function generateProfilePicture(buffer) {
  const jimp = await Jimp.read(buffer)
  const min = jimp.getWidth()
  const max = jimp.getHeight()
  const cropped = jimp.crop(0, 0, min, max)
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
  }
}

export function bytesToSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getSizeMedia(path) {
  return new Promise((resolve, reject) => {
    if (/http/.test(path)) {
      axios.get(path).then((res) => {
        let length = parseInt(res.headers['content-length'])
        let size = exports.bytesToSize(length, 3)
        if (!isNaN(length)) resolve(size)
      })
    } else if (Buffer.isBuffer(path)) {
      let length = Buffer.byteLength(path)
      let size = exports.bytesToSize(length, 3)
      if (!isNaN(length)) resolve(size)
    } else {
      reject('error')
    }
  })
}

export function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

export function parseMention(text = '') {
  return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')
}

export function getGroupAdmins(participants) {
  let admins = []
  for (let i of participants) {
    i.admin === 'superadmin' ? admins.push(i.id) : i.admin === 'admin' ? admins.push(i.id) : ''
  }
  return admins || []
}

export async function fixLid(client, m) {
  const decodedJid = client.decodeJid(
    (m.fromMe && client.user.id) || m.key.participant || m.chat || ''
  )

  const realJid = await resolveLidToRealJid(decodedJid, client, m.chat)

  return realJid
}

export async function fixLid2(client, m) {
  const decodedJid = client.decodeJid(m.msg.contextInfo.participant)

  const realJid = await resolveLidToRealJid(decodedJid, client, m.chat)

  return realJid
}


export async function smsg(client, m, store) {
  client.downloadMediaMessage = async (message) => {
    const msg = message.msg || message
    const mime = msg.mimetype || ''
    const messageType = (message.type || mime.split('/')[0]).replace(/Message/gi, '')
    const stream = await downloadContentFromMessage(msg, messageType)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
  }

  const botLid = client.decodeJid(client.user.lid)
  const botNumber = client.decodeJid(client.user.id)
  let fix = ''
  if (!m) return m
  if (m.key) {
    m.id = m.key.id
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isBot =
      ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some(
        (a) => m.id.startsWith(a) && [12, 16, 20, 22, 40].includes(m.id.length),
      ) ||
      /(.)\1{5,}|[^a-zA-Z0-9]|[^0-9A-F]/.test(m.id) ||
      false
    m.isGroup = m.chat.endsWith('@g.us')
   // if (!m.isGroup && m.chat.endsWith('@lid')) m.chat = client.findJidByLid(m.chat) || m.chat
   if (!m.isGroup && m.chat.endsWith('@lid')) {
   if (typeof client.findJidByLid === 'function') {
    m.chat = client.findJidByLid(m.chat) || m.chat
   } else {
    m.chat = m.chat 
   }}
 
   //  m.sender = client.decodeJid((m.fromMe && client.user.id) || m.key.participant)

     m.sender = await fixLid(client, m)
   }
  if (m.message) {
    m.type = getContentType(m.message) || Object.keys(m.message)[0]
    m.msg = /viewOnceMessage|viewOnceMessageV2Extension|editedMessage|ephemeralMessage/i.test(
      m.type,
    )
      ? m.message[m.type].message[getContentType(m.message[m.type].message)]
      : extractMessageContent(m.message[m.type]) || m.message[m.type]
    m.body =
      m.message?.conversation ||
      m.msg?.text ||
      m.msg?.conversation ||
      m.msg?.caption ||
      m.msg?.selectedButtonId ||
      m.msg?.singleSelectReply?.selectedRowId ||
      m.msg?.selectedId ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      m.msg?.title ||
      m.msg?.name ||
      ''
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
    m.text =
      m.msg?.text ||
      m.msg?.caption ||
      m.message?.conversation ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      m.msg?.title ||
      ''
    m.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.body)
      ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0]
      : /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi.test(m.body)
        ? m.body.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gi)[0]
        : ''
    m.command = m.body && m.body.replace(m.prefix, '').trim().split(/ +/).shift()
    m.args =
      m.body
        ?.trim()
        .replace(new RegExp('^' + m.prefix?.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&'), 'i'), '')
        .replace(m.command, '')
        .split(/ +/)
        .filter((a) => a) || []
    m.device = getDevice(m.id)
    m.expiration =
      m.msg?.contextInfo?.expiration ||
      m?.metadata?.ephemeralDuration ||
      client?.messages?.[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration ||
      0
    m.timestamp =
      (typeof m.messageTimestamp === 'number'
        ? m.messageTimestamp
        : m.messageTimestamp.low
          ? m.messageTimestamp.low
          : m.messageTimestamp.high) || m.msg.timestampMs * 1000
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath
    if (m.isMedia) {
      m.mime = m.msg?.mimetype
      m.size = m.msg?.fileLength
      m.height = m.msg?.height || ''
      m.width = m.msg?.width || ''
      if (/webp/i.test(m.mime)) {
        m.isAnimated = m.msg?.isAnimated
      }
    }
    m.quoted = m.msg?.contextInfo?.quotedMessage || null
    if (m.quoted) {
      m.quoted.message = extractMessageContent(m.msg?.contextInfo?.quotedMessage)
      m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0]
      m.quoted.id = m.msg.contextInfo.stanzaId
      m.quoted.device = getDevice(m.quoted.id)
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
      m.quoted.isBot = m.quoted.id
        ? ['HSK', 'BAE', 'B1E', '3EB0', 'B24E', 'WA'].some(
            (a) => m.quoted.id.startsWith(a) && [12, 16, 20, 22, 40].includes(m.quoted.id.length),
          ) || /(.)\1{5,}|[^a-zA-Z0-9]|[^0-9A-F]/.test(m.quoted.id)
        : false
      if (m.msg?.contextInfo?.participant?.endsWith('@lid'))
        m.msg.contextInfo.participant =
          m?.metadata?.participants?.find((a) => a.lid === m.msg.contextInfo.participant)?.id ||
          m.msg.contextInfo.participant
      m.quoted.sender = await fixLid2(client, m)
      m.quoted.fromMe = m.quoted.sender === client.decodeJid(client.user.id)
      m.quoted.text =
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        ''
      m.quoted.msg =
        extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type]
      m.quoted.mentionedJid = m.quoted?.msg?.contextInfo?.mentionedJid || []
      m.quoted.body =
        m.quoted.msg?.text ||
        m.quoted.msg?.caption ||
        m.quoted?.message?.conversation ||
        m.quoted.msg?.selectedButtonId ||
        m.quoted.msg?.singleSelectReply?.selectedRowId ||
        m.quoted.msg?.selectedId ||
        m.quoted.msg?.contentText ||
        m.quoted.msg?.selectedDisplayText ||
        m.quoted.msg?.title ||
        m.quoted?.msg?.name ||
        ''
      m.getQuotedObj = async () => {
        if (!m.quoted.id) return false
        let q = await store.loadMessage(m.chat, m.quoted.id)
        return await exports.smsg(client, q)
      }
      m.quoted.key = {
        remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
        participant: m.quoted.sender,
        fromMe: areJidsSameUser(
          client.decodeJid(m.msg?.contextInfo?.participant),
          client.decodeJid(client?.user?.id),
        ),
        id: m.msg?.contextInfo?.stanzaId,
      }
      m.quoted.isGroup = m.quoted.chat.endsWith('@g.us')
      m.quoted.mentions = m.quoted.msg?.contextInfo?.mentionedJid || []
      m.quoted.body =
        m.quoted.msg?.text ||
        m.quoted.msg?.caption ||
        m.quoted?.message?.conversation ||
        m.quoted.msg?.selectedButtonId ||
        m.quoted.msg?.singleSelectReply?.selectedRowId ||
        m.quoted.msg?.selectedId ||
        m.quoted.msg?.contentText ||
        m.quoted.msg?.selectedDisplayText ||
        m.quoted.msg?.title ||
        m.quoted?.msg?.name ||
        ''
      m.quoted.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.quoted.body)
        ? m.quoted.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0]
        : /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi.test(m.quoted.body)
          ? m.quoted.body.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gi)[0]
          : ''
      m.quoted.command =
        m.quoted.body && m.quoted.body.replace(m.quoted.prefix, '').trim().split(/ +/).shift()
      m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath
      if (m.quoted.isMedia) {
        m.quoted.fileSha256 = m.quoted[m.quoted.type]?.fileSha256 || ''
        m.quoted.mime = m.quoted.msg?.mimetype
        m.quoted.size = m.quoted.msg?.fileLength
        m.quoted.height = m.quoted.msg?.height || ''
        m.quoted.width = m.quoted.msg?.width || ''
        if (/webp/i.test(m.quoted.mime)) {
          m.quoted.isAnimated = m?.quoted?.msg?.isAnimated || false
        }
      }
      m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
        },
        message: m.quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {}),
      })
      m.quoted.download = () => client.downloadMediaMessage(m.quoted)
      m.quoted.delete = () => {
        client.sendMessage(m.quoted.chat, {
          delete: {
            remoteJid: m.quoted.chat,
            fromMe: m.isBotAdmin ? false : true,
            id: m.quoted.id,
            participant: m.quoted.sender,
          },
        })
      }
    }
  }

  m.download = () => client.downloadMediaMessage(m)

  m.copy = () =>
    exports.smsg(client, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)))

  m.react = (u) => client.sendMessage(m.chat, { react: { text: u, key: m.key } })

  m.reply = async (content, options = {}) => {
    const quoted = m
    const chat = m.chat
    const caption = ''
    const ephemeralExpiration = m.expiration
    const mentions = ''
    if (typeof content === 'object') {
      return client.sendMessage(chat, content, {
        ...options,
        quoted,
        ephemeralExpiration,
      })
    } else if (typeof content === 'string') {
      try {
        if (/^https?:\/\//.test(content)) {
          const data = await axios.get(content, { responseType: 'arraybuffer' })
          const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data)).mime
          if (/gif|image|video|audio|pdf|stream/i.test(mime)) {
            return client.sendMedia(chat, data.data, '', caption, quoted, content)
          } else {
            return client.sendMessage(
              chat,
              { text: content, mentions, ...options },
              { quoted, ephemeralExpiration },
            )
          }
        } else {
          return client.sendMessage(
            chat,
            { text: content, mentions, ...options },
            { quoted, ephemeralExpiration },
          )
        }
      } catch (e) {
        return client.sendMessage(
          chat,
          { text: content, mentions, ...options },
          { quoted, ephemeralExpiration },
        )
      }
    }
  }

  m.copy = () => exports.smsg(client, M.fromObject(M.toObject(m)))

  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    client.copyNForward(jid, m, forceForward, options)

  client.getName = (jid, withoutContact = false) => {
    // jid = m.chat?
    id = client.decodeJid(jid)
    withoutContact = client.withoutContact || withoutContact
    let v
    if (id.endsWith('@g.us'))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {}
        if (!(v.name || v.subject)) v = client.groupMetadata(id) || {}
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'),
        )
      })
    else
      v =
        id === '0@s.whatsapp.net'
          ? { id, name: 'WhatsApp' }
          : id === client.decodeJid(client.user.jid)
            ? client.user
            : store.contacts[id] || {}
    return (
      (withoutContact ? '' : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    )
  }

  client.getFile = async (PATH, saveToFile = false) => {
    let res, filename
    const data = Buffer.isBuffer(PATH)
      ? PATH
      : PATH instanceof ArrayBuffer
        ? PATH.toBuffer()
        : /^data:.*?\/.*?;base64,/i.test(PATH)
          ? Buffer.from(PATH.split`,`[1], 'base64')
          : /^https?:\/\//.test(PATH)
            ? await (res = await fetch(PATH)).buffer()
            : fs.existsSync(PATH)
              ? ((filename = PATH), fs.readFileSync(PATH))
              : typeof PATH === 'string'
                ? PATH
                : Buffer.alloc(0)
    if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
    const type = (await FileType.fromBuffer(data)) || {
      mime: 'application/octet-stream',
      ext: '.bin',
    }
    if (data && saveToFile && !filename)
      ((filename = path.join(__dirname, '../tmp/' + new Date() * 1 + '.' + type.ext)),
        await fs.promises.writeFile(filename, data))
    return {
      res,
      filename,
      ...type,
      data,
      deleteFile() {
        return filename && fs.promises.unlink(filename)
      },
    }
  }

  m.react = (text, key, options) => client.sendMessage(m.chat, { react: { text, key: m.key } })

  client.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')
  }

  client.appenTextMessage = async (text, chatUpdate) => {
    let messages = await generateWAMessage(
      m.chat,
      { text: text, mentions: m.mentionedJid },
      {
        userJid: client.user.id,
        quoted: m.quoted && m.quoted.fakeObj,
      },
    )
    messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id)
    messages.key.id = m.key.id
    messages.pushName = m.pushName
    if (m.isGroup) messages.participant = m.sender
    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)],
      type: 'append',
    }
    conn.ev.emit('messages.upsert', msg)
  }

  client.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0)
    let buffer
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options)
    } else {
      buffer = await imageToWebp(buff)
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
  }
  client.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], 'base64')
        : /^https?:\/\//.test(path)
          ? await await getBuffer(path)
          : fs.existsSync(path)
            ? fs.readFileSync(path)
            : Buffer.alloc(0)
    let buffer
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options)
    } else {
      buffer = await videoToWebp(buff)
    }
    await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
  }

  client.sendButton = async (
    jid,
    text = '',
    footer = '',
    buffer,
    buttons,
    copy,
    urls,
    quoted,
    options,
  ) => {
    let img, video

    if (/^https?:\/\//i.test(buffer)) {
      try {
        const response = await fetch(buffer)
        const contentType = response.headers.get('content-type')
        if (/^image\//i.test(contentType)) {
          img = await prepareWAMessageMedia(
            { image: { url: buffer } },
            { upload: client.waUploadToServer },
          )
        } else if (/^video\//i.test(contentType)) {
          video = await prepareWAMessageMedia(
            { video: { url: buffer } },
            { upload: client.waUploadToServer },
          )
        } else {
          console.error('Tipo MIME no compatible:', contentType)
        }
      } catch (error) {
        console.error('Error al obtener el tipo MIME:', error)
      }
    } else {
      try {
        const type = await client.getFile(buffer)
        if (/^image\//i.test(type.mime)) {
          img = await prepareWAMessageMedia(
            { image: { url: buffer } },
            { upload: client.waUploadToServer },
          )
        } else if (/^video\//i.test(type.mime)) {
          video = await prepareWAMessageMedia(
            { video: { url: buffer } },
            { upload: client.waUploadToServer },
          )
        }
      } catch (error) {
        console.error('Error al obtener el tipo de archivo:', error)
      }
    }

    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}
    const botname = botSettings.namebot || ''
    const botname2 = botSettings.namebot2 || ''
    const icon = botSettings.banner || ''
    const canales = Object.entries(global.my)
  .reduce((acc, [key, value]) => {
    if (key.startsWith('ch')) {
      const index = key.slice(2)
      const nombre = global.my[`name${index}`];
      if (nombre) acc.push({ id: value, nombre })
    }
    return acc
  }, [])

const canalSeleccionado = canales[Math.floor(Math.random() * canales.length)]

    const dynamicButtons = buttons.map((btn) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: btn[0],
        id: btn[1],
      }),
      contextInfo: {
        mentionedJid: null,
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalSeleccionado.id,
          serverMessageId: '0',
          newsletterName: canalSeleccionado.nombre,
        },
        externalAdReply: {
          title: botname,
          body: botname2 + ', Built With 💎 By Diamond',
          mediaType: 1,
          renderLargerThumbnail: false,
          previewType: `PHOTO`,
          thumbnailUrl: icon,
          sourceUrl: redes,
        },
      },
    }))

    if (copy && (typeof copy === 'string' || typeof copy === 'number')) {
      dynamicButtons.push({
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: 'Copy',
          copy_code: copy,
        }),
      })
    }
    if (urls && Array.isArray(urls)) {
      urls.forEach((url) => {
        dynamicButtons.push({
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: url[0],
            url: url[1],
            merchant_url: url[1],
          }),
        })
      })
    }
    const interactiveMessage = {
      body: { text: text },
      footer: { text: footer },
      header: {
        hasMediaAttachment: false,
        imageMessage: img ? img.imageMessage : null,
        videoMessage: video ? video.videoMessage : null,
      },
      nativeFlowMessage: { buttons: dynamicButtons, messageParamsJson: '' },
    }
    let msgL = generateWAMessageFromContent(
      jid,
      { viewOnceMessage: { message: { interactiveMessage } } },
      { userJid: client.user.jid, quoted },
    )
    client.relayMessage(jid, msgL.message, {
      messageId: msgL.key.id,
      ...options,
    })
  }

  client.sendList = async (jid, title, text, buttonText, listSections, quoted, options = {}) => {
    const sections = [...listSections]
    const message = {
      interactiveMessage: {
        header: { title: title },
        body: { text: text },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: buttonText,
                sections,
              }),
            },
          ],
          messageParamsJson: '',
        },
      },
    }
    await client.relayMessage(jid, { viewOnceMessage: { message } }, {})
  }

  client.newsletterMsg = async (key, content = {}, timeout = 5000) => {
    const {
      type: rawType = 'INFO',
      name,
      description = '',
      picture = null,
      react,
      id,
      newsletter_id = key,
      ...media
    } = content
    const type = rawType.toUpperCase()
    if (react) {
      if (!(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id)))
        throw [
          {
            message: 'Use Id Newsletter',
            extensions: {
              error_code: 204,
              severity: 'CRITICAL',
              is_retryable: false,
            },
          },
        ]
      if (!id)
        throw [
          {
            message: 'Use Id Newsletter Message',
            extensions: {
              error_code: 204,
              severity: 'CRITICAL',
              is_retryable: false,
            },
          },
        ]
      const hasil = await client.query({
        tag: 'message',
        attrs: {
          to: key,
          type: 'reaction',
          server_id: id,
          id: generateMessageID(),
        },
        content: [
          {
            tag: 'reaction',
            attrs: {
              code: react,
            },
          },
        ],
      })
      return hasil
    } else if (media && typeof media === 'object' && Object.keys(media).length > 0) {
      const msg = await generateWAMessageContent(media, {
        upload: client.waUploadToServer,
      })
      const anu = await client.query({
        tag: 'message',
        attrs: { to: newsletter_id, type: 'text' in media ? 'text' : 'media' },
        content: [
          {
            tag: 'plaintext',
            attrs: /image|video|audio|sticker|poll/.test(Object.keys(media).join('|'))
              ? {
                  mediatype:
                    Object.keys(media).find((key) =>
                      ['image', 'video', 'audio', 'sticker', 'poll'].includes(key),
                    ) || null,
                }
              : {},
            content: proto.Message.encode(msg).finish(),
          },
        ],
      })
      return anu
    } else {
      if (
        /(FOLLOW|UNFOLLOW|DELETE)/.test(type) &&
        !(newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id))
      )
        return [
          {
            message: 'Use Id Newsletter',
            extensions: {
              error_code: 204,
              severity: 'CRITICAL',
              is_retryable: false,
            },
          },
        ]
      const _query = await client.query(
        {
          tag: 'iq',
          attrs: {
            to: 's.whatsapp.net',
            type: 'get',
            xmlns: 'w:mex',
          },
          content: [
            {
              tag: 'query',
              attrs: {
                query_id:
                  type == 'FOLLOW'
                    ? '9926858900719341'
                    : type == 'UNFOLLOW'
                      ? '7238632346214362'
                      : type == 'CREATE'
                        ? '6234210096708695'
                        : type == 'DELETE'
                          ? '8316537688363079'
                          : '6563316087068696',
              },
              content: new TextEncoder().encode(
                JSON.stringify({
                  ariables: /(FOLLOW|UNFOLLOW|DELETE)/.test(type)
                    ? { newsletter_id }
                    : type == 'CREATE'
                      ? { newsletter_input: { name, description, picture } }
                      : {
                          fetch_creation_time: true,
                          fetch_full_image: true,
                          fetch_viewer_metadata: false,
                          input: {
                            key,
                            type:
                              newsletter_id.endsWith('@newsletter') || !isNaN(newsletter_id)
                                ? 'JID'
                                : 'INVITE',
                          },
                        },
                }),
              ),
            },
          ],
        },
        timeout,
      )
      const res =
        JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter ||
        JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_join_v2 ||
        JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_leave_v2 ||
        JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_create ||
        JSON.parse(_query.content[0].content)?.data?.xwa2_newsletter_delete_v2 ||
        JSON.parse(_query.content[0].content)?.errors ||
        JSON.parse(_query.content[0].content)
      res.thread_metadata ? (res.thread_metadata.host = 'https://mmg.whatsapp.net') : null
      return res
    }
  }

  const botIds = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
  const botSetting = global.db.data.settings[botIds] || {}
  const namebugsito = botSetting.namebot || ''
  const namebugg2 = botSetting.namebot2 || ''
  const pfp = botSetting.icon || ''
    const canalI = botSetting.id || '120363358338732714@newsletter'
    const canalNam = botSetting.nameid || '──̄͟͞⛛̵̅𝐌̸͡𝐞𝐠̵𝐮̲͜𝐦̷̈𝐢͜𝐧̸̤𝐁̷𝐨̶̇͜𝐭𓊓̴̻𝐂̷𝐡̶͡𝐚𝐧̈͜𝐧͜𝐞͜𝐥̵̲͞🔥̵̄͟'

  client.sendContextInfo = async (jid, text = '', options, quoted) => {
    let prep = generateWAMessageFromContent(
      jid,
      {
        extendedTextMessage: {
          text: text,
          contextInfo: {
            mentionedJid: null,
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: canalI,
              serverMessageId: '0',
              newsletterName: canalNam,
            },
            externalAdReply: {
              title: namebugsito,
              body: `${namebugg2}, Built With 🔥 By Megumin`,
              mediaType: 1,
              renderLargerThumbnail: false,
              previewType: `PHOTO`,
              thumbnailUrl: pfp,
              sourceUrl: bot.api,
            },
          },
        },
      },
      { quoted: m },
    )
    return client.relayMessage(jid, prep.message, { messageId: prep.key.id })
  }

  client.sendContextInfoIndex = async (
    jid,
    text = '',
    options = {},
    quoted = null,
    useQuoted = true,
    mentionedJid = null,
    config = {},
  ) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[botId] || {}
    const banner = config.banner || settings.icon || ''
    const botnam = config.title || settings.namebot || ''
    const namebot2 = config.body || `${settings.namebot2}, Built With 🔥 By Megumin`
    const canalId = settings.id ||'120363358338732714@newsletter'
    const canalName = settings.nameid || '──̄͟͞⛛̵̅𝐌̸͡𝐞𝐠̵𝐮̲͜𝐦̷̈𝐢͜𝐧̸̤𝐁̷𝐨̶̇͜𝐭𓊓̴̻𝐂̷𝐡̶͡𝐚𝐧̈͜𝐧͜𝐞͜𝐥̵̲͞🔥̵̄͟'
    const sourceUrl =
      typeof config.redes === 'string'
        ? config.redes
        : typeof settings.link === 'string'
          ? settings.link
          : 'https://studio.diamondbots.xyz'

    const normalizeJid = (jid) => (jid.includes('@') ? jid : jid + '@s.whatsapp.net')
    const mentions = Array.isArray(mentionedJid) ? mentionedJid.map(normalizeJid) : null

    const content = {
      extendedTextMessage: {
        text,
        contextInfo: {
          mentionedJid: mentions,
          forwardingScore: '0',
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '0',
            newsletterName: canalName,
          },
          externalAdReply: {
            title: botnam,
            body: namebot2,
            mediaType: 1,
            renderLargerThumbnail: false,
            previewType: 'PHOTO',
            thumbnailUrl: banner,
            sourceUrl
          }
        }
      }
    }
    const prep = generateWAMessageFromContent(jid, content, useQuoted ? { quoted } : {})

    return client.relayMessage(jid, prep.message, {
      quoted: useQuoted ? prep.key.quoted : undefined,
      messageId: prep.key.id,
    })
  }

  client.reply = async (jid, text = '', quoted, options) => {
    return Buffer.isBuffer(text)
      ? client.sendFile(jid, text, 'file', '', quoted, false, options)
      : client.sendMessage(jid, { ...options, text }, { quoted, ...options })
  }

  return m
}