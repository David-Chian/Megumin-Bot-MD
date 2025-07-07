import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, command, user }) => {
  conn.hdr = conn.hdr || {}
  if (m.sender in conn.hdr) { return m.reply('Todavía hay un proceso en curso, espera un momento...')
}

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  if (!mime) { return m.reply('Envía o responde a una imagen primero.')
}
  if (!/image\/(jpe?g|png)/.test(mime)) throw `Formato ${mime} no soportado.`

  conn.hdr[m.sender] = true
  await conn.sendMessage(m.chat, { react: { text: "♻️", key: m.key } })

  let img = await q.download?.()
  let error

  try {
    const imageUrl = await uploadToCatbox(img)
    const api = `https://fastrestapis.fasturl.cloud/aiimage/upscale?imageUrl=${encodeURIComponent(imageUrl)}&resize=4`
    const res = await fetch(api)
    const buffer = await res.buffer()
    await conn.sendFile(m.chat, buffer, 'hd.jpg', '🔥 Aquí tienes la imagen en HD.', m)
  } catch(e) {
    error = true
  } finally {
    if (error) m.reply(`${e.message}`)
    delete conn.hdr[m.sender]
  }
}

handler.help = ['hd', 'remini']
handler.tags = ['upscaler']
handler.command = /^(hd|remini)$/i

export default handler

async function uploadToCatbox(buffer) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, 'image.jpg')
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  const url = await res.text()
  if (!url.startsWith('https://')) throw 'Falló la subida a Catbox.'
  return url.trim()
}