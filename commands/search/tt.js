import fetch from 'node-fetch'

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',

  run: async ({ client, m, args }) => {
    if (!args.length) {
      return client.reply(
        m.chat,
        '❌ Ingresa un término de búsqueda.',
        m
      )
    }

    const query = args.join(' ')
    const limit = 5

    try {
      const res = await fetch(
        `https://api.dorratz.com/v2/tiktok-s?q=${encodeURIComponent(query)}&limit=${limit}`
      )

      const json = await res.json()

      if (json.status !== 200 || !json.data?.length) {
        return client.reply(
          m.chat,
          `⚠️ No se encontraron resultados para "${query}".`,
          m
        )
      }

      let text = `✔ *Resultados de TikTok*\n`
      text += `ッ *Búsqueda:* ${query}\n\n`

      json.data.forEach((v, i) => {
        text += `◆ *${i + 1}. ${v.title || 'Sin título'}*\n`
        text += `★ Autor: @${v.author?.username || 'desconocido'}\n`
        text += `● Vistas: ${v.play}\n`
        text += `♧ Likes: ${v.like}\n`
        text += `◇ Comentarios: ${v.coment}\n`
        text += `♡ Compartidos: ${v.share}\n`
        text += `☆ URL: ${v.url}\n`
        text += `╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼\n`
      })

      await client.reply(m.chat, text.trim(), m)

    } catch (e) {
      console.error('[TikTok Search Error]', e)
      await client.reply(
        m.chat,
        '❌ Error al buscar en TikTok.',
        m
      )
    }
  }
}