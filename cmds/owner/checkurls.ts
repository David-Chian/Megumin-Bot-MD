import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import crypto from 'crypto'

const CHARACTERS_PATH = './core/characters.json'
const TMP_DIR = './core/system/tmp'
const SESSION_FILE = path.join(TMP_DIR, 'checkurls_session.json')
const DELAY_BETWEEN = 1500
const REQUEST_TIMEOUT = 20000

function saveSession(data) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE))
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'))
  } catch (_) {}
  return null
}

function clearSession() {
  try { fs.unlinkSync(SESSION_FILE) } catch (_) {}
}

const KEYWORDS = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete',
  'do','else','export','extends','false','finally','for','function','if','import',
  'in','instanceof','let','new','null','return','super','switch','this','throw',
  'true','try','typeof','var','void','while','with','yield','async','await','static',
])

const METHOD_NAMES = new Set([
  'log','parse','stringify','from','toString','readFileSync','existsSync','statSync',
  'resolve','join','randomUUID','randomBytes','startsWith','replace','trim','isFile',
  'relayMessage','sendMessage','filter','map','find','forEach','push','pop','shift',
  'split','slice','splice','includes','indexOf','keys','values','entries',
])

function parseSegments(text) {
  const segments = []
  const regex = /^```(\w+)?\n([\s\S]+?)^```/gm
  let lastIndex = 0, match
  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim()
    if (before) segments.push({ type: 'text', content: before })
    segments.push({ type: 'code', lang: match[1]?.toLowerCase() || 'json', code: match[2].trim() })
    lastIndex = match.index + match[0].length
  }
  const after = text.slice(lastIndex).trim()
  if (after) segments.push({ type: 'text', content: after })
  return segments
}

function tokenize(src) {
  const tokens = []
  let i = 0
  const push = (content, type = 'DEFAULT') => { if (content) tokens.push({ content, type }) }
  while (i < src.length) {
    const ch = src[i], rest = src.slice(i)
    if (rest.startsWith('//')) { let j = i + 2; while (j < src.length && src[j] !== '\n') j++; push(src.slice(i, j), 'DEFAULT'); i = j; continue }
    if (rest.startsWith('/*')) { let j = i + 2; while (j < src.length - 1 && !(src[j] === '*' && src[j+1] === '/')) j++; j = Math.min(j+2, src.length); push(src.slice(i, j), 'DEFAULT'); i = j; continue }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch; let j = i + 1, esc = false
      while (j < src.length) { const c = src[j]; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === quote) { j++; break }; j++ }
      push(src.slice(i, j), 'STR'); i = j; continue
    }
    if (/[0-9]/.test(ch)) { let j = i + 1; while (j < src.length && /[0-9._]/.test(src[j])) j++; push(src.slice(i, j), 'NUMBER'); i = j; continue }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
      const word = src.slice(i, j), next = src[j] || '', prev = src[i-1] || ''
      if (KEYWORDS.has(word)) push(word, 'KEYWORD')
      else if ((METHOD_NAMES.has(word) || next === '(') && prev === '.') push(word, 'METHOD')
      else if (METHOD_NAMES.has(word) && next === '(') push(word, 'METHOD')
      else push(word, 'DEFAULT')
      i = j; continue
    }
    push(ch, 'DEFAULT'); i++
  }
  const merged = []
  for (const t of tokens) {
    const last = merged[merged.length - 1]
    if (last?.type === 'DEFAULT' && t.type === 'DEFAULT') last.content += t.content
    else merged.push({ ...t })
  }
  return merged
}

function buildRichMessage(jid, sender, quotedMessage, sections) {
  const payload = { response_id: crypto.randomUUID(), sections }
  return {
    messageContextInfo: {
      threadId: [],
      deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [], recipientKeyHash: '', recipientTimestamp: Math.floor(Date.now() / 1000) },
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32).toString('base64'),
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [],
          messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64') },
          contextInfo: {
            mentionedJid: [sender], participant: sender, remoteJid: jid,
            quotedMessage, groupMentions: [], statusAttributions: [],
            forwardingScore: 2, isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '259786046210223@bot' },
            forwardOrigin: 4, botMessageSharingInfo: { botEntryPointOrigin: 1, forwardScore: 2 },
          },
        },
      },
    },
  }
}

async function sendAllCodeBlocks(sock, jid, segments, header, m) {
  const sections = [{
    view_model: {
      primitive: { text: header, __typename: 'GenAIMarkdownTextUXPrimitive' },
      __typename: 'GenAISingleLayoutViewModel',
    },
  }]
  for (const seg of segments) {
    if (seg.type === 'text') {
      sections.push({
        view_model: {
          primitive: { text: seg.content, __typename: 'GenAIMarkdownTextUXPrimitive' },
          __typename: 'GenAISingleLayoutViewModel',
        },
      })
    } else {
      sections.push({
        view_model: {
          primitive: {
            language: seg.lang || 'json',
            code_blocks: tokenize(String(seg.code)),
            __typename: 'GenAICodeUXPrimitive',
          },
          __typename: 'GenAISingleLayoutViewModel',
        },
      })
    }
  }
  return sock.relayMessage(jid, buildRichMessage(jid, m.sender, m.message, sections), { quoted: m })
}

async function sendRichText(sock, jid, m, segments, header) {
  const sections = [{
    view_model: {
      primitive: { text: header, __typename: 'GenAIMarkdownTextUXPrimitive' },
      __typename: 'GenAISingleLayoutViewModel',
    },
  }]
  segments.forEach(seg => {
    sections.push({
      view_model: {
        primitive: { text: seg.content ?? seg.code ?? '', __typename: 'GenAIMarkdownTextUXPrimitive' },
        __typename: 'GenAISingleLayoutViewModel',
      },
    })
  })
  return sock.relayMessage(jid, buildRichMessage(jid, m.sender, m.message, sections), { quoted: m })
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function downloadToFile(url, destPath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('DEMASIADOS_REDIRECTS'))
    const proto = url.startsWith('https') ? https : http
    const timeout = setTimeout(() => reject(new Error('TIMEOUT')), REQUEST_TIMEOUT)
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        clearTimeout(timeout)
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href
        return downloadToFile(redirectUrl, destPath, redirectCount + 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) { clearTimeout(timeout); return reject(new Error(`HTTP_${res.statusCode}`)) }
      const file = fs.createWriteStream(destPath)
      res.pipe(file)
      file.on('finish', () => { clearTimeout(timeout); file.close(resolve) })
      file.on('error', (err) => { clearTimeout(timeout); fs.unlink(destPath, () => {}); reject(err) })
    })
    req.on('error', (err) => { clearTimeout(timeout); reject(err) })
  })
}

async function checkUrl(url, tmpPath) {
  try {
    if (!url || typeof url !== 'string' || !url.startsWith('http'))
      return { ok: false, reason: 'URL_INVALIDA' }
    await downloadToFile(url, tmpPath)
    const stats = fs.statSync(tmpPath)
    if (stats.size < 500) return { ok: false, reason: 'ARCHIVO_MUY_PEQUEÑO' }
    const buf = Buffer.alloc(12)
    const fd = fs.openSync(tmpPath, 'r')
    fs.readSync(fd, buf, 0, 12, 0)
    fs.closeSync(fd)
    const isJPEG = buf[0] === 0xFF && buf[1] === 0xD8
    const isPNG  = buf[0] === 0x89 && buf[1] === 0x50
    const isWEBP = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP'
    const isGIF  = buf.slice(0, 3).toString() === 'GIF'
    if (!isJPEG && !isPNG && !isWEBP && !isGIF) return { ok: false, reason: 'NO_ES_IMAGEN' }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message || 'ERROR_DESCONOCIDO' }
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlink(tmpPath, () => {})
  }
}

export default {
  command: ['checkurls', 'checkcharacters', 'verificarurls'],
  category: 'admin',
  isOwner: true,

  run: async ({ sock, m }) => {
    const chatId = m.chat

    let personajes
    try {
      personajes = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'))
    } catch (e) {
      return m.reply(`❌ No se pudo leer characters.json: ${e.message}`)
    }

    if (!Array.isArray(personajes) || !personajes.length)
      return m.reply('❌ characters.json está vacío o mal formateado.')

    if (!fs.existsSync(TMP_DIR))
      fs.mkdirSync(TMP_DIR, { recursive: true })

    const total = personajes.length

    let startIndex = 0
    let fallidos = []
    const session = loadSession()

    if (session && session.total === total) {
      startIndex = session.revisados
      fallidos   = session.fallidos

      await sock.sendMessage(chatId, {
        text:
          `♻️ *Reanudando revisión anterior*\n\n` +
          `📊 Continuando desde *${startIndex}/${total}*\n` +
          `❌ Fallidos previos: *${fallidos.length}*\n\n` +
          `⏳ Trabajando en silencio, aviso cuando termine...`
      }, { quoted: m })
    } else {
      clearSession()
      await sock.sendMessage(chatId, {
        text:
          `🔍 *Iniciando revisión de URLs*\n\n` +
          `📊 Total de personajes: *${total}*\n\n` +
          `⏳ Esto puede tardar bastante por favor espere.`
      }, { quoted: m })
    }

    let revisados    = startIndex
    let fallidsCount = fallidos.length

    for (let i = startIndex; i < total; i++) {
      const personaje = personajes[i]
      const tmpPath   = path.join(TMP_DIR, `check_${Date.now()}_${i}.tmp`)
      const resultado = await checkUrl(personaje.url, tmpPath)

      revisados++
      if (!resultado.ok) {
        fallidsCount++
        fallidos.push({ name: personaje.name, url: personaje.url, reason: resultado.reason })
      }

      saveSession({ revisados, total, fallidos })

      if (i < total - 1) await delay(DELAY_BETWEEN)
    }

    clearSession()

    if (!fallidos.length) {
      return sendRichText(
        sock, chatId, m,
        parseSegments(`Se revisaron *${total}* personajes.\n¡Todas las URLs están funcionando correctamente! 🎉`),
        `✅ Verificación completada`
      )
    }

    const header = `⚠️ Verificación completada — ${fallidos.length} URL${fallidos.length > 1 ? 's' : ''} fallida${fallidos.length > 1 ? 's' : ''} de ${total}`

    const CHUNK_SIZE = 50
    const chunks = []
    for (let i = 0; i < fallidos.length; i += CHUNK_SIZE)
      chunks.push(fallidos.slice(i, i + CHUNK_SIZE))

    for (let c = 0; c < chunks.length; c++) {
      const chunkHeader = chunks.length > 1
        ? `${header}\n📦 Parte ${c + 1}/${chunks.length}`
        : header

      const jsonStr = JSON.stringify(
        chunks[c].map(f => ({ name: f.name, url: f.url, reason: f.reason })),
        null, 2
      )

      await sendAllCodeBlocks(
        sock, chatId,
        parseSegments(`\`\`\`json\n${jsonStr}\n\`\`\``),
        chunkHeader, m
      )

      if (c < chunks.length - 1) await delay(1500)
    }
  }
}