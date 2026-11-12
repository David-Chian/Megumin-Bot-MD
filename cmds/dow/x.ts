import axios from "axios"
import sharp from "sharp"

async function fetchBuffer(url) {
const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 })
return Buffer.from(res.data)
}

function cleanHtml(str) {
return String(str || "")
.replace(/'/g, "'").replace(/&/g, "&").replace(/"/g, '"')
.replace(/</g, "<").replace(/>/g, ">").replace(/ /g, " ")
}

const X_REGEX = /^https?://(www.)?(x|twitter).com/.+/i

async function getInfo(urlInput) {
const apis = "${api.url}/dl/twitter?url=${encodeURIComponent(urlInput)}&key=${api.key}"
const { data: res } = await axios.get(apis, {
headers: { "Content-Type": "application/json" }, timeout: 60000
})
if (!res?.status || !res?.data) return null
return res.data
}

export default {
command: ["x", "twitter", "twdl", "xdl"],
category: "downloader",
isSocket: true,
run: async ({ m, sock, args, usedPrefix }) => {
try {
if (!args.length) return m.reply("❌ Ingresa un enlace de X o Twitter.")

  const urls = args.filter((a) => X_REGEX.test(a))
  if (!urls.length) return m.reply("❌ El enlace proporcionado no es válido.")

  if (urls.length > 1) {
    const medias = []
    for (const urlInput of urls.slice(0, 10)) {
      try {
        const info = await getInfo(urlInput)
        if (!info) continue
        const type = info.type || "video"
        const results = info.result

        if (type === "image") {
          const imgs = Array.isArray(results) ? results.filter(Boolean) : []
          for (const u of imgs) medias.push({ image: { url: u } })
        } else {
          const videos = Array.isArray(results) ? results : []
          if (!videos.length) continue
          const getHeight = (q) => parseInt(String(q).replace(/[^0-9]/g, ""), 10) || 0
          const best = [...videos].sort((a, b) => getHeight(b.quality) - getHeight(a.quality))[0]
          if (best?.url) medias.push({ video: { url: best.url } })
        }
      } catch (_) {}
    }

    if (!medias.length) return m.reply("❌ No se encontró contenido multimedia.")

    medias[0].caption = `*X / TWITTER DOWNLOADER*\n\n📦 Archivos: ${medias.length}\n🔗 Enlaces: ${urls.length}`

    try {
      await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
    } catch (e) {
      for (const media of medias) {
        try {
          await sock.sendMessage(m.chat, { ...media, caption: media.caption || undefined }, { quoted: m })
        } catch (_) {}
      }
    }
    return
  }

  const urlInput = urls[0]
  const info = await getInfo(urlInput)
  if (!info) return m.reply("❌ No se pudo obtener información del enlace.")

  const title = cleanHtml(info.title) || "media"
  const duration = info.duration || "—"
  const type = info.type || "video"
  const thumbnail = info.thumbnail
  const results = info.result

  if (type === "image") {
    const imgs = Array.isArray(results) ? results.filter(Boolean) : []
    if (!imgs.length) return m.reply("❌ No se encontraron imágenes.")

    const caption = `*X / TWITTER DOWNLOADER*\n\n📌 Título: ${title}\n🖼️ Imágenes: ${imgs.length}\n🔗 URL: ${urlInput}`

    if (imgs.length === 1) {
      await sock.sendMessage(m.chat, { image: { url: imgs[0] }, caption }, { quoted: m })
      return
    }

    const medias = imgs.map((u) => ({ image: { url: u } }))
    medias[0].caption = caption

    try {
      await sock.sendAlbumMessage(m.chat, medias, { quoted: m })
    } catch (e) {
      for (const u of imgs) {
        try {
          await sock.sendMessage(m.chat, { image: { url: u } }, { quoted: m })
        } catch (_) {}
      }
    }
    return
  }

  const videos = Array.isArray(results) ? results : []
  if (!videos.length) return m.reply("❌ No se encontraron enlaces de descarga.")

  const getHeight = (q) => parseInt(String(q).replace(/[^0-9]/g, ""), 10) || 0
  const best = [...videos].sort((a, b) => getHeight(b.quality) - getHeight(a.quality))[0]

  const caption = `*X / TWITTER DOWNLOADER*\n\n📌 Título: ${title}\n🎬 Tipo: ${type}\n⏱️ Duración: ${duration}\n📺 Calidad: ${best.quality || "—"}\n🔗 URL: ${urlInput}`

  let thumbBuffer = null
  try {
    if (thumbnail) thumbBuffer = await fetchBuffer(thumbnail)
  } catch (e) {}

  if (thumbBuffer) {
    await sock.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })
  } else {
    await sock.sendMessage(m.chat, { text: caption }, { quoted: m })
  }

  let mediaBuffer = null
  try {
    mediaBuffer = await fetchBuffer(best.url)
  } catch (e) {
    for (const r of videos) {
      try {
        mediaBuffer = await fetchBuffer(r.url)
        if (mediaBuffer) break
      } catch (_) {}
    }
  }

  if (!mediaBuffer) return m.reply("❌ No se pudo descargar el video.")

  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80) || "video"

  let thumbJpeg = null
  try {
    if (thumbBuffer) thumbJpeg = await sharp(thumbBuffer).resize(300, 300).jpeg({ quality: 80 }).toBuffer()
  } catch (e) {}

  const sizeMB = mediaBuffer.length / (1024 * 1024)

  if (sizeMB >= 5) {
    await sock.sendMessage(m.chat, {
      document: mediaBuffer,
      mimetype: "video/mp4",
      fileName: `${safeTitle}.mp4`,
      jpegThumbnail: thumbJpeg || undefined
    }, { quoted: m })
  } else {
    await sock.sendMessage(m.chat, {
      video: mediaBuffer,
      mimetype: "video/mp4",
      caption: `*${safeTitle}*`,
      jpegThumbnail: thumbJpeg || undefined
    }, { quoted: m })
  }
} catch (e) {
  console.error(e)
  await m.reply(`❌ Ocurrió un error al descargar el contenido.\nUsa ${usedPrefix}twitter <enlace>`)
}

}
}