import axios from 'axios'

async function searchDanbooru(keyword: string, limit = 20) {
  const url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(keyword)}&limit=${limit}`
  const res = await axios.get(url)
  return res.data
}

async function searchGelbooru(keyword: string, limit = 20) {
  const tag = keyword.replace(/\s+/g, '_')
  const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tag)}&limit=${limit}&api_key=f965be362e70972902e69652a472b8b2df2c5d876cee2dc9aebc7d5935d128db98e9f30ea4f1a7d497e762f8a82f132da65bc4e56b6add0f6283eb9b16974a1a&user_id=1862243`
  const res = await axios.get(url, { headers: { Referer: 'https://gelbooru.com/' } })
  return res.data?.post || []
}

async function searchSafebooru(keyword: string, limit = 20) {
  const url = `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(keyword)}&limit=${limit}`
  const res = await axios.get(url)
  return res.data
}

async function getImageBuffer(url: string): Promise<{ buffer: Buffer; mime: string }> {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  const ext  = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  let mime    = 'image/jpeg'
  if (ext === 'png')  mime = 'image/png'
  if (ext === 'webp') mime = 'image/webp'
  if (ext === 'gif')  mime = 'image/gif'
  return { buffer: Buffer.from(res.data, 'binary'), mime }
}

export default {
  command:  ['danbooru', 'dbooru', 'gelbooru', 'gbooru', 'safebooru', 'sbooru'],
  category: 'nsfw',

  run: async ({ sock, m, args, command }: any) => {
    const chat = await getChat(m.chat)

    const isSafe = command === 'safebooru' || command === 'sbooru'

    if (!isSafe && !chat.nsfw)
      return m.reply(mess.nsfw)

    if (!args[0])
      return m.reply('✿ Por favor, ingresa un *tag* para buscar.\nEj: *1girl*')

    await m.reply(mess.wait)

    const keyword = args.join(' ')

    try {
      let imageUrl: string | null = null

      if (command === 'danbooru' || command === 'dbooru') {
        const results = await searchDanbooru(keyword)

        if (!Array.isArray(results) || !results.length)
          return m.reply(`✿ No se encontraron resultados para *${keyword}* en Danbooru.`)

        const validos = results.filter((p: any) =>
          typeof p.file_url === 'string' || typeof p.large_file_url === 'string'
        )

        if (!validos.length)
          return m.reply('✿ No se encontraron imágenes válidas en Danbooru.')

        const post = validos[Math.floor(Math.random() * validos.length)]
        imageUrl   = post.file_url || post.large_file_url

      } else if (command === 'gelbooru' || command === 'gbooru') {
        const results = await searchGelbooru(keyword)

        if (!Array.isArray(results) || !results.length)
          return m.reply(`✤ No se encontraron resultados para *${keyword}* en Gelbooru.`)

        const validos = results.filter((p: any) => typeof p.file_url === 'string')

        if (!validos.length)
          return m.reply('✤ No se encontraron imágenes válidas en Gelbooru.')

        const post = validos[Math.floor(Math.random() * validos.length)]
        imageUrl   = post.file_url

      } else if (command === 'safebooru' || command === 'sbooru') {
        const results = await searchSafebooru(keyword)

        if (!Array.isArray(results) || !results.length)
          return m.reply(`🌸 No se encontraron resultados para *${keyword}* en Safebooru.`)

        const validos = results.filter((p: any) => typeof p.file_url === 'string')

        if (!validos.length)
          return m.reply('🌸 No se encontraron imágenes válidas en Safebooru.')

        const post = validos[Math.floor(Math.random() * validos.length)]
        imageUrl   = post.file_url
      }

      if (!imageUrl)
        return m.reply('❌ No se pudo obtener una imagen.')

      const { buffer, mime } = await getImageBuffer(imageUrl)

      await sock.sendMessage(
        m.chat,
        { image: buffer, mimetype: mime },
        { quoted: m }
      )

    } catch (err: any) {
      console.error(`[${command} Error]`, err)
      return m.reply(msgglobal)
    }
  },
}