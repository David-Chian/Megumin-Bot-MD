import axios from 'axios';

export default {
  command: ['aptoide', 'apk', 'apkdl'],
  category: 'search',
  run: async ({sock, m, args}) => {
    if (!args || !args.length) {
      return m.reply(
        '✿ Ingresa el *nombre* de la *aplicación*.',
      )
    }

    const query = args.join(' ').trim()

    // await m.reply(mess.wait)

    try {
      const response = await axios.get(
        `${api.url}/search/apk?query=${encodeURIComponent(query)}&key=${api.key}`,
      )
      const data = response.data.data

      if (data.name && data.dl) {
        const response = `ㅤ۟∩　ׅ　✿　ׅ　🅐pk 🅜od　ׄᰙ　ׅ

𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Nombre ›* ${data.name}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Paquete ›* ${data.package}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Última actualización ›* ${data.lastUpdated}
𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ *Tamaño ›* ${data.size}`

    await sock.sendContextInfoIndex(m.chat, response, {}, m, true, {})

        await sock.sendMessage(
          m.chat,
          {
            document: { url: data.dl },
            fileName: `${data.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: global.dev,
          },
          { quoted: m },
        )
      } else {
        await sock.reply(m.chat, `✿ No se encontró la aplicación solicitada.`, m)
      }
    } catch (error) {
      await m.reply(msgglobal)
    }
  },
};
