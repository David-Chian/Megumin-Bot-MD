import fetch from "node-fetch"
import { getBuffer } from '../../lib/message.js'
import sharp from 'sharp'

export default {
  command: ["xvideos"],
  run: async ({client, m, args}) => {

    if (!db.data.chats[m.chat].nsfw) return m.reply('✐ Los comandos de *NSFW* están desáctivados en este Grupo.')

    try {
      const query = args.join(" ")
      if (!query) return m.reply("《✧》Ingresa el nombre de un video o una URL de XVideos.")

      let videoUrl, videoInfo

      if (query.startsWith("http") && query.includes("xvideos.com")) {
        videoUrl = query
      } else {
        const apiUrl = `${api.url}/nsfw/search/xvideos?query=${query}&key=${api.key}`
        const res = await fetch(apiUrl)
        if (!res.ok) {
       return m.reply("Error al conectar con XVideos API")
       }

        const json = await res.json()
        if (!json.status || !json.resultados || json.resultados.length === 0) throw new Error("No se encontró el video")

        const randomIndex = Math.floor(Math.random() * json.resultados.length)
        videoInfo = json.resultados[randomIndex]
        videoUrl = videoInfo.url

        const caption = `➮ *XVideos :: ${videoInfo.title}*

→ *Artista ::* ${videoInfo.artist || "Desconocido"}
→ *Resolución ::* ${videoInfo.resolution}
→ *Duración ::* ${videoInfo.duration}
→ *Ver en ::* ${videoInfo.url}

> *✎ Enviando video....*
`

        await client.sendMessage(m.chat, {
          image: { url: videoInfo.cover },
          caption
        }, { quoted: m })
      }

      const downloadUrl = `${api.url}/nsfw/dl/xvideos?url=${videoUrl}&key=${api.key}`
      const downloadRes = await fetch(downloadUrl)
      if (!downloadRes.ok) {
    return m.reply("Error al descargar el video")
     }

      const downloadJson = await downloadRes.json()
      if (!downloadJson.status || !downloadJson.resultado) {
    return m.reply("No se pudo obtener el video para descargar.")
     }

      const videoDownloadLink = downloadJson.resultado.videos.low

      /*await client.sendMessage(m.chat, {
        video: { url: videoDownloadLink },
        mimetype: "video/mp4"
      }, { quoted: m })*/

      const thumbBuffer = await getBuffer(downloadJson.resultado. thumb)
      const videoBuffer = await getBuffer(videoDownloadLink)

  const thumbBuffer2 = await sharp(thumbBuffer)
    .resize(300, 300)
    .jpeg({ quality: 80 })
    .toBuffer()

  let mensaje = {
    document: videoBuffer,
    mimetype: 'video/mp3',
    fileName: `${videoInfo.title}.mp4`,
    jpegThumbnail: thumbBuffer2
  }

await client.sendMessage(m.chat, mensaje, { quoted: m })

    } catch (err) {
      return m.reply(msgglobal)
    }
  },
}