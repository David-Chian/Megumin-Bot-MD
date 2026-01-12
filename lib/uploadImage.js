import fetch from 'node-fetch'
import FormData from 'form-data'
import FileType from 'file-type'

export default async function uploadImage(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('Buffer inválido')

  const type = await FileType.fromBuffer(buffer)
  const mime = type?.mime || 'image/jpeg'
  const ext = type?.ext || 'jpg'

  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime)) {
    throw new Error(`Formato no soportado: ${mime}`)
  }

  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('userhash', '')
  form.append('fileToUpload', buffer, {
    filename: `image.${ext}`,
    contentType: mime
  })

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  })

  const text = await res.text()

  if (!text.startsWith('https://files.catbox.moe/')) {
    throw new Error(`Catbox respondió algo inválido:\n${text}`)
  }

  return text.trim()
}