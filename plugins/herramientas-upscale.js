import axios from 'axios'
import FormData from 'form-data'
import uploadImage from '../lib/uploadImage.js'

async function upscale(imageUrl, resolution = '1080p', enhance = true) {
  if (!/^https?:\/\/.+\.(jpe?g|png|webp|gif)$/i.test(imageUrl))
    throw new Error('ga valid, dasar senpai bodoh!')

  if (!['480p', '720p', '1080p', '2k', '4k', '8k', '12k'].includes(resolution.toLowerCase()))
    throw new Error('Resolusi ga valid: pilih 480p, 720p, 1080p, 2k, 4k,8k,12k')

  const { data: imageBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' })

  const form = new FormData()
  form.append('image', imageBuffer, { filename: 'image.jpg' })
  form.append('resolution', resolution.toLowerCase())
  form.append('enhance', enhance.toString())

  const { data } = await axios.post(
    'https://upscale.cloudkuimages.guru/hd.php',
    form,
    {
      headers: {
        ...form.getHeaders(),
        origin: 'https://upscale.cloudkuimages.guru',
        referer: 'https://upscale.cloudkuimages.guru/',
      },
      maxBodyLength: Infinity,
    }
  )

  if (data?.status !== 'success') throw new Error('Upscale gagal: ' + JSON.stringify(data))

  const result = data.data
  return {
    status: data.status,
    url: result.url,
    filename: result.filename,
    original: result.original,
    resolution_from: result.original_resolution,
    resolution_to: result.resolution_now,
    enhanced: result.enhanced,
    size_before: result.original_size,
    size_after: result.new_size
  }
}
const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mimetype?.includes('image'))
    return m.reply(`📸 *Responde a una imagen* con el comando *${usedPrefix + command}* para mejorarla.`)

  try {
    const q = m.quoted || m
    const media = await q.download()
    const imageUrl = await uploadImage(media)

    m.reply('⏳ Procesando imagen en resolución *12K* con mejora aplicada...')

    const result = await upscale(imageUrl, '12k', true)

    await conn.sendFile(
      m.chat,
      result.url,
      result.filename || 'upscaled.jpg',
      `✅ Imagen mejorada con éxito:
📤 Resolución: *${result.resolution_from}* → *${result.resolution_to}*
📦 Tamaño: *${result.size_before}* → *${result.size_after}*
✨ Mejora aplicada: *${result.enhanced ? 'Sí' : 'No'}*`,
      m
    )
  } catch (err) {
    m.reply('❌ Error al mejorar la imagen:\n' + err.message)
  }
}

handler.help = ['upscale']
handler.tags = ['ai', 'image']
handler.command = /^upscale$/i
handler.register = true
export default handler