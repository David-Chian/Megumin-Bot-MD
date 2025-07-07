import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
    return m.reply(`Error responde o envia una imagen con el comando:\n*${usedPrefix + command}*`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filename = `upscaled_${Date.now()}.${ext}`

    const form = new FormData()
    form.append('image', media, { filename, contentType: mime })
    form.append('scale', '2')

    const headers = {
      ...form.getHeaders(),
      'accept': 'application/json',
      'x-client-version': 'web',
      'x-locale': 'en'
    }

    const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
      method: 'POST',
      headers,
      body: form
    })

    const json = await res.json()

    if (!json?.result_url || !json.result_url.startsWith('http')) {
      throw new Error('Gagal mendapatkan URL hasil dari Pixelcut.')
    }

    const resultBuffer = await (await fetch(json.result_url)).buffer()

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `
✨ *Tu imagen ha sido mejorada a una resolución 2x.*
   🔧 _Usa esta función cuando necesites aclarar imágenes borrosas._
`.trim()
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply(`❌ Ocurrio un error:\n${err.message || err}`)
  }
}

handler.help = ['upscale']
handler.tags = ['tools', 'image']
handler.command = /^(upscale|hd)$/i

export default handler