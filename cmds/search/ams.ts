import fetch from 'node-fetch'

export default {
  command: ['ams', 'applemusicsearch'],
  category: 'search',
  run: async ({sock, m, args}) => {
    try {
      if (!args[0]) {
        return m.reply('✎ Por favor, menciona el nombre de la canción que deseas buscar en Apple Music')
      }

      const query = args.join(' ')
      const res = await fetch(`${api.url}/search/applemusic?query=${encodeURIComponent(query)}&key=${api.key}`)
      const result = await res.json()

      if (!result.status || !result.data?.length) {
        return m.reply('❖ No se encontraron resultados en Apple Music')
      }

      let texto = `✦ Resultados de Apple Music para: ${query}\n\n`
      result.data.forEach((song, i) => {
        texto += `➪ ${i + 1}. ${song.title}\n`
        texto += `   › Artista: ${song.artist}\n`
        texto += `   › Álbum: ${song.album}\n`
        texto += `   › Enlace: ${song.url}`
        if (i !== result.data.length - 1) texto += `\n\n`
      })

      const firstSong = result.data[0]
      const audioRes = await fetch(firstSong.preview)
      if (!audioRes.ok) {
        return m.reply('❖ Error al obtener el archivo de audio.')
      }
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

      await sock.sendMessage(m.chat, {
        image: { url: firstSong.thumbnail },
        caption: texto
      }, { quoted: m })


    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}
