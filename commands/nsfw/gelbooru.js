import fetch from 'node-fetch';

export default {
  command: ['gelbooru', 'gbooru'],
  category: 'nsfw',
  run: async ({client, m, args}) => {
    const chatId = m.chat
    const db = global.db

    if (!db.data.chats[chatId]?.nsfw)
      return m.reply(
        'ꕥ Los comandos de *NSFW* están desactivados en este grupo. Usa `.enable nsfw` para activarlos.',
      )

    if (!args[0]) return m.reply('《✧》 Por favor, ingresa un *tag* para realizar la búsqueda.')

    await m.reply(mess.wait)

    const tag = args[0]
    const url = `${api.url}/nsfw/gelbooru?keyword=${tag}&key=${api.key}`

    try {
      const res = await fetch(url)
      const data = await res.json()

      if (!Array.isArray(data.results) || data.results.length === 0)
        return m.reply(`ꕥ No se encontraron resultados para *${tag}*. Intenta con otro término.`)

      const randomImage = data.results[Math.floor(Math.random() * data.results.length)]

      await client.sendMessage(
        chatId,
        {
          image: { url: randomImage }
        },
        { quoted: m },
      )
    } catch (err) {
      console.error('[Gelbooru Error]', err)
      return m.reply(msgglobal)
    }
  },
};
