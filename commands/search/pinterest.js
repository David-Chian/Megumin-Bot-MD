import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',

  run: async ({ client, m, args }) => {
    const text = args.join(' ')

    if (!text) {
      return m.reply(
        '《✧》 Ingresa un *término* de búsqueda en Pinterest.'
      )
    }

    try {
      await m.reply('📌 Buscando en Pinterest...')

      const res = await fetch(
        `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=freeApikey`
      )

      const json = await res.json()

      if (!json.success || !json.data?.result?.length) {
        return m.reply(`✐ No se encontraron resultados para *${text}*`)
      }

      const results = json.data.result
      const pin = results[Math.floor(Math.random() * results.length)]

      const imageUrl =
        pin.images?.['736x']?.url ||
        pin.images?.['345x']?.url ||
        pin.images?.['236x']?.url

      if (!imageUrl) {
        return m.reply('⚠️ No se pudo obtener la imagen.')
      }

      const caption =
        `➩ Resultados para › *${text}*\n\n` +
        `✿ Descripción › *${pin.description || 'Sin descripción'}*\n` +
        `❖ Autor › *${pin.native_creator?.full_name || 'Desconocido'}*\n` +
        `♡ Guardados › *${pin.aggregated_pin_data?.aggregated_stats?.saves || 0}*\n` +
        `❀ Fecha › *${pin.created_at || '—'}*\n`

      await client.sendMessage(
        m.chat,
        {
          image: { url: imageUrl },
          caption
        },
        { quoted: m }
      )

    } catch (e) {
      console.error('[Pinterest Error]', e)
      await client.reply(
        m.chat,
        '⚠️ Error al obtener resultados de Pinterest.',
        m
      )
    }
  }
}