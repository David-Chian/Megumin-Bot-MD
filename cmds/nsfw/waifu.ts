import axios from 'axios'

const CATEGORIES: Record<string, { tags: string; rating: string }> = {
  waifu:    { tags: 'girl',                 rating: 'explicit' },
  boobs:    { tags: 'exposed_girl_breasts', rating: 'explicit,borderline' },
  bigboobs: { tags: 'large_breasts',        rating: 'explicit,borderline' },
  pussy:    { tags: 'pussy',                rating: 'explicit' },
  bikini:   { tags: 'bikini',               rating: 'suggestive,borderline' },
  neko:     { tags: 'catgirl',              rating: 'explicit' },
}

async function fetchNekosImage(category: string): Promise<Buffer> {
  const config = CATEGORIES[category]
  if (!config) throw new Error('Categoría inválida.')

  const res = await axios.get('https://api.nekosapi.com/v4/images/random', {
    params:         { limit: 1, tags: config.tags, rating: config.rating },
    timeout:        10000,
    validateStatus: s => s === 200,
  })

  const url = res.data?.[0]?.url
  if (!url) throw new Error('No se obtuvo imagen.')

  const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 })
  return Buffer.from(imgRes.data)
}

export default {
  command:  ['nsfwimage', 'nsfwimg', 'waifu'],
  category: 'nsfw',

  run: async ({ sock, m, args, command }: any) => {
    const chat = await getChat(m.chat)
    if (!chat.nsfw)
      return m.reply(mess.nsfw)

    const cat = args[0]?.toLowerCase()

    if (!cat)
      return m.reply(
        `✿ Ingresa una categoría.\n\nDisponibles:\n${Object.keys(CATEGORIES).map(c => `• *${c}*`).join('\n')}`
      )

    if (!CATEGORIES[cat])
      return m.reply(
        `✿ Categoría *${cat}* no válida.\n\nDisponibles:\n${Object.keys(CATEGORIES).map(c => `• *${c}*`).join('\n')}`
      )

    await m.reply(mess.wait)

    try {
      const buffer = await fetchNekosImage(cat)
      await sock.sendMessage(m.chat, { image: buffer }, { quoted: m })
    } catch (err: any) {
      console.error('[nsfwimage Error]', err)
      return m.reply(msgglobal)
    }
  },
}