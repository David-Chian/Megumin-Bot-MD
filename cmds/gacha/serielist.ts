import { promises as fs } from 'fs';

async function loadCharacters() {
  try {
    const data = await fs.readFile('./core/characters.json', 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error('ꕥ No se pudo cargar el archivo characters.json.')
  }
}

export default {
  command: ['slist', 'serielist', 'animelist'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const chatData = await getChat(chatId)

    if (chatData.adminonly || !chatData.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    try {
      const characters = await loadCharacters()

      const sources = characters.reduce((acc, character) => {
        if (!character.source) return acc
        const source = character.source.trim()
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const sortedSources = Object.entries(sources).sort(([, a], [, b]) => b - a)
      const sourcesPerPage = 20
      const page = parseInt(args[0], 10) || 1
      const totalPages = Math.ceil(sortedSources.length / sourcesPerPage)

      if (page < 1 || page > totalPages)
        return sock.reply(m.chat,`✐ La página ${page} no existe. Intenta entre 1 y ${totalPages}.`,m,m.rcanal)

      const startIndex = (page - 1) * sourcesPerPage
      const paginatedSources = sortedSources.slice(startIndex, startIndex + sourcesPerPage)

      const message =
        `*✩ AnimeList (✿❛◡❛)*\n*❒ Lista de series (${sortedSources.length}):*\n\n` +
        paginatedSources.map(([source, count]) => `› *${source}* (${count})`).join('\n') +
        `\n\n> ⌦ Página *${page}* de *${totalPages}*`

      await sock.reply(chatId, message, m)
    } catch (error) {
      await m.reply(msgglobal)
    }
  },
}
