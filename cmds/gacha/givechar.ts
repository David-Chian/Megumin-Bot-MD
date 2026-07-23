import { readFileSync } from 'fs'
import { resolveLidToRealJid } from "../../core/utils.ts"

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['givechar', 'givewaifu', 'regalar', 'darrw'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const senderId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    
    if (!who2) 
      return sock.reply(m.chat,'《✤》 Menciona al usuario o responde a su mensaje junto con el nombre del personaje.',m,m.rcanal)
    
    const mentionedJid = await resolveLidToRealJid(who2, sock, m.chat)

    if (mentionedJid === senderId)
      return sock.reply(m.chat,'✐ No puedes regalarte un personaje a ti mismo.',m,m.rcanal)

    const senderData = await getChatUser(chatId, senderId)
    
    if (!senderData?.characters?.length) 
      return sock.reply(m.chat,'✐ No tienes personajes en tu inventario.',m,m.rcanal)

    const characterName = args
      .filter((arg) => !arg.startsWith('@'))
      .join(' ')
      .toLowerCase()
      .trim()

    const characterIndex = senderData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName
    )
    
    if (characterIndex === -1)
      return sock.reply(m.chat,`ꕥ No tienes el personaje *${characterName}* en tu inventario.`,m,m.rcanal)

    try {
      const characterDetails = JSON.parse(readFileSync('./core/characters.json', 'utf8'))
      const original = characterDetails.find((c) => c.name.toLowerCase() === characterName)
      
      if (!original)
        return sock.reply(m.chat,`✿ No se encontró el personaje *${characterName}* en la base de datos.`,m,m.rcanal)

const reservedCharacter = {
  name: original.name,
  url: original.url,
  value: original.value,
  gender: original.gender,
  source: original.source,
  keyword: original.keyword,
  claim: formatDate(Date.now())
}

      let receiver = await getChatUser(chatId, mentionedJid)
      
      if (!receiver) {
        receiver = await getChatUser(chatId, mentionedJid)
      }

      if (!Array.isArray(receiver.characters)) {
        receiver.characters = []
      }

      receiver.characters.push(reservedCharacter)
      await updateChatUser(chatId, mentionedJid, 'characters', receiver.characters)

      senderData.characters.splice(characterIndex, 1)
      await updateChatUser(chatId, senderId, 'characters', senderData.characters)

      const message = `✐ *${reservedCharacter.name}* ha sido regalado a *@${mentionedJid.split('@')[0]}*.`

      await sock.reply(chatId, message, m, { mentions: [mentionedJid] })
      
    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}
