import fetch from 'node-fetch';
import FormData from 'form-data';

function generateUniqueFilename(mime) {
  const ext = mime.split('/')[1] || 'bin'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${id}.${ext}`
}

async function uploadToCatbox(buffer, mime) {
  const form = new FormData()
  form.append("userhash", "cdc63d84aafd23061a73d96fb")
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, { filename: generateUniqueFilename(mime) })

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  })

  const text = await res.text()
  if (!text.startsWith('https://')) {
    throw new Error('Respuesta inválida de Catbox: ' + text)
  }
  return text.trim()
}

export default {
  command: ['seticon'],
  category: 'socket',
  run: async ({sock, m, args}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const value = args.join(' ').trim()

    if (!value && !m.quoted && !m.message.imageMessage)
      return m.reply('✿ Debes enviar o citar una imagen para cambiar el icon del bot.')

    if (value.startsWith('http')) {
      config.icon = value
      await updateSettings(idBot, 'icon', config.icon)
      return m.reply(`❖ Se ha actualizado el icon de *${config.namebot2}*!`)
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g|gif)/.test(mime))
      return m.reply('❖ Responde a una imagen válida.')

    const media = await q.download()
    if (!media) return m.reply('✿ No se pudo descargar la imagen.')

    const link = await uploadToCatbox(media, mime)
    config.icon = link

    await updateSettings(idBot, 'icon', config.icon)
    return m.reply(`✿ Se ha actualizado el icon de *${config.namebot2}*!`)
  },
}
