import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from '@whiskeysockets/baileys'
import { getBuffer } from '../../core/message.ts'

interface XnxxResult {
  title:      string
  views:      string | null
  resolution: string | null
  duration:   string | null
  cover:      string | null
  url:        string
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
}

const ITEMS_PER_PAGE = 10
const CACHE_TIMEOUT  = 30 * 60 * 1000

const searchCache: Record<string, {
  results:    XnxxResult[]
  query:      string
  page:       number
  totalPages: number
  timestamp:  number
}> = {}

setInterval(() => {
  const now = Date.now()
  for (const k in searchCache)
    if (now - searchCache[k].timestamp > CACHE_TIMEOUT) delete searchCache[k]
}, CACHE_TIMEOUT)

async function xnxxSearch(query: string): Promise<XnxxResult[]> {
  const page = Math.floor(3 * Math.random()) + 1
  const resp = await fetch(`https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`, { headers: HEADERS })
  const $    = cheerio.load(await resp.text())
  const results: XnxxResult[] = []

  $('div[id*="video"]').each((_, bkp) => {
    const title      = $(bkp).find('.thumb-under p:nth-of-type(1) a').text().trim()
    const views      = $(bkp).find('.thumb-under p.metadata span.right').contents().not('span.superfluous').text().trim()
    const resolution = $(bkp).find('.thumb-under p.metadata span.video-hd').contents().not('span.superfluous').text().trim()
    const duration   = $(bkp).find('.thumb-under p.metadata').contents().not('span').text().trim()
    const cover      = $(bkp).find('.thumb-inside .thumb img').attr('data-src') || null
    const href       = $(bkp).find('.thumb-inside .thumb a').attr('href')

    if (title && href)
      results.push({
        title,
        views:      views      || null,
        resolution: resolution || null,
        duration:   duration   || null,
        cover,
        url: `https://xnxx.com${href.replace('/THUMBNUM/', '/')}`,
      })
  })

  return results.slice(0, 10)
}

async function xnxxDl(url: string) {
  const resp          = await fetch(url, { headers: HEADERS })
  const $             = cheerio.load(await resp.text())
  const scriptContent = $('#video-player-bg > script:nth-child(6)').html() || ''
  const extract       = (regex: RegExp) => (scriptContent.match(regex) || [])[1] || null

  const low   = extract(/html5player\.setVideoUrlLow\('(.*?)'\);/)
  const high  = extract(/html5player\.setVideoUrlHigh\('(.*?)'\);/)
  const HLS   = extract(/html5player\.setVideoHLS\('(.*?)'\);/)
  const thumb = extract(/html5player\.setThumbUrl\('(.*?)'\);/)

  if (!low && !high) throw new Error('No se pudo extraer el video de XNXX.')

  return { videos: { low, high, HLS }, thumb }
}

export default {
  command:  ['xnxxsearch', 'buscarxnxx', 'xnxxdl'],
  category: 'buscador',

  run: async ({ sock, m, text, command, usedPrefix }: any) => {
    const chatData = getChat(m.chat)
    if (!chatData?.nsfw)
      return sock.sendMessage(m.chat, { text: '✧ Los comandos *NSFW* están desactivados.' }, { quoted: m })

    if (command === 'xnxxdl') {
      const userCache = searchCache[`${m.chat}_${m.sender}`]
      if (!userCache)
        return sock.sendMessage(m.chat, { text: '❌ No hay resultados activos. Busca primero con *xnxxsearch*.' }, { quoted: m })

      const num = parseInt(text)
      if (isNaN(num) || num < 1 || num > userCache.results.length)
        return sock.sendMessage(m.chat, { text: `❌ Número inválido. Elige entre 1 y ${userCache.results.length}.` }, { quoted: m })

      const selected = userCache.results[num - 1]
      await sock.sendMessage(m.chat, { text: `⬇️ Descargando *#${num}*:\n${selected.title}` }, { quoted: m })

      try {
        const result    = await xnxxDl(selected.url)
        const videoLink = result.videos.high || result.videos.low!
        if (!videoLink) throw new Error('Sin URL de video disponible.')

        const videoBuffer = await getBuffer(videoLink)

        let thumbBuffer: Buffer | undefined
        if (result.thumb) {
          try {
            const raw   = await getBuffer(result.thumb)
            thumbBuffer = await sharp(raw).resize(300, 300).jpeg({ quality: 80 }).toBuffer()
          } catch {}
        }

        return sock.sendMessage(m.chat, {
          document:      videoBuffer,
          mimetype:      'video/mp4',
          fileName:      `${selected.title.replace(/[^a-z0-9]/gi, '_')}.mp4`,
          jpegThumbnail: thumbBuffer,
        }, { quoted: m })

      } catch (err: any) {
        return sock.sendMessage(m.chat, { text: `❌ No se pudo descargar: ${err.message}` }, { quoted: m })
      }
    }

    if (!text)
      return sock.sendMessage(m.chat, {
        text: `⚠️ Escribe algo para buscar.\nEj: *${command} latina*`,
      }, { quoted: m })

    const args = text.trim().split(' ')
    let page   = 1
    let query  = text

    if (!isNaN(Number(args[0])) && args.length > 1) {
      page  = parseInt(args[0])
      query = args.slice(1).join(' ')
    }

    await sock.sendMessage(m.chat, { text: `🔍 Buscando *${query}*...` }, { quoted: m })

    let resultados: XnxxResult[]
    try {
      resultados = await xnxxSearch(query)
    } catch (err: any) {
      return sock.sendMessage(m.chat, { text: `❌ Error al buscar: ${err.message}` }, { quoted: m })
    }

    if (!resultados.length)
      return sock.sendMessage(m.chat, { text: '❌ Sin resultados para esa búsqueda.' }, { quoted: m })

    const total      = resultados.length
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
    page             = Math.max(1, Math.min(page, totalPages))

    const start   = (page - 1) * ITEMS_PER_PAGE
    const results = resultados.slice(start, start + ITEMS_PER_PAGE)

    searchCache[`${m.chat}_${m.sender}`] = { results, query, page, totalPages, timestamp: Date.now() }

    const createImage = async (url: string) => {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url } },
        { upload: sock.waUploadToServer }
      )
      return imageMessage
    }

    const cards = []
    let index   = 1

    for (const v of results) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text:
            `🎬 *${index}. ${v.title}*\n` +
            `🕒 ${v.duration   ?? 'Desconocida'}\n` +
            `👁️ ${v.views      ?? 'N/A'}\n` +
            `📺 ${v.resolution ?? 'N/A'}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'XNXX' }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title:              `#${index}`,
          hasMediaAttachment: !!v.cover,
          imageMessage:       v.cover ? await createImage(v.cover) : undefined,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name:             'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '⬇️ Descargar',
                id:           `${usedPrefix}xnxxdl ${index}`,
              }),
            },
            {
              name:             'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 Ver en XNXX',
                url:          v.url,
              }),
            },
          ],
        }),
      })
      index++
    }

    const message = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🔍 *${query}*\n📄 Página ${page}/${totalPages}`,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'Usa los botones para descargar el video deseado',
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: page < totalPages ? [
                {
                  name:             'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '➡️ Página siguiente',
                    id:           `${command} ${page + 1} ${query}`,
                  }),
                },
              ] : [],
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards }),
          }),
        },
      },
    }, { quoted: m })

    await sock.relayMessage(m.chat, message.message, { messageId: message.key.id })
  },
}