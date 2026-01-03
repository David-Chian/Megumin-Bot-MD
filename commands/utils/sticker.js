import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'

function msToTime(ms) {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${h}h ${m}m ${s}s`
}

async function generarStickerConTexto(texto) {
    const width = 512
    const height = 512
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const imagenes = [
        'https://files.catbox.moe/rzgivf.jpg',
        'https://files.catbox.moe/2ow4nj.jpg',
        'https://files.catbox.moe/szlipu.jpg',
        'https://files.catbox.moe/a0c3cn.jpg',
        'https://files.catbox.moe/2diw0t.jpg',
        'https://files.catbox.moe/7ltk21.jpg',
        'https://files.catbox.moe/u4jpic.jpg',
        'https://files.catbox.moe/0upi11.jpg',
        'https://files.catbox.moe/vzw6ij.jpg',
        'https://files.catbox.moe/rjfkuu.jpg',
        'https://files.catbox.moe/dv575j.jpg'
    ]
    const url = imagenes[Math.floor(Math.random() * imagenes.length)]
    const baseImage = await loadImage(url)
    ctx.drawImage(baseImage, 0, 0, width, height)
    ctx.font = '40px Sans'
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    let x = 260
    let y = 360
    let maxWidth = 300
    let lines = []
    let line = ''
    for (const word of texto.split(' ')) {
        const test = line + word + ' '
        if (ctx.measureText(test).width < maxWidth) line = test
        else { lines.push(line.trim()); line = word + ' ' }
    }
    if (line) lines.push(line.trim())
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * 35))
    return canvas.toBuffer()
}

export default {
  command: ['sticker', 's'],
  category: 'utils',
  run: async ({client, m, args}) => {
    try {
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      let botSettings = global.db.data.settings[botId]
      let botname = botSettings.namebot
      let user = global.db.data.users[m.sender]
      let user2 = global.db.data.chats[m.chat].users[m.sender]
      const name = user.name
      let text1 = user.metadatos || `♯𝐓꯭̱𝔥̱𝑒̱ . ㌦‥ꪱ꯭̱ꪆ꯭̱í̱α꯭̱ო꯭̱ꤩꤨօ꯭̱ղ꯭̱꤬ძ ̱  ──͟͞🄱̱ǿ̱𝔱…ꤩꤨ‧💎`
      let text2 = user.metadatos2 || `Socket:\n↳@${botname}\n👹Usuario:\n↳@${name}`
      
      const q = m.quoted || m
      const mime = (q.msg || q).mimetype || ''
      let media

      if (!args[0] && !mime) {
        return client.reply(m.chat, '✧ Envía o responde a una imagen/video/texto para convertirlo en sticker.', m)
      }

if (/image/.test(mime)) {
  media = await q.download()
  let enc = await client.sendImageAsSticker(
    m.chat,
    media,
    m,
    { packname: text1, author: text2 }
  )
  await fs.unlinkSync(enc)
} else if (/video/.test(mime)) {
  if ((q.msg || q).seconds > 20)
    return m.reply('El video es muy largo.')

  media = await q.download()
  let enc = await client.sendVideoAsSticker(
    m.chat,
    media,
    m,
    { packname: text1, author: text2 }
  )
  await new Promise(r => setTimeout(r, 2000))
  await fs.unlinkSync(enc)
} else if (args.length) {
  let texto = args.join(' ')
  if (texto.length > 30) return m.reply('El texto no puede tener más de 30 caracteres.')
  let buffer = await generarStickerConTexto(texto)
  let enc = await client.sendImageAsSticker(m.chat, buffer, m, { packname: text1, author: text2 })
  await fs.unlinkSync(enc)
} else if (q.text && q.text !== m.text) {
  let texto = q.text
  if (texto.length > 30) return m.reply('El texto no puede tener más de 30 caracteres.')
  let buffer = await generarStickerConTexto(texto)
  let enc = await client.sendImageAsSticker(m.chat, buffer, m, { packname: text1, author: text2 })
  await fs.unlinkSync(enc)

} else {
  return client.reply(m.chat, 'Envía imagen, video o texto para hacer sticker.', m)
}

      if (isFree) botSettings.freeUses_sticker.count++

    } catch (e) {
      m.reply(msgglobal + e)
    }
  }
}