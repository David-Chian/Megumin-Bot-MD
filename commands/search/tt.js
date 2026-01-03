import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  run: async ({client, m, args}) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const banner = botSettings.icon

    if (!args || !args.length) {
      return client.reply(
        m.chat,
        `《✧》 Ingresa un término de búsqueda.`,
        m,
      )
    }

    const query = args.join(' ')
    const url = `${api.url}/search/tiktok?query=${query}&key=${api.key}`

    // await m.reply(mess.wait)

    try {
      const res = await fetch(url)
      const json = await res.json()

      if (!json || !json.data || !json.data.length) {
        return client.reply(m.chat, `《✧》 No se encontraron resultados para "${query}".`, m)
      }

      let message = ``
      json.data.forEach((result, index) => {
        message += `➩ *Título ›* ${result.title}

✎ *Autor ›* ${result.author.nickname} (@${result.author.unique_id})
ꕥ *Reproducciones ›* ${result.stats.views}
❖ *Comentarios ›* ${result.stats.comments}
❒ *Compartidos ›* ${result.stats.shares}
♡ *Me gusta ›* ${result.stats.likes}
★ *Descargas ›* ${result.downloads}
❀ *Duración ›* ${result.duration}
✧ *URL ›* https://www.tiktok.com/@${result.author.unique_id}/video/${result.video_id}

${index < json.data.length - 1 ? '╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼' : ''}
        `
      })

      await client.sendMessage(
        m.chat,
        {
          image: { url: banner },
          caption: message.trim(),
        },
        { quoted: m },
      )
    } catch (e) {
      await m.reply(msgglobal)
    }
  },
};
