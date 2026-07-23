import fs from 'fs'
import { proto, generateWAMessageFromContent, generateWAMessageContent } from "@whiskeysockets/baileys"

function loadCharacters() {
  try {
    return JSON.parse(fs.readFileSync('./core/characters.json', 'utf-8'))
  } catch {
    return []
  }
}

const createImageMessage = async (sock, url: string) => {
  const FALLBACK_IMAGE = 'https://cdn.sockywa.xyz/files/1751246122292.jpg'
  try {
    const { imageMessage } = await generateWAMessageContent(
      { image: { url } },
      { upload: sock.waUploadToServer }
    )
    return imageMessage
  } catch {
    try {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: FALLBACK_IMAGE } },
        { upload: sock.waUploadToServer }
      )
      return imageMessage
    } catch {
      return null
    }
  }
}

export default {
  command: ['topvotos', 'topvote', 'gtopvotos', 'globaltopvotos', 'globaltopv', 'gtv'],
  category: 'gacha',
  run: async ({ sock, m }) => {
    const cmd = m.command
    const characters = loadCharacters()
    const medals = ['🥇', '🥈', '🥉']
    if (cmd === 'topvotos' || cmd === 'topvote') {
      const chatUsers = await getChatUser(m.chat)

      if (!Array.isArray(chatUsers) || chatUsers.length === 0)
        return sock.reply(m.chat, '✘ No hay datos registrados en este chat.', m, m.rcanal)

      const globalMap = new Map(
        characters.map(c => [c.name?.toLowerCase(), c])
      )

      const ownedCharacters = []

      for (const userData of chatUsers) {
        if (!Array.isArray(userData.characters)) continue
        for (const c of userData.characters) {
          if (!c?.name) continue
          const globalChar = globalMap.get(c.name.toLowerCase())
          ownedCharacters.push({
            ...c,
            ownerId: userData.user_id,
            votes: globalChar?.votes || 0,
            value: globalChar?.value ?? c.value,
            url:   globalChar?.url   ?? c.url
          })
        }
      }

      const ranked = ownedCharacters
        .filter(c => c.votes > 0)
        .sort((a, b) => b.votes - a.votes)

      if (ranked.length === 0)
        return sock.reply(m.chat, '✘ Ningún personaje de este grupo tiene votos aún.', m, m.rcanal)

      const top = ranked.slice(0, 5)
      const cards = []
      let position = 0
      let lastVotes = null

      for (let i = 0; i < top.length; i++) {
        const character = top[i]

        if (character.votes !== lastVotes) {
          position = i + 1
          lastVotes = character.votes
        }

        const medal = medals[position - 1] || '🏅'
        const globalUser = await getUser(character.ownerId)
        const userName = globalUser?.name || character.ownerId.split('@')[0]
        const imageMessage = await createImageMessage(sock, character.url)

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `${medal} #${position} ${character.name}\n🫒 Votos: ${character.votes}\n💰 Valor: ${character.value} RWcoins\n👤 Dueño: ${userName}`,
            hasMediaAttachment: Boolean(imageMessage),
            ...(imageMessage ? { imageMessage } : {})
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        })
      }

      const messageContent = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body:   proto.Message.InteractiveMessage.Body.create({ text: `🏆 *TOP ${top.length} Personajes con más votos*` }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Ranking del grupo.' }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
        })
      }, { quoted: m })

      return sock.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })
    }

    if (cmd === 'gtopvotos' || cmd === 'globaltopvotos' || cmd === 'globaltopv' || cmd === 'gtv') {
      if (!characters.length)
        return sock.reply(m.chat, '✘ No hay personajes globales registrados.', m, m.rcanal)

      const rankedGlobal = characters
        .filter(c => c?.votes > 0)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10)

      if (rankedGlobal.length === 0)
        return sock.reply(m.chat, '✘ Ningún personaje global tiene votos aún.', m, m.rcanal)
      const chatUsers = await getChatUser(m.chat)
      const cards = []
      let position = 0
      let lastVotes = null

      for (let i = 0; i < rankedGlobal.length; i++) {
        const character = rankedGlobal[i]

        if (character.votes !== lastVotes) {
          position = i + 1
          lastVotes = character.votes
        }

        const medal = medals[position - 1] || '🏅'

        let ownerName = 'Libre'
        if (Array.isArray(chatUsers)) {
          const ownerData = chatUsers.find(u =>
            u.characters?.some(c => c.name?.toLowerCase() === character.name.toLowerCase())
          )
          if (ownerData) {
            const globalUser = await getUser(ownerData.user_id)
            ownerName = globalUser?.name || ownerData.user_id.split('@')[0]
          }
        }

        const imageMessage = await createImageMessage(sock, character.url)

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `${medal} #${position} ${character.name}\n🫒 Votos: ${character.votes}\n💰 Valor: ${character.value} RWcoins\n👤 Estado: ${ownerName}`,
            hasMediaAttachment: Boolean(imageMessage),
            ...(imageMessage ? { imageMessage } : {})
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        })
      }

      const messageContent = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body:   proto.Message.InteractiveMessage.Body.create({ text: `🌍 *TOP 10 GLOBAL DE VOTOS*` }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Ranking global del bot.' }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
        })
      }, { quoted: m })

      return sock.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })
    }
  }
}