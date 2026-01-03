import {readFileSync} from 'fs';
import { resolveLidToRealJid } from "../../lib/utils.js"

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
    'diciembre',
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['givechar', 'givewaifu', 'regalar'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats[chatId]
    const senderData = chatData.users[senderId]
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : false
    const mentionedJid = await resolveLidToRealJid(who2, client, m.chat);

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    if (!who2 || mentionedJid === senderId)
      return m.reply('✎ Menciona al usuario y el nombre de la waifu que deseas regalar.')

    if (!senderData?.characters?.length) return m.reply('《✧》 No tienes personajes en tu inventario.')

   const user2 = global.db.data.chats[m.chat].users[mentionedJid]

    if (!user2) {
      return m.reply('《✧》 El usuario *mencionado* no está *registrado* en el bot')
    }

    const characterName = args
      .filter((arg) => !arg.includes(mentionedJid.split('@')[0]))
      .join(' ')
      .toLowerCase()
      .trim()
    const characterIndex = senderData.characters.findIndex(
      (c) => c.name?.toLowerCase() === characterName,
    )

    if (characterIndex === -1)
      return m.reply(`《✧》 No tienes el personaje *${characterName}* en tu inventario.`)

    try {
      const characterDetails = JSON.parse(readFileSync('./lib/characters.json', 'utf8'))
      const original = characterDetails.find((c) => c.name.toLowerCase() === characterName)

      if (!original)
        return m.reply(`✎ No se encontró el personaje *${characterName}* en la base de datos.`)

      const reservedCharacter = {
        name: original.name,
        value: original.value,
        gender: original.gender,
        source: original.source,
        keyword: original.keyword,
        claim: formatDate(Date.now()),
      }

      if (!chatData.users[mentionedJid]) {
        chatData.users[mentionedJid] = {
          characters: [],
          characterCount: 0,
          totalRwcoins: 0,
          chocolates: 0,
        }
      }

      const receiver = chatData.users[mentionedJid]

      if (!Array.isArray(receiver.characters)) {
        receiver.characters = []
      }

      receiver.characters.push(reservedCharacter)
      receiver.characterCount++
      receiver.totalRwcoins += reservedCharacter.value || 0

      senderData.characters.splice(characterIndex, 1)
      senderData.characterCount--
      senderData.totalRwcoins -= reservedCharacter.value || 0

      const receiverName = db.users[mentionedJid]?.name || mentionedJid.split('@')[0]
      const message = `✎ *${reservedCharacter.name}* ha sido regalado a *${receiverName}*.`

      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (e) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};
