import fetch from 'node-fetch'
import FormData from 'form-data'
import FileType from 'file-type'

export default async function uploadImage(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Buffer inválido')
  }

  let type
  try {
    type = await FileType.fromBuffer(buffer)
  } catch {
    type = null
  }

  const mime = type?.mime || 'application/octet-stream'
  const ext = type?.ext || 'bin'

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg'
  ]

  if (!allowed.includes(mime)) {
    throw new Error(`Formato no soportado: ${mime}`)
  }

  const uploadToCatbox = async () => {
    const form = new FormData()

    form.append('fileToUpload', buffer, {
      filename: `file.${ext}`,
      contentType: mime
    })
    form.append('reqtype', 'fileupload')

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      throw new Error(`Catbox HTTP ${res.status}`)
    }

    const text = await res.text()
    if (!text.startsWith('https://files.catbox.moe/')) {
      throw new Error('Respuesta inválida de Catbox')
    }

    return text.trim()
  }

  const uploadToPomf = async () => {
    const form = new FormData()
    form.append('files[]', buffer, {
      filename: `file.${ext}`,
      contentType: mime
    })

    const res = await fetch('https://pomf.lain.la/upload.php', {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      throw new Error(`Pomf HTTP ${res.status}`)
    }

    const json = await res.json()
    if (!json?.success || !json.files?.[0]?.url) {
      throw new Error('Respuesta inválida de Pomf')
    }

    return json.files[0].url
  }

  try {
    return await uploadToCatbox()
  } catch (e1) {
    try {
      return await uploadToPomf()
    } catch (e2) {
      throw new Error(
        `Falló upload | Catbox: ${e1.message} | Pomf: ${e2.message}`
      )
    }
  }
}