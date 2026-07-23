import googleTTS from 'google-tts-api'
import axios     from 'axios'
import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = path.resolve(__dirname, '../../core/system/tmp')

export default {
  command: ['tts'],
  category: 'tools',

  run: async ({ sock, m, args }) => {
    const chatId = m.chat
    const quoted = m.quoted
    const repliedText = quoted
      ? (quoted.text || quoted.caption || '').trim()
      : null
    let lang = 'es'
    let speechText = ''
    if (repliedText) {
      if (args[0] && args[0].length <= 5) lang = args[0].toLowerCase()
      speechText = repliedText
    } else {
      const input = args.join(' ').trim()
      if (!input)
        return m.reply(
          `🗣️ *Uso:* /tts <texto>\n` +
          `Ejemplo: */tts Hola mundo*\n\n` +
          `También puedes responder a un mensaje:\n` +
          `*/tts es* (responde cualquier texto)\n\n` +
          `Con idioma: */tts en Hello* | */tts ja おはよう*`
        )
      const firstWord = args[0]
      if (/^[a-z]{2,5}$/i.test(firstWord) && args.length > 1) {
        lang       = firstWord.toLowerCase()
        speechText = args.slice(1).join(' ').trim()
      } else {
        speechText = input
      }
    }
    if (!speechText)
      return m.reply('❌ No hay texto para convertir.')

    await sock.sendMessage(chatId, {
      react: { text: '🔊', key: m.key }
    }).catch(() => {})

    const ts      = Date.now()
    const oggPath = path.join(TMP_DIR, `tts_${ts}.ogg`)
    
    const tempFiles = []

    try {
      fs.mkdirSync(TMP_DIR, { recursive: true })

      const audioUrls = googleTTS.getAllAudioUrls(speechText, {
        lang,
        slow: false,
        host: 'https://translate.google.com'
      })

      const downloadPromises = audioUrls.map(urlInfo => 
        axios.get(urlInfo.url, { responseType: 'arraybuffer' })
      )
      const audioBuffers = await Promise.all(downloadPromises)

      for (let i = 0; i < audioBuffers.length; i++) {
        const tempMp3Path = path.join(TMP_DIR, `tts_${ts}_${i}.mp3`)
        fs.writeFileSync(tempMp3Path, audioBuffers[i].data)
        tempFiles.push(tempMp3Path)
      }

      const concatString = tempFiles.map(file => `file '${file}'`).join('\n')
      const listPath = path.join(TMP_DIR, `tts_list_${ts}.txt`)
      fs.writeFileSync(listPath, concatString)
      tempFiles.push(listPath)

      execSync(
        `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:a libopus -b:a 64k -vbr on -ar 48000 "${oggPath}"`,
        { stdio: 'pipe' }
      )

      await sock.sendMessage(chatId, {
        audio:    { url: oggPath },
        mimetype: 'audio/ogg; codecs=opus',
        ptt:      true
      }, { quoted: m })

    } catch (e) {
      console.error('[TTS]', e)
      return m.reply(`⚠️ No se pudo generar el audio: ${e.message}`)
    } finally {
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file)
      })
      if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath)
    }
  }
}