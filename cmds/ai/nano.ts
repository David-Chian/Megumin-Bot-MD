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

async function generateNanoFromUrl(imageUrl, prompt) {
  const apiUrl = `https://www.00cc.eu.cc/banana?image=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`
  const res = await axios.get(apiUrl, { timeout: 60000 })

  const data = res.data
  if (!data?.success || !data?.result?.success || !data?.result?.url) {
    throw new Error('Respuesta inválida del servidor de NanoBanana: ' + JSON.stringify(data))
  }

  return data.result.url
}

async function downloadResultImage(resultUrl) {
  const res = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 30000 })
  return Buffer.from(res.data)
}

export default {
  command: ['nano', 'nanobanana'],
  category: 'ai',
  run: async ({sock, m, args, command, text, prefix}) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) {
      return sock.reply(
        m.chat,
        `✿ Por favor, responde a una imagen con el comando *${prefix + command}* y escribe la descripción.`,
        m
      )
    }

    const prompt = text?.trim() || ' '

    try {
      const media = await q.download()
      const originalUrl = await uploadToUguu(media, mime)
      const resultUrl = await generateNanoFromUrl(originalUrl, prompt)

      await sock.sendMessage(
  m.chat,
  { image: { url: resultUrl }, caption: null },
  { quoted: m }
)
    } catch (e) {
      console.error('[nano]', e)
      await m.reply(msgglobal)
    }
  }
}