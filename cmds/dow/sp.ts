import fetch from 'node-fetch'

export default {
  command: ['sp', 'spotify'],
  category: 'downloader',
  run: async ({sock, m, args}) => {
    try {
      if (!args[0]) {
        return m.reply('✎ Por favor, menciona el nombre o URL de la canción que deseas descargar de Spotify')
      }

      const query = args.join(' ')
      let url, songInfo

      if (/open\.spotify\.com\/track\//i.test(query)) {
        url = query
        const resInfo = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
        const resultInfo = await resInfo.json()
        if (!resultInfo.status) return m.reply('❖ No se pudo procesar el enlace de Spotify.')
        songInfo = resultInfo.data
      } else {
        const search = await fetch(`${api.url}/search/spotify?query=${encodeURIComponent(query)}&key=${api.key}`)
        const data = await search.json()
        if (!data.status || !data.data.length) {
          return m.reply('❖ No se encontraron resultados en Spotify')
        }
        songInfo = data.data[0]
        url = songInfo.url
      }

      const duracion = (!songInfo.duration || songInfo.duration.includes('NaN'))
        ? 'Desconocida'
        : songInfo.duration || ""

      const caption = `➪ Descargando › ${songInfo.title || songInfo.name}

> ✿⃘࣪◌ ֪ Artista › ${songInfo.artist || ""}
> ✿⃘࣪◌ ֪ Álbum › ${songInfo.album || ""}
> ✿⃘࣪◌ ֪ Fecha › ${songInfo.publish || songInfo.year}
> ✿⃘࣪◌ ֪ Duración › ${duracion || ""}
> ✿⃘࣪◌ ֪ Enlace › ${url || ""}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      let yi = songInfo.image || songInfo.cover

      await sock.sendMessage(m.chat, { image: { url: yi }, caption }, { quoted: m })

      const resAudio = await fetch(`${api.url}/dl/spotify?url=${encodeURIComponent(url)}&key=${api.key}`)
      const resultAudio = await resAudio.json()
      if (!resultAudio.status || !resultAudio.data?.mp3) {
        return m.reply('❖ No se pudo descargar el audio de Spotify.')
      }

      const audioRes = await fetch(resultAudio.data.mp3)
      if (!audioRes.ok) {
        return m.reply('❖ Error al obtener el archivo de audio.')
      }
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${songInfo.name}.mp3`
      }

      await sock.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}