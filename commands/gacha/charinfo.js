import {promises as fs} from 'fs';
import fetch from 'node-fetch';

const obtenerImagenGelbooru = async (keyword) => {
  const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const extensionesImagen = /\.(jpg|jpeg|png)$/i
    const imagenesValidas = data?.data?.filter(
      (item) => typeof item?.image === 'string' && extensionesImagen.test(item.image),
    )
    if (!imagenesValidas?.length) return null
    const aleatoria = imagenesValidas[Math.floor(Math.random() * imagenesValidas.length)]
    return aleatoria.image
  } catch {
    return null
  }
}

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❀ Error al cargar characters.json:', error)
    throw new Error('❀ No se pudo cargar el archivo characters.json')
  }
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find((c) => c.name.toLowerCase() === name) ||
    characters.find((c) => c.name.toLowerCase().includes(name)) ||
    characters.find((c) => name.includes(c.name.toLowerCase()))
  )
}

export default {
  command: ['charimage', 'wimage', 'cimage'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    if (args.length === 0)
      return m.reply(
        `✎ Por favor, proporciona el nombre de un personaje.`
      )

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return m.reply(`✎ No se ha encontrado el personaje *${characterName}*, ni uno similar.`)

      const message = `➭ Nombre › *${character.name}*\n\n✎ Género › *${character.gender}*\n⛁ Valor › *${character.value.toLocaleString()}*\n❖ Fuente › *${character.source}*\n\n${dev}`

      const imagenUrl = await obtenerImagenGelbooru(character.keyword)
      await client.sendMessage(
        chatId,
        {
          image: { url: imagenUrl },
          caption: message,
          mimetype: 'image/jpeg',
        },
        { quoted: m },
      )
    } catch (error) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};
