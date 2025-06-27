import axios from 'axios'
import FormData from 'form-data'

const upscale = async (imageUrl, resolution = '12k', enhancement = true) => {
  if (!/^https?:\/\/.+\.(jpe?g|png|webp|gif)$/i.test(imageUrl))
    throw new Error('❌ URL de imagen no válida.')

  if (!['480p', '720p', '1080p', '2k', '4k', '8k', '12k'].includes(resolution.toLowerCase()))
    throw new Error('❌ Resolución no válida. Usa: 480p, 720p, 1080p, 2k, 4k, 8k, 12k')

  const { data: imageBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' })

  const form = new FormData()
  form.append('image', imageBuffer, { filename: 'image.jpg' })
  form.append('resolution', resolution.toLowerCase())
  form.append('enhancement', enhancement.toString())

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

  if (data?.status !== 'success') throw new Error('Upscale falló: ' + JSON.stringify(data))
  return data.data.url
}

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted || !m.quoted.mimetype?.includes('image'))
    return m.reply(`📸 *Responde a una imagen* con el comando *${usedPrefix + command}* para mejorarla.`)

  try {
    const q = m.quoted || m
    const media = await q.download()
    const uploadImage = (await import('../lib/uploadImage.js')).default
    const imageUrl = await uploadImage(media)

    m.reply('⏳ Procesando imagen en resolución *12K* con mejora aplicada...')

    const improvedUrl = await upscale(imageUrl, '12k', true)
    await conn.sendFile(m.chat, improvedUrl, 'upscaled.jpg', '✅ Imagen mejorada con éxito (12k + enhance)', m)
  } catch (err) {
    m.reply('❌ Error al mejorar la imagen.\n' + err.message)
  }
}

handler.help = ['upscale']
handler.tags = ['ai', 'image']
handler.command = /^upscale$/i
handler.register = true
export default handler