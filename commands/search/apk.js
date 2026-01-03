import axios from 'axios';

export default {
  command: ['aptoide', 'apk', 'apkdl'],
  category: 'search',
  run: async ({client, m, args}) => {
    if (!args || !args.length) {
      return m.reply(
        '《✧》 Ingresa el *nombre* de la *aplicación*.',
      )
    }
let user = global.db.data.chats[m.chat].users[m.sender]
    const query = args.join(' ').trim()

    // await m.reply(mess.wait)

    try {
      const response = await axios.get(
        `${api.url}/search/apk?query=${encodeURIComponent(query)}&key=${api.key}`,
      )
      const data = response.data.data

      if (data.name && data.dl) {
        const response = `➩ *Nombre ›* ${data.name}

> ❖ *Paquete ›* ${data.package}
> ✿ *Última actualización ›* ${data.lastUpdated}
> ☆ *Tamaño ›* ${data.size}`

        await client.sendMessage(
          m.chat,
          {
            image: { url: data.banner },
            caption: response,
          },
          { quoted: m },
        )

        await client.sendMessage(
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
        await client.reply(m.chat, `《✧》 No se encontró la aplicación solicitada.`, m)
      }
    } catch (error) {
      await m.reply(msgglobal)
    }
  },
};
