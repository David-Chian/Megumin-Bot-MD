import axios from 'axios'

async function uploadAudio(mp3Url) {
  try {
    const audioRes = await axios.get(mp3Url, { responseType: 'arraybuffer' })
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2)
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="fileName"; filename="audio.mp3"\r\n`),
      Buffer.from(`Content-Type: audio/mpeg\r\n\r\n`),
      Buffer.from(audioRes.data),
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    const res = await axios.post('https://aivocalremover.com/api/v2/FileUpload', multipartBody, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length,
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    const { data } = res
    if (data?.error) throw new Error(data.message)

    return { key: data.key, file_name: data.file_name }
  } catch (err) {
    throw new Error('Error al subir el audio: ' + err.message)
  }
}

async function processAudio(file_name, key) {
  const params = new URLSearchParams({
    file_name,
    action: 'watermark_video',
    key,
    web: 'web'
  })

  try {
    const res = await axios.post('https://aivocalremover.com/api/v2/ProcessFile', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    const { data } = res
    if (data?.error) throw new Error(data.message)

    return {
      vocal: data.vocal_path,
      instrumental: data.instrumental_path
    }
  } catch (err) {
    throw new Error('Error al procesar el audio: ' + err.message)
  }
}

export default {
  command: ['rvocal'],
  category: 'utils',
  run: async ({client, m, args}) => {
     const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''
    if (!mime) {
      return client.reply(
        m.chat,
        `《✧》 Por favor, responde a un audio , música con el comando *${prefa}rvocal*.`,
        m
      )
    }

  m.reply('⏳ Procesando el audio, por favor espera...')

  try {
    const audio = await m.quoted.download()
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2)

    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="fileName"; filename="audio.mp3"\r\n`),
      Buffer.from(`Content-Type: audio/mpeg\r\n\r\n`),
      Buffer.from(audio),
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    const res = await axios.post('https://aivocalremover.com/api/v2/FileUpload', multipartBody, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length,
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    const { key, file_name } = res.data
    const { vocal, instrumental } = await processAudio(file_name, key)

    if (!vocal || !instrumental) return m.reply('❌ No se pudo obtener el audio separado.')

    await client.sendMessage(m.chat, {
      audio: { url: instrumental },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    await client.sendMessage(m.chat, {
      audio: { url: vocal },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (err) {
    m.reply(`❌ Ocurrió un error: ${err.message}`)
  }
}}