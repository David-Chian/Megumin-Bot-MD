import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const obtenerImagen = async (keyword) => {
  const endpoints = ["gelbooru", "safebooru", "danbooru"];

  for (const endpoint of endpoints) {
    try {
      const url = `${api.url}/nsfw/${endpoint}?keyword=${keyword}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`);

      const buffer = await res.arrayBuffer();

      if (buffer.byteLength > 0) {
        return Buffer.from(buffer);
      }
    } catch (err) {
      console.error(`Error en ${endpoint}:`, err.message);
    }
  }

  return null;
};

const charactersFilePath = './core/characters.json'

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
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    if (args.length === 0)
      return sock.reply(m.chat,`《✤》 Por favor, proporciona el nombre de un personaje.`,m,m.rcanal)

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return sock.reply(m.chat,`✎ No se ha encontrado el personaje *${characterName}*, ni uno similar.`,m,m.rcanal)

      const message = `➭ Nombre › *${character.name}*

ੈ⚥‧₊˚ Género › *${character.gender}*
ੈ⛁₊˚ Valor › *${character.value.toLocaleString()}*
ੈ❀︎‧₊˚ Fuente › *${character.source}*

${dev}`

const imagen = await obtenerImagen(character.keyword, character.name);

if (!imagen) {
  return sock.reply(m.chat,`✐ No se pudo obtener una imagen para *${character.name}*.`,m,m.rcanal);
}

const payload = {
  image: imagen, 
  caption: message, 
  mimetype: 'image/jpeg'
};

await sock.sendMessage(chatId, payload, { quoted: m });

    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
}
