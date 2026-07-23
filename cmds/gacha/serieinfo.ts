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
  command: ['serieinfo', 'animeinfo', 'ainfo'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const chatData = await getChat(chatId)

    if (chatData.adminonly || !chatData.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`)

    try {
      const name = args.join(' ')
      if (!name) return sock.reply(m.chat,'《✤》 Por favor especifica un anime.',m, m.rcanal)

      const characters = await loadCharacters()
      const animeCharacters = characters.filter(
        (character) =>
          character.source && character.source.toLowerCase().trim() === name.toLowerCase().trim(),
      )

      if (animeCharacters.length === 0)
        return sock.reply(m.chat,`❖ No se encontró el anime con nombre: "${name}".`,m, m.rcanal)

      const chatUsers = await getChatUser(chatId)
      
      let claimedCount = 0
      const characterStatus = await Promise.all(animeCharacters.map(async (char) => {
        const usuarioPoseedor = chatUsers.find(user => 
          Array.isArray(user.characters) && 
          user.characters.some(c => c.name === char.name)
        )
        
        if (usuarioPoseedor) {
          claimedCount++
          const userData = await getUser(usuarioPoseedor.user_id)
          const estado = `Reclamado por ${userData.name || usuarioPoseedor.user_id.split('@')[0]}`
          return `› *${char.name}* (${char.value}) • ${estado}`
        } else {
          return `› *${char.name}* (${char.value}) • Libre`
        }
      }))

      const totalCharacters = animeCharacters.length

      const message =
        '☆ *Serie Info* (●´ϖ`●)' +
        `\n➭ *Nombre ›* ${name}\n\n` +
        `☆ *Personajes ›* ${totalCharacters}\n` +
        `❀ *Reclamados ›* ${claimedCount}/${totalCharacters}\n\n` +
        `✎ *Lista de personajes* \n${characterStatus.join('\n')}`

      await sock.reply(chatId, message, m)
    } catch (error) {
      await sock.reply(m.chat,`${msgglobal}`,m,m.rcanal)
    }
  },
}
