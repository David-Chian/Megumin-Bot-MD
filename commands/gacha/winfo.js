import {promises as fs} from 'fs';

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  let result = ''
  if (days > 0) result += `${days} d `
  if (hours > 0) result += `${hours} h `
  if (minutes > 0) result += `${minutes} m `
  if (seconds > 0 || result === '') result += `${seconds} s`
  return result.trim()
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find(c => c.name.toLowerCase() === name) ||
    characters.find(c => c.name.toLowerCase().includes(name)) ||
    characters.find(c => name.includes(c.name.toLowerCase()))
  )
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['winfo', 'charinfo', 'cinfo'],
  category: 'gacha',
  use: '<nombre del personaje>',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const characterName = args.join(' ').toLowerCase().trim()
    if (!characterName)
      return m.reply(`「✎」 Por favor, proporciona el nombre de un personaje.\n\n> › *Ejemplo:* winfo Senko`)

    const characters = await loadCharacters()
    const character = findSimilarCharacter(characterName, characters)
    if (!character)
      return m.reply(`ꕥ No se ha encontrado el personaje *${characterName}*, ni uno similar.`)

    const sortedByValue = [...characters].sort((a, b) => (b.value || 0) - (a.value || 0))
    const rank = sortedByValue.findIndex(c => c.name.toLowerCase() === character.name.toLowerCase()) + 1
    const lastVoteTime = character.lastVoteTime || null
    const timeAgo = lastVoteTime ? 'hace ' + msToTime(Date.now() - lastVoteTime) : 'Aún no ha sido votado.'

    const reservado = chatData.personajesReservados?.find(p => p.name === character.name)
    const usuarioPoseedor = Object.entries(chatData.users || {}).find(([_, user]) =>
      user.characters?.some(c => c.name === character.name)
    )

    const ownerId = usuarioPoseedor?.[0] || m.sender
    const ownerData = chatData.users?.[ownerId]
    const characterInstance = ownerData?.characters?.find(c => c.name.toLowerCase() === character.name.toLowerCase())
    const claimStatus = characterInstance?.claim || 'Desconocido'

    let estado = '*Libre*'
    if (usuarioPoseedor)
      estado = `*Reclamado por ${db.users[ownerId]?.name || ownerId.split('@')[0]}*\n☆ Fecha de reclamo › *${claimStatus}*`
    else if (reservado)
      estado = `*Reservado por ${db.users[reservado.userId]?.name || reservado.userId.split('@')[0]}*`

    const message = `➭ Nombre › *${character.name}*\n\n⚥ Género › *${character.gender || 'Desconocido'}*\n✰ Valor › *${character.value.toLocaleString()}*\n♡ Estado › ${estado}\n✧ Votos › *${character.votes || 0}*\n❀ Fuente › *${character.source || 'Desconocida'}*\n✩ Puesto › *#${rank}*\nⴵ Último voto › *${timeAgo}*`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
};