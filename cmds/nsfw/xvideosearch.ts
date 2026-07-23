import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} from '@whiskeysockets/baileys'
import { getBuffer } from '../../core/message.ts'

const SCRAPER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
}

async function xvideosSearch(query: string): Promise<any[]> {
  const page = Math.floor(3 * Math.random()) + 1
  const resp = await fetch(
    `https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${page}`,
    { headers: SCRAPER_HEADERS }
  )
  const $       = cheerio.load(await resp.text())
  const results: any[] = []

  $('div[id*="video"]').each((_, bkp) => {
    const title      = $(bkp).find('.thumb-under p.title a').contents().not('span').text().trim()
    const resolution = $(bkp).find('.thumb-inside .thumb span').text().trim()
    const duration   = $(bkp).find('.thumb-under p.metadata span.duration').text().trim()
    const artist     = $(bkp).find('.thumb-under p.metadata a span.name').text().trim()
    const cover      = $(bkp).find('.thumb-inside .thumb img').attr('data-src')
    const href       = $(bkp).find('.thumb-inside .thumb a').attr('href')

    if (title && href) {
      results.push({
        title,
        resolution,
        duration,
        artist,
        cover,
        url: 'https://www.xvideos.com' + href,
      })
    }
  })

  return results.slice(0, 10)
}

async function xvideosDl(url: string) {
  const resp = await fetch(url, { headers: SCRAPER_HEADERS })
  const $    = cheerio.load(await resp.text())

  const scriptContent = $('#video-player-bg > script:nth-child(6)').html() || ''
  const extract       = (regex: RegExp) => (scriptContent.match(regex) || [])[1] || null

  const low   = extract(/html5player\.setVideoUrlLow\('(.*?)'\);/)
  const high  = extract(/html5player\.setVideoUrlHigh\('(.*?)'\);/)
  const HLS   = extract(/html5player\.setVideoHLS\('(.*?)'\);/)
  const thumb = extract(/html5player\.setThumbUrl\('(.*?)'\);/)

  if (!low && !high) throw new Error('No se pudo extraer el video de XVideos.')

  return { videos: { low, high, HLS }, thumb }
}

const ITEMS_PER_PAGE = 10
const CACHE_TIMEOUT  = 30 * 60 * 1000

const searchCache: Record<string, {
  results:    any[]
  query:      string
  page:       number
  totalPages: number
  timestamp:  number
}> = {}

setInterval(() => {
  const now = Date.now()
  for (const k in searchCache) {
    if (now - searchCache[k].timestamp > CACHE_TIMEOUT) delete searchCache[k]
  }
}, CACHE_TIMEOUT)

export default {
  command:  ['xvideosearch', 'buscarvideox', 'xvdl'],
  category: 'buscador',

  run: async ({ sock, m, text, command, usedPrefix }: any) => {
    const chatData = getChat(m.chat)
    if (!chatData?.nsfw)
      return sock.sendMessage(m.chat, { text: '✧ Los comandos *NSFW* están desactivados.' }, { quoted: m })

    if (command === 'xvdl') {
      const userCache = searchCache[`${m.chat}_${m.sender}`]
      if (!userCache)
        return sock.sendMessage(m.chat, { text: '❌ No hay resultados activos.' }, { quoted: m })

      const num = parseInt(text)
      if (isNaN(num) || num < 1 || num > userCache.results.length)
        return sock.sendMessage(m.chat, { text: '❌ Número inválido.' }, { quoted: m })

      const selected = userCache.results[num - 1]
      await sock.sendMessage(m.chat, { text: `⬇️ Descargando:\n${selected.title}` }, { quoted: m })

      try {
        const result = await xvideosDl(selected.url)

        const videoLink = result.videos.high || result.videos.low!
        if (!videoLink) throw new Error('Sin URL de video.')

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
        return sock.sendMessage(m.chat, {
          text: `❌ No se pudo descargar: ${err.message}`,
        }, { quoted: m })
      }
    }

    if (!text)
      return sock.sendMessage(m.chat, {
        text: `⚠️ Escribe algo para buscar\nEj: ${command} latina`,
      }, { quoted: m })

    const args = text.trim().split(' ')
    let page   = 1
    let query  = text

    if (!isNaN(Number(args[0]))) {
      page  = parseInt(args[0])
      query = args.slice(1).join(' ')
    }

    let resultados: any[]
    try {
      resultados = await xvideosSearch(query)
    } catch (err: any) {
      return sock.sendMessage(m.chat, {
        text: `❌ Error al buscar: ${err.message}`,
      }, { quoted: m })
    }

    if (!resultados.length)
      return sock.sendMessage(m.chat, { text: '❌ Sin resultados.' }, { quoted: m })

    const total      = resultados.length
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
    page             = Math.max(1, Math.min(page, totalPages))

    const start   = (page - 1) * ITEMS_PER_PAGE
    const results = resultados.slice(start, start + ITEMS_PER_PAGE)

    searchCache[`${m.chat}_${m.sender}`] = {
      results,
      query,
      page,
      totalPages,
      timestamp: Date.now(),
    }

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
          text: `🎬 *${index}.* ${v.title}\n🕒 ${v.duration || 'Desconocida'}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: 'Selecciona una opción',
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title:              `Resultado ${index}`,
          hasMediaAttachment: true,
          imageMessage:       v.cover ? await createImage(v.cover) : undefined,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name:             'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '⬇️ Descargar',
                id:           `${usedPrefix}xvdl ${index}`,
              }),
            },
            {
              name:             'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 Ver',
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