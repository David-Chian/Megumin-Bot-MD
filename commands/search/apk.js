import axios from 'axios'

export default {
  command: ['aptoide', 'apk', 'apkdl'],
  category: 'search',

  run: async ({ client, m, args }) => {
    if (!args.length) {
      return m.reply(
        '《✧》 Ingresa el *nombre* de la *aplicación*.'
      )
    }

    const query = args.join(' ').trim()

    try {
      const { data } = await axios.get(
        `https://api.dorratz.com/v2/apk-dl?text=${encodeURIComponent(query)}`
      )

      if (!data || !data.dllink) {
        return client.reply(
          m.chat,
          '《✧》 No se encontró la aplicación solicitada.',
          m
        )
      }

      const info =
        `📦 *${data.name}*\n\n` +
        `> 📦 *Paquete:* ${data.package}\n` +
        `> 🆕 *Última actualización:* ${data.lastUpdate}\n` +
        `> ☆ *Tamaño:* ${data.size}`

      await client.sendMessage(
        m.chat,
        {
          image: { url: data.icon },
          caption: info
        },
        { quoted: m }
      )

      await client.sendMessage(
        m.chat,
        {
          document: { url: data.dllink },
          fileName: `${data.name}.apk`,
          mimetype: 'application/vnd.android.package-archive'
        },
        { quoted: m }
      )

    } catch (error) {
      console.error('[APK DL ERROR]', error)
      await client.reply(
        m.chat,
        '⚠️ Error al buscar o descargar la aplicación.',
        m
      )
    }
  }
}