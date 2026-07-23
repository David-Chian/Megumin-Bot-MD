import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tiktok'],
  category: 'downloader',
  run: async ({sock, m, args, command}) => {

    if (!args.length) {
      return m.reply(`✿ Ingresa un término o enlace de TikTok.`)
    }

    const urls = args.filter(arg => arg.includes("tiktok.com"))

    if (urls.length) {
      if (urls.length > 1) {
        const medias = []
        for (const url of urls.slice(0, 10)) {
          try {
            const apiUrl = `${api.url}/dl/tiktok?url=${url}&key=${api.key}`
            const res = await fetch(apiUrl)
            if (!res.ok) throw new Error(`El servidor respondió con ${res.status}`)
            const json = await res.json()
            const data = json.data
            if (!data) continue

            const {
              title = 'Sin título',
              dl,
              duration,
              author = {},
              stats = {},
              music = {},
              type
            } = data

            const caption =
              `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ\n\n` +
              `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
              `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
              `𖣣ֶㅤ֯⌗ ❃ ⬭ Duración: ${duration || 'N/A'}\n` +
              `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ❖ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ⚡︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
              `𖣣ֶㅤ֯⌗ ꕥ ⬭ Audio: ${music.title ? music.title + ' -' : 'Desconocido'} ${music.author || ''}`

            medias.push({
              type: type,
              data: { url: dl },
              caption
            })
          } catch (e) {
            continue
          }
        }
if (medias.length === 1) {
  await sock.sendMessage(
    m.chat,
    { [type]: dl, caption },
    { quoted: m }
  )
} else if (medias.length >= 2) {
  await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
 }
      } else {
        const url = urls[0]
        try {
          const apiUrl = `${api.url}/dl/tiktok?url=${url}&key=${api.key}`
          const res = await fetch(apiUrl)
          if (!res.ok) throw new Error(`El servidor respondió con ${res.status}`)
          const json = await res.json()
          const data = json.data
          if (!data) return m.reply(`✿ No se encontraron resultados para: ${url}`)

          const {
            title = 'Sin título',
            dl,
            duration,
            author = {},
            stats = {},
            music = {},
            type
          } = data

          const caption =
            `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ\n\n` +
            `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
            `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
            `𖣣ֶㅤ֯⌗ ❖ ⬭ Duración: ${duration || 'N/A'}\n` +
            `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ꕥ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ❒ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ⚡︎ ⬭ Audio: ${music.title ? music.title + ' -' : 'Desconocido'} ${music.author || ''}`

await sock.sendMessage(
  m.chat,
  { [type]: { url: dl }, caption },
  { quoted: m }
)
        } catch (e) {
          await m.reply(msgglobal)
        }
      }
    } else {
      const query = args.join(" ")
      try {
        const apiUrl = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`El servidor respondió con ${res.status}`)
        const json = await res.json()
        const results = json.data

        if (!results || results.length === 0) {
          return m.reply(`❖ No se encontraron resultados para: ${query}`)
        }

        const medias = []
        for (const data of results.slice(0, 5)) {
          const {
            title = 'Sin título',
            dl,
            duration,
            author = {},
            stats = {},
            music = {},
          } = data

          const caption =
            `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ\n\n` +
            `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
            `𖣣ֶㅤ֯⌗ ❑ ⬭ Autor: ${author.nickname || author.unique_id || 'Desconocido'}\n` +
            `𖣣ֶㅤ֯⌗ ❀ ⬭ Duración: ${duration || 'N/A'}\n` +
            `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ★ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ❖ ⬭ Vistas: ${(stats.views || stats.plays || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ꕥ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Audio: ${music.title ? music.title + ' -' : 'Desconocido'} ${music.author || ''}`

          medias.push({
            type: 'video',
            data: { url: dl },
            caption
          })
        }

        if (medias.length) {
          await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
        } else {
          await m.reply('✿ No se pudieron procesar los resultados.')
        }
      } catch (e) {
        m.reply(msgglobal)
      }
    }
  },
};