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
  jidDecode,
  isLidUser,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';
import chalk from 'chalk';
import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';
import moment from 'moment-timezone';
import { sizeFormatter } from 'human-readable';
import util from 'util';
import * as Jimp from 'jimp';
import fetch from 'node-fetch';
import path from 'path';
import exif from './exif.ts';
import { fileURLToPath } from 'url'
import GraphemeSplitter from 'grapheme-splitter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = exif;

class BoundedMap {
  #map = new Map();
  #max;
  #ttl;
  constructor(max, ttlMs = 0) { this.#max = max; this.#ttl = ttlMs; }
  #expired(e) { return this.#ttl > 0 && Date.now() - e.ts > this.#ttl; }
  has(k) {
    const e = this.#map.get(k);
    if (!e) return false;
    if (this.#expired(e)) { this.#map.delete(k); return false; }
    return true;
  }
  get(k) {
    const e = this.#map.get(k);
    if (!e) return undefined;
    if (this.#expired(e)) { this.#map.delete(k); return undefined; }
    return e.v;
  }
  set(k, v) {
    if (this.#map.size >= this.#max) this.#map.delete(this.#map.keys().next().value);
    this.#map.set(k, { v, ts: Date.now() });
  }
}

const groupMetaCache = new Map();
const lidCache = new BoundedMap(2000, 24 * 60 * 60_000);
const lidNegativeCache = new BoundedMap(5000, 30_000);
const META_TTL = 300_000;

function getCachedMeta(groupJid) {
  const c = groupMetaCache.get(groupJid);
  if (!c || Date.now() - c.ts > META_TTL) return null;
  return c.metadata;
}
function setCachedMeta(groupJid, metadata) {
  groupMetaCache.set(groupJid, { metadata, ts: Date.now() });
}

function normalizeJid(raw) {
  if (!raw) return null;
  const s = typeof raw === 'number' ? String(raw) : String(raw).trim();
  if (!s) return null;
  if (s.endsWith('@g.us')) return s;
  if (s.endsWith('@newsletter')) return s;
  if (s.endsWith('@lid')) return s;
  if (/:\d+@/i.test(s)) {
    const decoded = jidDecode(s);
    if (decoded?.user && decoded?.server) return `${decoded.user}@${decoded.server}`;
  }
  if (s.endsWith('@s.whatsapp.net')) return s;
  const digits = s.replace(/\D/g, '');
  if (digits && digits.length >= 4 && digits.length <= 15) return `${digits}@s.whatsapp.net`;
  return s;
}

function hasLidStore(sock) {
  const lm = sock?.signalRepository?.lidMapping;
  return typeof lm?.getPNsForLIDs === 'function' || typeof lm?.getPNForLID === 'function';
}

function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, ms);
    Promise.resolve(promise).then(
      (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } },
      () => { if (!done) { done = true; clearTimeout(timer); resolve(null); } }
    );
  });
}

async function resolveLidsAsync(lids, sock) {
  const list = [...new Set((lids ?? []).filter(l => l?.endsWith('@lid')))];
  const result = new Map();
  if (!list.length) return result;
  const resolvedSet = new Set();
  let pending = list.filter(l => !lidNegativeCache.has(l));
  if (!pending.length || !hasLidStore(sock)) return result;
  const lm = sock?.signalRepository?.lidMapping;
  if (!lm) return result;
  if (typeof lm.getPNsForLIDs === 'function') {
    let pairs = null;
    try { pairs = await withTimeout(lm.getPNsForLIDs(pending), 2000); }
    catch { pairs = null; }
    if (Array.isArray(pairs)) {
      for (const pair of pairs) {
        const n = normalizeJid(pair?.pn);
        if (pair?.lid && n && !n.endsWith('@lid')) { lidCache.set(pair.lid, n); result.set(pair.lid, n); resolvedSet.add(pair.lid); }
      }
    }
  } else if (typeof lm.getPNForLID === 'function') {
    await Promise.all(pending.map(async (lid) => {
      let pn = null;
      try { pn = await withTimeout(lm.getPNForLID(lid), 2000); }
      catch { pn = null; }
      const n = normalizeJid(pn);
      if (n && !n.endsWith('@lid')) { lidCache.set(lid, n); result.set(lid, n); resolvedSet.add(lid); }
    }));
  }
  for (const l of pending) if (!resolvedSet.has(l)) lidNegativeCache.set(l, true);
  return result;
}

async function resolveLidAsync(lid, sock) {
  if (!lid?.endsWith('@lid')) return null;
  const map = await resolveLidsAsync([lid], sock);
  return map.get(lid) || null;
}

function resolveJidSync(raw, sock) {
  if (!raw) return null;
  const norm = normalizeJid(raw);
  if (!norm) return null;
  if (!norm.endsWith('@lid')) return norm;
  if (lidCache.has(norm)) return lidCache.get(norm);
  return norm;
}

async function resolveJidAsync(raw, sock, groupJid) {
  if (!raw) return null;
  const norm = normalizeJid(raw);
  if (!norm) return null;
  if (!norm.endsWith('@lid')) return norm;
  const sync = resolveJidSync(norm, sock);
  if (sync && !sync.endsWith('@lid')) return sync;
  const viaStore = await resolveLidAsync(norm, sock);
  if (viaStore) return viaStore;
  if (!groupJid?.endsWith('@g.us')) {
    try {
      const results = await withTimeout(sock.onWhatsApp(norm), 4000);
      const hit = Array.isArray(results) ? results.find(r => r?.exists) || results[0] : null;
      const resolvedJid = hit?.jid ? normalizeJid(hit.jid) : null;
      if (resolvedJid && !resolvedJid.endsWith('@lid')) {
        lidCache.set(norm, resolvedJid);
        return resolvedJid;
      }
    } catch {}
    return norm;
  }
  const lidBase = norm.split('@')[0];
  let meta = getCachedMeta(groupJid);
  if (!meta) {
    try { meta = await sock.groupMetadata(groupJid); if (meta?.participants) setCachedMeta(groupJid, meta); else meta = null; }
    catch { return norm; }
  }
  for (const p of meta?.participants ?? []) {
    const pLidBase = p.lid?.split('@')[0];
    const pIdBase  = (p.id && !p.id.endsWith('@lid')) ? p.id.split('@')[0] : null;
    if (pLidBase !== lidBase && pIdBase !== lidBase) continue;
    const phone = p.phoneNumber ? normalizeJid(p.phoneNumber) : (p.id && !p.id.endsWith('@lid') ? normalizeJid(p.id) : null);
    if (phone) { lidCache.set(norm, phone); return phone; }
  }
  return norm;
}

async function resolveMentionedJids(rawList, sock, groupJid, metaParticipants) {
  const normalized = (rawList ?? []).map(raw => raw ? normalizeJid(raw) : null);
  const out = new Array(normalized.length);
  const needStore = [];
  for (let i = 0; i < normalized.length; i++) {
    const norm = normalized[i];
    if (!norm) { out[i] = null; continue; }
    if (!norm.endsWith('@lid')) { out[i] = norm; continue; }
    const sync = resolveJidSync(norm, sock);
    if (sync && !sync.endsWith('@lid')) { out[i] = sync; continue; }
    out[i] = norm;
    needStore.push(i);
  }
  if (needStore.length) {
    const batchResolved = await resolveLidsAsync(needStore.map(i => out[i]), sock);
    for (const i of needStore) {
      const lid = out[i];
      const viaStore = batchResolved.get(lid);
      if (viaStore) { out[i] = viaStore; continue; }
      if (metaParticipants) {
        const lidBase = lid.split('@')[0];
        for (const p of metaParticipants) {
          if (p.lid?.split('@')[0] === lidBase) { out[i] = p.id; break; }
          if (p.id?.split('@')[0] === lidBase) { out[i] = p.id; break; }
        }
      }
    }
  }
  return out.filter(Boolean);
}

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
  return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
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

export async function fixLid(sock, m) {
  const rawSender = (m.fromMe && sock.user.id) || m.key?.participant || m.key?.remoteJid || ''
  const decodedJid = sock.decodeJid(rawSender)
  const realJid = await resolveJidAsync(decodedJid, sock, m.key?.remoteJid)
  return realJid
}

export async function fixLid2(sock, m) {
  const rawParticipant = m.msg?.contextInfo?.participant ?? ''
  const decodedJid = sock.decodeJid(rawParticipant)
  const realJid = await resolveJidAsync(decodedJid, sock, m.chat)
  return realJid
}


export async function smsg(sock, m, store) {
  if (!sock.decodeJid) {
    sock.decodeJid = (jid) => {
      if (!jid) return jid
      if (/:\d+@/i.test(jid)) {
        const decoded = jidDecode(jid) || {}
        return (decoded.user && decoded.server && decoded.user + '@' + decoded.server) || jid
      }
      return jid
    }
  }
  if (!sock.findJidByLid) {
    sock.findJidByLid = async (pnLid) => {
      const jid = jidNormalizedUser(pnLid)
      const result = { lid: undefined, phoneNumber: undefined }
      try {
        if (isLidUser(jid)) {
          result.lid = jid
          const [mapped] = await sock.signalRepository.lidMapping.getPNsForLIDs([jid])
          result.phoneNumber = mapped?.pn ? jidNormalizedUser(mapped.pn) : undefined
        } else {
          result.phoneNumber = jid
          const [mapped] = await sock.signalRepository.lidMapping.getLIDsForPNs([jid])
          result.lid = mapped?.lid ? jidNormalizedUser(mapped.lid) : undefined
        }
      } catch {}
      return result
    }
  }
  sock.downloadMediaMessage = async (message) => {
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

  const botLid = sock.decodeJid(sock.user.lid)
  const botNumber = sock.decodeJid(sock.user.id)
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
   if (!m.isGroup && m.chat.endsWith('@lid')) {
     const resolvedChat = await resolveJidAsync(m.chat, sock, null)
     if (resolvedChat && !resolvedChat.endsWith('@lid')) m.chat = resolvedChat
   }

     m.sender = await fixLid(sock, m)
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
    const rawMentioned = m.msg?.contextInfo?.mentionedJid ?? []
    let metaParticipants = null
    if (m.isGroup && rawMentioned.some((j) => j?.endsWith('@lid'))) {
      try {
        const meta = getCachedMeta(m.chat) ?? (await sock.groupMetadata(m.chat).catch(() => null))
        if (meta) setCachedMeta(m.chat, meta)
        metaParticipants = meta?.participants ?? null
      } catch {}
    }
    m.mentionedJid = await resolveMentionedJids(rawMentioned, sock, m.chat, metaParticipants)
    m.text =
      m.msg?.text ||
      m.msg?.caption ||
      m.message?.conversation ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      m.msg?.title ||
      ''
      const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot) || {}
    const splitter = new GraphemeSplitter()
    let activePrefixes = []
    if (config.prefijo === true) {
      activePrefixes = []
    } else if (Array.isArray(config.prefijo)) {
      activePrefixes = config.prefijo
    } else if (typeof config.prefijo === 'string') {
      activePrefixes = splitter.splitGraphemes(config.prefijo)
    } else {
      activePrefixes = ['#', '/']
    }
    m.usedPrefix = ''
    if (activePrefixes.length > 0) {
      for (const p of activePrefixes) {
        if (m.body?.startsWith(p)) {
          m.usedPrefix = p
          break
        }
      }
    }
    m.command = m.body && m.body.replace(m.usedPrefix, '').trim().split(/ +/).shift()
    m.args = m.body ?.trim().replace(new RegExp('^' + (m.usedPrefix || '').replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&'), 'i'), '').replace(m.command, '').split(/ +/).filter((a) => a) || []
    m.device = getDevice(m.id)
    m.expiration =
      m.msg?.contextInfo?.expiration ||
      m?.metadata?.ephemeralDuration ||
      sock?.messages?.[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration ||
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
      m.quoted.sender = await fixLid2(sock, m)
      m.quoted.fromMe = m.quoted.sender === sock.decodeJid(sock.user.id)
      m.quoted.text =
        m.quoted.caption ||
        m.quoted.conversation ||
        m.quoted.contentText ||
        m.quoted.selectedDisplayText ||
        m.quoted.title ||
        ''
      m.quoted.msg =
        extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type]
      m.quoted.mentionedJid = await resolveMentionedJids(m.quoted?.msg?.contextInfo?.mentionedJid ?? [], sock, m.chat, metaParticipants)
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
        return await exports.smsg(sock, q)
      }
      m.quoted.key = {
        remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
        participant: m.quoted.sender,
        fromMe: areJidsSameUser(
          sock.decodeJid(m.msg?.contextInfo?.participant),
          sock.decodeJid(sock?.user?.id),
        ),
        id: m.msg?.contextInfo?.stanzaId,
      }
      m.quoted.isGroup = m.quoted.chat.endsWith('@g.us')
      m.quoted.mentions = m.quoted.mentionedJid
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
        let quotedPrefix = ''
      if (activePrefixes.length > 0) {
        for (const p of activePrefixes) {
          if (m.quoted.body?.startsWith(p)) {
            quotedPrefix = p
            break
          }
        }
      }
      m.quoted.usedPrefix = quotedPrefix
      m.quoted.command =
        m.quoted.body && m.quoted.body.replace(m.quoted.usedPrefix, '').trim().split(/ +/).shift()
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
      m.quoted.download = () => sock.downloadMediaMessage(m.quoted)
      m.quoted.delete = () => {
        sock.sendMessage(m.quoted.chat, {
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

  m.download = () => sock.downloadMediaMessage(m)

  m.copy = () =>
    exports.smsg(sock, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)))

  m.react = (u) => sock.sendMessage(m.chat, { react: { text: u, key: m.key } })

sock.sendCodeMessage = async (jid, filename, language, code, quoted) => {
  const KEYWORDS = new Set(['break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','false','finally','for','function','if','import','in','instanceof','let','new','null','return','super','switch','this','throw','true','try','typeof','var','void','while','with','yield','async','await','static']);
  const METHOD_NAMES = new Set(['log','parse','stringify','from','toString','readFileSync','existsSync','statSync','resolve','join','randomUUID','randomBytes','startsWith','replace','trim','isFile','relayMessage','sendMessage']);

  function tokenize(src) {
    const tokens = [];
    let i = 0;
    const push = (content, type = 'DEFAULT') => { if (content) tokens.push({ content, type }); };
    while (i < src.length) {
      const ch = src[i];
      const rest = src.slice(i);
      if (rest.startsWith('//')) { let j = i + 2; while (j < src.length && src[j] !== '\n') j++; push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
      if (rest.startsWith('/*')) { let j = i + 2; while (j < src.length - 1 && !(src[j] === '*' && src[j + 1] === '/')) j++; j = Math.min(j + 2, src.length); push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch; let j = i + 1, escaped = false;
        while (j < src.length) { const c = src[j]; if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) { j++; break; } j++; }
        push(src.slice(i, j), 'STR'); i = j; continue;
      }
      if (/[0-9]/.test(ch)) { let j = i + 1; while (j < src.length && /[0-9._]/.test(src[j])) j++; push(src.slice(i, j), 'NUMBER'); i = j; continue; }
      if (/[A-Za-z_$]/.test(ch)) {
        let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
        const word = src.slice(i, j); const next = src[j] || '', prev = src[i - 1] || '';
        if (KEYWORDS.has(word)) push(word, 'KEYWORD');
        else if ((METHOD_NAMES.has(word) || next === '(') && prev === '.') push(word, 'METHOD');
        else if (METHOD_NAMES.has(word) && next === '(') push(word, 'METHOD');
        else push(word, 'DEFAULT');
        i = j; continue;
      }
      push(ch, 'DEFAULT'); i++;
    }
    const merged = [];
    for (const token of tokens) { const last = merged[merged.length - 1]; if (last?.type === 'DEFAULT' && token.type === 'DEFAULT') last.content += token.content; else merged.push({ ...token }); }
    return merged;
  }

  const codeBlocks = Array.isArray(code) ? code : tokenize(String(code));
  const payload = {
    response_id: crypto.randomUUID(),
    sections: [
      {
        view_model: {
          primitive: { text: filename, __typename: 'GenAIMarkdownTextUXPrimitive' },
          __typename: 'GenAISingleLayoutViewModel'
        }
      },
      {
        view_model: {
          primitive: { language, code_blocks: codeBlocks, __typename: 'GenAICodeUXPrimitive' },
          __typename: 'GenAISingleLayoutViewModel'
        }
      }
    ]
  };

  const content = {
    messageContextInfo: {
      threadId: [],
      deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [], recipientKeyHash: '', recipientTimestamp: Math.floor(Date.now() / 1000) },
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32).toString('base64')
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [],
          messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64') },
          contextInfo: {
            mentionedJid: [],
            groupMentions: [],
            statusAttributions: [],
            forwardingScore: 2,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '259786046210223@bot' },
            forwardOrigin: 4,
            botMessageSharingInfo: { botEntryPointOrigin: 1, forwardScore: 2 }
          }
        }
      }
    }
  };

  return sock.relayMessage(jid, content, {});
};

m.reply = async (content, options = {}) => {
  const quoted = m
  const chat = m.chat
  const caption = ''
  const ephemeralExpiration = m.expiration
  const mentions = ''
  if (typeof content === 'object') {
    return sock.sendMessage(chat, content, {
      ...options,
      quoted,
      ephemeralExpiration,
    })
  } else if (typeof content === 'string') {
    try {
      if (/^https?:\/\//.test(content)) {
        const data = await axios.get(content, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(data.data)
        let mime = data.headers['content-type'] || ''
        if (!mime) {
          const detected = detectBySignature(buffer)
          if (detected && detected.mime) mime = detected.mime
        }
        if (!mime) {
          const mimeMod = await import('mime-types')
          const mimeTypes = mimeMod.default || mimeMod
          const ext = (new URL(content).pathname.split('.').pop() || '').split('?')[0]
          mime = mimeTypes.lookup(ext) || ''
        }
        if (/gif|image|video|audio|pdf|stream/i.test(mime)) {
          return sock.sendMedia(chat, buffer, '', caption, quoted, content)
        } else {
          return sock.sendMessage(
            chat,
            { text: content, mentions, ...options },
            { quoted, ephemeralExpiration },
          )
        }
      } else {
        return sock.sendMessage(
          chat,
          { text: content, mentions, ...options },
          { quoted, ephemeralExpiration },
        )
      }
    } catch (e) {
      return sock.sendMessage(
        chat,
        { text: content, mentions, ...options },
        { quoted, ephemeralExpiration },
      )
    }
  }
}

function detectBySignature(buf) {
  if (!buf || buf.length < 4) return null
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return { ext: 'png', mime: 'image/png' }
  if (buf.length >= 3 && buf.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) return { ext: 'jpg', mime: 'image/jpeg' }
  if (buf.length >= 6 && (buf.slice(0, 6).toString('ascii') === 'GIF89a' || buf.slice(0, 6).toString('ascii') === 'GIF87a')) return { ext: 'gif', mime: 'image/gif' }
  if (buf.length >= 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return { ext: 'webp', mime: 'image/webp' }
  if (buf.length >= 4 && buf.slice(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46]))) return { ext: 'pdf', mime: 'application/pdf' }
  if (buf.length >= 4 && buf.slice(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) return { ext: 'zip', mime: 'application/zip' }
  if (buf.length >= 3 && buf.slice(0, 3).toString('ascii') === 'ID3') return { ext: 'mp3', mime: 'audio/mpeg' }
  if (buf.length >= 4 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x00 && (buf[3] === 0x18 || buf[3] === 0x20)) return { ext: 'mp4', mime: 'video/mp4' }
  return null
}

  m.copy = () => exports.smsg(sock, M.fromObject(M.toObject(m)))

  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
    sock.copyNForward(jid, m, forceForward, options)

  sock.getName = (jid, withoutContact = false) => {
    // jid = m.chat?
    id = sock.decodeJid(jid)
    withoutContact = sock.withoutContact || withoutContact
    let v
    if (id.endsWith('@g.us'))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {}
        if (!(v.name || v.subject)) v = sock.groupMetadata(id) || {}
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
          : id === sock.decodeJid(sock.user.jid)
            ? sock.user
            : store.contacts[id] || {}
    return (
      (withoutContact ? '' : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    )
  }

  m.react = (text, key, options) => sock.sendMessage(m.chat, { react: { text, key: m.key } })

  sock.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')
  }

  sock.appenTextMessage = async (text, chatUpdate) => {
    let messages = await generateWAMessage(
      m.chat,
      { text: text, mentions: m.mentionedJid },
      {
        userJid: sock.user.id,
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

  sock.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
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
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
  }
  sock.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
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
    await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
    return buffer
  }  
  
  sock.sendFile = async (jid, path, filename = "file", caption = "", quoted = null, ptt = false, options = {}) => {
  let buffer
  if (Buffer.isBuffer(path)) {
    buffer = path
  } else if (/^https?:\/\//.test(path)) {
    buffer = await (await fetch(path)).buffer()
  } else if (fs.existsSync(path)) {
    buffer = fs.readFileSync(path)
  } else {
    throw new Error("Ruta o buffer inválido")
  }
  const type = (await fileTypeFromBuffer(buffer)) || { mime: "application/octet-stream", ext: "bin", }
  let mtype = ""
  let mimetype = options.mimetype || type.mime
  let file = buffer
  let pathFile = filename
  if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) {
    mtype = "sticker"
  } else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) {
    mtype = "image"
  } else if (/video/.test(type.mime)) {
    mtype = "video"
  } else if (/audio/.test(type.mime)) {
    mtype = "audio"
  } else {
    mtype = "document"
  }
  if (options.asDocument) mtype = "document"
  delete options.asSticker
  delete options.asLocation
  delete options.asVideo
  delete options.asDocument
  delete options.asImage
  const message = { ...options, caption, ptt, [mtype]: file, mimetype, fileName: filename || pathFile.split("/").pop(), }
  return sock.sendMessage(jid, message, { quoted, ...options })
  }
  
  sock.sendAlbumMessage = async (jid, medias, options = {}) => {
  if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Minimum 2 media required")
  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) throw new TypeError(`Invalid media type: ${media.type}`)
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) throw new TypeError(`Invalid media data`)
  }
  const caption = options.text || options.caption || ""
  const delayMs = !isNaN(options.delay) ? options.delay : 500
  delete options.text
  delete options.caption
  delete options.delay
  const album = generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      ...(options.quoted ? { contextInfo: { 
        remoteJid: options.quoted.key.remoteJid, 
        fromMe: options.quoted.key.fromMe, 
        stanzaId: options.quoted.key.id, 
        participant: options.quoted.key.participant || options.quoted.key.remoteJid, 
        quotedMessage: options.quoted.message 
      }} : {}),
    },
  }, {})
  await sock.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })
  for (let i = 0; i < medias.length; i++) {
    const { type, data, caption } = medias[i]
    const mediaMsg = await generateWAMessage(album.key.remoteJid, { [type]: data, ...(caption ? { caption } : {}) }, { upload: sock.waUploadToServer })
    mediaMsg.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    }
    await sock.relayMessage(mediaMsg.key.remoteJid, mediaMsg.message, { messageId: mediaMsg.key.id })
    await delay(delayMs)
  }
  return album
  }
  
  sock.sendButton = async (
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
            { upload: sock.waUploadToServer },
          )
        } else if (/^video\//i.test(contentType)) {
          video = await prepareWAMessageMedia(
            { video: { url: buffer } },
            { upload: sock.waUploadToServer },
          )
        } else {
          console.error('Tipo MIME no compatible:', contentType)
        }
      } catch (error) {
        console.error('Error al obtener el tipo MIME:', error)
      }
    } else {
      try {
        const type = await sock.getFile(buffer)
        if (/^image\//i.test(type.mime)) {
          img = await prepareWAMessageMedia(
            { image: { url: buffer } },
            { upload: sock.waUploadToServer },
          )
        } else if (/^video\//i.test(type.mime)) {
          video = await prepareWAMessageMedia(
            { video: { url: buffer } },
            { upload: sock.waUploadToServer },
          )
        }
      } catch (error) {
        console.error('Error al obtener el tipo de archivo:', error)
      }
    }

    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = await getSettings(botId) || {}
    const botname = botSettings.botname || ''
    const botname2 = botSettings.namebot || ''
    const icon = botSettings.banner || ''

    const dynamicButtons = buttons.map((btn) => ({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: btn[0],
        id: btn[1],
      }),
      contextInfo: {
        mentionedJid: null,
        forwardingScore: 0,
        externalAdReply: {
          title: botname,
          body: dev,
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
      { userJid: sock.user.jid, quoted },
    )
    sock.relayMessage(jid, msgL.message, {
      messageId: msgL.key.id,
      ...options,
    })
  }

  sock.sendList = async (jid, title, text, buttonText, listSections, quoted, options = {}) => {
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
    await sock.relayMessage(jid, { viewOnceMessage: { message } }, {})
  }

  sock.newsletterMsg = async (key, content = {}, timeout = 5000) => {
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
      const hasil = await sock.query({
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
        upload: sock.waUploadToServer,
      })
      const anu = await sock.query({
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
      const _query = await sock.query(
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

  const botIds = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
  const botSetting = await getSettings(botIds)
  const namebugsito = botSetting.namebot || ''
  const namebugg2 = botSetting.namebot2 || ''
  const pfp = botSetting.icon || ''
  const link = botSetting.link || ''

  sock.sendContextInfo = async (jid, text = '', options, quoted) => {
    let prep = generateWAMessageFromContent(
      jid,
      {
        extendedTextMessage: {
          text: text,
          contextInfo: {
            mentionedJid: null,
            forwardingScore: 0,
            isForwarded: false,
            externalAdReply: {
              title: namebugsito,
              body: dev,
              mediaType: 1,
              renderLargerThumbnail: false,
              previewType: `PHOTO`,
              thumbnailUrl: pfp,
              sourceUrl: link,
            },
          },
        },
      },
      { quoted: m },
    )
    return sock.relayMessage(jid, prep.message, { messageId: prep.key.id })
  }

  sock.sendContextInfoIndex = async (
    jid,
    text = '',
    options = {},
    quoted = null,
    useQuoted = true,
    mentionedJid = null,
    config = {},
  ) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await getSettings(botId)
    const banner = config.banner || settings.icon || ''
    const botnam = config.title || settings.namebot || ''
    const namebot2 = config.body || settings.namebot2 || ''
    const sourceUrl = typeof config.redes === 'string' ? config.redes : typeof settings.link === 'string' ? settings.link : 'https://github.com/DevZyxlJs'

    const normalizeJid = (jid) => (jid.includes('@') ? jid : jid + '@s.whatsapp.net')
    const mentions = Array.isArray(mentionedJid) ? mentionedJid.map(normalizeJid) : null

    const content = {
      extendedTextMessage: {
        text,
        contextInfo: {
          mentionedJid: mentions,
          forwardingScore: '0',
          isForwarded: false,         
          externalAdReply: {
            title: botnam,
            body: dev,
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

    return sock.relayMessage(jid, prep.message, {
      quoted: useQuoted ? prep.key.quoted : undefined,
      messageId: prep.key.id,
    })
  }

sock.reply = async (jid, text = '', quoted, options = {}) => {
  if (Buffer.isBuffer(text)) {
    return sock.sendFile(jid, text, 'file', '', quoted, false, options);
  }

  const { contextInfo, jpegThumbnail } = options;
  const selectedLink = (global as any).redes;

  if (contextInfo?.forwardedNewsletterMessageInfo && selectedLink) {
    return sock.sendMessage(jid, {
      text: `${selectedLink}\n\n${text}`,
      linkPreview: {
        'canonical-url': selectedLink,
        'matched-text':  selectedLink,
        title:           namebugg2,
        description:     namebugsito,
        jpegThumbnail,
      },
      contextInfo,
    }, { quoted });
  }

  return sock.sendMessage(jid, { text, ...options }, { quoted });
};

  return m
}