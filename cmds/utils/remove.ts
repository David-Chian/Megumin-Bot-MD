import axios from 'axios'
import FormData from 'form-data'

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'bin'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToUguu(buffer, mime) {
  const form = new FormData()
  form.append('files[]', buffer, generateUniqueFilename(mime))

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 30000
  })

  const data = res.data
  const url = data?.files?.[0]?.url
  if (!url) throw new Error("Respuesta inválida de Uguu: " + JSON.stringify(data))
  return url
}

async function removeBgFromUrl(url) {
  const apiUrl = `${api.url}/tools/removebg?method=url&url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await axios.get(apiUrl, { responseType: 'arraybuffer' })
  if (!res.data) {
    throw new Error('Respuesta inválida del servidor de removebg')
  }
  return Buffer.from(res.data)
}

export default {
  command: ['removebg'],
  category: 'utils',
  run: async ({sock, m, args, command, text, prefix}) => {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* para removerle el fondo.`,
        m
      )
    }
    try {
      const media = await q.download()
      const uguuUrl = await uploadToUguu(media, mime)
      const bufferNoBg = await removeBgFromUrl(uguuUrl)
      await sock.sendMessage(m.chat, { image: bufferNoBg }, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}
