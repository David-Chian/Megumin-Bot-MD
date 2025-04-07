import axios from 'axios'
import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `🧧 Ingrese un enlace de MediaFire.\n*Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/nb63btgjr0dsn4z/COMDELIGHT_v1.1.apk/file`

  let url = args[0]
  try {
    await m.react('🕒')
    try {
      let res = await fetch(`https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(url)}`)
      let json = await res.json()
      if (!json.data || json.data.length === 0) throw new Error('No se encontraron datos en API 1.')
      let file = json.data[0]
      return await enviarArchivo(conn, m, file.nama, file.size, file.mime, file.link)
    } catch (e1) {
      console.log('❌ API 1 falló:', e1.message)
    }
    try {
      let res = await fetch(`${global.APIs.fgmods.url}/downloader/mediafire?url=${url}&apikey=${global.APIs.fgmods.key}`)
      let json = await res.json()
      let file = json.result
      return await enviarArchivo(conn, m, file.title, file.filesize, file.mimetype, file.url)
    } catch (e2) {
      console.log('❌ API 2 falló:', e2.message)
    }
    try {
      let res = await fetch(`https://api.siputzx.my.id/api/d/mediafire?url=${url}`)
      let json = await res.json()
      if (!json.status || !json.data) throw new Error('No se encontraron datos en API 3.')
      for (const file of json.data) {
        await enviarArchivo(conn, m, file.filename, file.size, file.mime, file.link)
      }
      return
    } catch (e3) {
      console.log('❌ API 3 falló:', e3.message)
    }

    try {
      let { name, size, mime, link } = await mediafireDl(url)
      return await enviarArchivo(conn, m, name, size, mime, link)
    } catch (e4) {
      console.log('❌ Scraping falló:', e4.message)
    }

    await m.react('❌')
    return await conn.reply(m.chat, '💔 No se pudo descargar el archivo. Intenta más tarde o verifica el enlace.', m)

  } catch (err) {
    console.error(err)
    return await conn.reply(m.chat, `Error inesperado. Prueba con: ${usedPrefix + command}2`, m)
  }
}

handler.help = ['mediafire'].map(v => v + ' <url>')
handler.tags = ['descargas']
handler.command = /^(mediafire|mdfire|mf)$/i
handler.register = true
export default handler

async function enviarArchivo(conn, m, name, size, mime, link) {
  let caption = `📄 *Nombre:* ${name}\n📦 *Tamaño:* ${size}\n📌 *Formato:* ${mime}\n🔗 *Descargado desde:* MediaFire`

  await conn.sendMessage(m.chat, {
    document: { url: link },
    fileName: name,
    mimetype: mime || 'application/octet-stream',
    caption
  }, { quoted: m })

  await m.react('✅')
}

async function mediafireDl(url) {
  const res = await axios.get(`https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`)
  const $ = cheerio.load(res.data)
  const link = $('#downloadButton').attr('href')
  const name = $('.promoDownloadName').text().trim().replace(/\s+/g, ' ')
  const size = $('#downloadButton').text().replace(/Download|||\n/g, '').trim()
  const headRes = await axios.head(link)
  const mime = headRes.headers['content-type']
  return { name, size, mime, link }
}