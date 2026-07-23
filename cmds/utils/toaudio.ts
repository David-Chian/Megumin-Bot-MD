import fs        from 'fs'
import path      from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = path.resolve(__dirname, '../../core/system/tmp')

export default {
  command: ['tovoz', 'toaudio'],
  category: 'tools',

  run: async ({ sock, m, command }) => {
    const chatId = m.chat
    const q      = m.quoted || m
    const mime   = (q.msg || q).mimetype || ''

    const isAudio = /audio/.test(mime)
    const isVideo = /video/.test(mime)

    if (command === 'tovoz' && !isAudio && !isVideo)
      return m.reply('❌ Responde a un *audio* o *video* para convertirlo en nota de voz.')

    if (command === 'toaudio' && !isVideo)
      return m.reply('❌ Responde a un *video* para extraer su audio.')

    await sock.sendMessage(chatId, {
      react: { text: command === 'tovoz' ? '🎙️' : '🎵', key: m.key }
    }).catch(() => {})

    fs.mkdirSync(TMP_DIR, { recursive: true })

    const ts      = Date.now()
    const inPath  = path.join(TMP_DIR, `${command}_${ts}_in`)
    const outPath = path.join(TMP_DIR, `${command}_${ts}.${command === 'tovoz' ? 'ogg' : 'mp3'}`)

    try {
      const buffer = await q.download()
      if (!buffer) return m.reply('❌ No se pudo descargar el archivo.')

      fs.writeFileSync(inPath, buffer)

      if (command === 'tovoz') {
        execSync(
          `ffmpeg -y -i "${inPath}" -vn -c:a libopus -b:a 64k -vbr on -ar 48000 "${outPath}"`,
          { stdio: 'pipe' }
        )
        await sock.sendMessage(chatId, {
          audio:    fs.readFileSync(outPath),
          mimetype: 'audio/ogg; codecs=opus',
          ptt:      true
        }, { quoted: m })

      } else {
        execSync(
          `ffmpeg -y -i "${inPath}" -vn -c:a libmp3lame -q:a 2 "${outPath}"`,
          { stdio: 'pipe' }
        )
        await sock.sendMessage(chatId, {
          audio:    fs.readFileSync(outPath),
          mimetype: 'audio/mpeg',
          ptt:      false
        }, { quoted: m })
      }

    } catch (e) {
      console.error(`[${command.toUpperCase()}]`, e)
      return m.reply(`⚠️ Error al procesar el archivo: ${e.message}`)
    } finally {
      if (fs.existsSync(inPath))  fs.unlinkSync(inPath)
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath)
    }
  }
}