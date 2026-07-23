import { createCanvas, loadImage } from 'canvas';
import GIFEncoder from 'gif-encoder-2'
import sharp from 'sharp'
import webp from 'node-webpmux'
import crypto from 'crypto'
import fetch from 'node-fetch'
import { PassThrough } from 'stream'

async function addExif(webpBuffer, packname, author) {
  const img = new webp.Image()
  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['👋']
  }
  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  const jsonBuffer = Buffer.from(JSON.stringify(json))
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)
  await img.load(webpBuffer)
  img.exif = exif
  return await img.save(null)
}

export default {
  command: ['pet'],
  category: 'sticker',

  run: async ({ client, m, text, command, usedPrefix }) => {
    try {
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      let botSettings = global.db.data?.settings?.[botId] || {}
      let botname = botSettings.namebot || 'Bot'
      let user = global.db.data?.users?.[m.sender] || {}
      const name = user.name || m.pushName || 'Usuario'

      let packname = user.metadatos || `♯𝐓꯭̱𝔥̱𝑒̱ . ㌦‥ꪱ꯭̱ꪆ꯭̱í̱α꯭̱ო꯭̱ꤩꤨօ꯭̱ղ꯭̱꤬ძ ̱  ──͟͞🄱̱ǿ̱𝔱…ꤩꤨ‧💎`
      let author = user.metadatos2 || `Socket:\n↳@${botname}\n👹Usuario:\n↳@${name}`

      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''

      if (!/webp|image/.test(mime)) return m.reply(`❌ Responde a un sticker o imagen con *${usedPrefix + command}*`)

  //    await m.reply('⏳ Procesando sticker...')

      let media = await q.download?.() || await q.download()
      let pngBuffer = await sharp(media).png().toBuffer()
      let userImg = await loadImage(pngBuffer)

      const handGifRes = await fetch('https://files.catbox.moe/54b88w.gif')
      const handGifBuffer = await handGifRes.buffer()

const metadata = await sharp(handGifBuffer).metadata()
const frameCount = metadata.pages || metadata.delay?.length || 5
      const handFrames = []

      for (let i = 0; i < frameCount; i++) {
        const frameBuffer = await sharp(handGifBuffer, { page: i }).png().toBuffer()
        handFrames.push(await loadImage(frameBuffer))
      }

      const width = 512
      const height = 512
      const encoder = new GIFEncoder(width, height)
      const stream = new PassThrough()
      const chunks = []
      stream.on('data', chunk => chunks.push(chunk))

      encoder.createReadStream().pipe(stream)
      encoder.start()
      encoder.setRepeat(0)
      encoder.setDelay(60)
      encoder.setTransparent(0x000000)

      const squash = [
        { x: 70, y: 120, w: 370, h: 370 },
        { x: 60, y: 130, w: 390, h: 355 },
        { x: 50, y: 140, w: 410, h: 340 },
        { x: 60, y: 130, w: 390, h: 355 },
        { x: 70, y: 120, w: 370, h: 370 }
      ]

      const hand = [
        { x: 40, y: 70, w: 430, h: 170 },
        { x: 40, y: 90, w: 430, h: 170 },
        { x: 40, y: 110, w: 430, h: 170 },
        { x: 40, y: 90, w: 430, h: 170 },
        { x: 40, y: 70, w: 430, h: 170 }
      ]

      for (let i = 0; i < 5; i++) {
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(userImg, squash[i].x, squash[i].y, squash[i].w, squash[i].h)
        ctx.drawImage(handFrames[i % handFrames.length], hand[i].x, hand[i].y, hand[i].w, hand[i].h)

        encoder.addFrame(ctx)
      }

      encoder.finish()

      const gifBuffer = await new Promise((resolve) => {
        stream.on('end', () => resolve(Buffer.concat(chunks)))
      })

      const webpBuffer = await sharp(gifBuffer, { animated: true })
        .webp({ loop: 0, quality: 75 })
        .toBuffer()

      const sticker = await addExif(webpBuffer, packname, author)

      await client.sendMessage(m.chat, { sticker }, { quoted: m })

    } catch (e) {
      console.error(e)
      m.reply(`${e.message}`)
    }
  }
}
