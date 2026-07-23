import fs from 'fs'
import acrcloud from 'acrcloud'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
})

const TMP_DIR = path.resolve(__dirname, '../../core/system/tmp')

export default {
  command: ['quemusica', 'quemusicaes', 'whatmusic'],
  category: 'tools',

  run: async ({ sock, m }) => {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''

    if (!/audio|video/.test(mime))
      return m.reply('❌ Responde a un audio o video para identificar la música.')

    if ((quoted.msg || quoted).seconds > 20)
      return m.reply('❗ El archivo es muy largo. Recórtalo a 10-20 segundos e intenta de nuevo.')

    const media = await quoted.download()
    const ext = mime.split('/')[1]
    const filePath = path.join(TMP_DIR, `${m.sender}.${ext}`)

    try {
      fs.mkdirSync(TMP_DIR, { recursive: true })
      fs.writeFileSync(filePath, media)

      const result = await acr.identify(fs.readFileSync(filePath))
      const { code, msg } = result.status

      if (code !== 0)
        return m.reply(`❌ No se pudo identificar la canción: ${msg}`)

      const music = result.metadata.music[0]
      const { title, artists, album, genres, release_date } = music

      const artistNames = artists?.map(a => a.name).join(', ') || 'Desconocido'
      const genreNames  = genres?.map(g => g.name).join(', ')   || 'Desconocido'

      return m.reply(
        `🎵 *Canción identificada*\n\n` +
        `*Título:* ${title         || 'Desconocido'}\n` +
        `*Artista:* ${artistNames}\n` +
        `*Álbum:* ${album?.name    || 'Desconocido'}\n` +
        `*Género:* ${genreNames}\n` +
        `*Lanzamiento:* ${release_date || 'Desconocido'}`
      )
    } catch (e) {
      return m.reply(`❌ Ocurrió un error: ${e?.message || e}`)
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
  }
}