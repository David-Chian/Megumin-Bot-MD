import { proto, generateWAMessageFromContent, generateWAMessageContent } from '@whiskeysockets/baileys'

const ITEMS_PER_PAGE = 10
const FALLBACK_IMAGE = 'https://cdn.sockywa.xyz/files/1751246122292.jpg'

const sessions = {}

const createImageMessage = async (sock, url) => {
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

const mostrarBoveda = async (sock, m, chatId, userId, currentPage) => {
  const user = await getChatUser(chatId, userId)

  if (!user?.characters?.length)
    return sock.reply(m.chat,'*💠 No tienes personajes en tu bóveda.*',m,m.rcanal)

  const characters       = user.characters
  const bovedaCharacters = characters.filter(ch => ch.vaulted === true)
  const totalCharacters  = characters.length
  const totalVaulted     = bovedaCharacters.length

  if (totalVaulted === 0)
    return sock.reply(m.chat,'*💠 No tienes personajes en tu bóveda.*',m,m.rcanal)

  const totalPages = Math.max(1, Math.ceil(totalVaulted / ITEMS_PER_PAGE))
  currentPage      = Math.max(1, Math.min(currentPage, totalPages))

  sessions[chatId]           = sessions[chatId] || {}
  sessions[chatId][userId]   = { page: currentPage }

  const start            = (currentPage - 1) * ITEMS_PER_PAGE
  const charactersToShow = bovedaCharacters.slice(start, start + ITEMS_PER_PAGE)

  const results = await Promise.all(
    charactersToShow.map(async (character) => {
      const imageMessage = await createImageMessage(sock, character.url)
      const votos        = character?.votes ?? 0

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title:
            `*💠 Nombre:* ${character.name}\n` +
            `*🍒 Género:* ${character.gender || 'Desconocido'}\n` +
            `*🧀 Fuente:* ${character.source || 'Desconocido'}\n` +
            `*🥙 Valor:* ${(character.value || 0).toLocaleString()}\n` +
            `*🫒 Votos:* ${votos}\n` +
            `*📦 Estado:* Bóveda`,
          hasMediaAttachment: Boolean(imageMessage),
          ...(imageMessage ? { imageMessage } : {})
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      }
    })
  )

  const bodyText =
    `*╭────「 𝑩𝑶́𝑽𝑬𝑫𝑨 」────╮*\n` +
    `│ 💜 🅣ᥙs ᑭᥱrs᥆ᥒᥲȷᥱs: ${totalCharacters}\n` +
    `│ 📦 🅟ᥱrs᥆ᥒᥲȷᥱs ᥱᥒ ᑲ᥆́᥎ᥱძᥲ: ${totalVaulted}\n` +
    `*╰────────────────╯*\n\n` +
    `🅣ᥙs ⍴ᥱrs᥆ᥒᥲȷᥱs gᥙᥲrძᥲძ᥆s:\n` +
    `${charactersToShow.map((ch, i) => `⎆ ${start + i + 1}. ${ch.name}`).join('\n')}`

  const footerText =
    `📄 Página ${currentPage} / ${totalPages}\n` +
    `_Usa */bnext* o */bprev* para navegar_`

  const messageContent = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body:   proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: results
          })
        })
      }
    }
  }, { quoted: m })

  await sock.relayMessage(m.chat, messageContent.message, {
    messageId: messageContent.key.id
  })
}

export default {
  command: ['boveda', 'vault', 'bnext', 'bprev'],
  category: 'gacha',

  run: async ({ sock, m, args }) => {
    const chatId = m.chat
    const userId = m.sender
    const cmd    = m.command
    const botId  = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatConfig = await getChat(chatId)
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    if (cmd === 'bnext') {
      if (!sessions[chatId]?.[userId])
        return sock.reply(m.chat,'✐ Primero abre tu bóveda con */boveda*.',m,m.rcanal)

      const user         = await getChatUser(chatId, userId)
      const totalVaulted = (user?.characters || []).filter(c => c.vaulted).length
      const totalPages   = Math.max(1, Math.ceil(totalVaulted / ITEMS_PER_PAGE))
      const current      = sessions[chatId][userId].page || 1
      const next         = Math.min(current + 1, totalPages)

      if (next === current)
        return sock.reply(m.chat,`✐ Ya estás en la última página (${totalPages}).`,m,m.rcanal)

      return mostrarBoveda(sock, m, chatId, userId, next)
    }

    if (cmd === 'bprev') {
      if (!sessions[chatId]?.[userId])
        return sock.reply(m.chat,'✐ Primero abre tu bóveda con */boveda*.',m,m.rcanal)

      const current = sessions[chatId][userId].page || 1
      const prev    = Math.max(current - 1, 1)

      if (prev === current)
        return sock.reply(m.chat,'✐ Ya estás en la primera página.',m,m.rcanal)

      return mostrarBoveda(sock, m, chatId, userId, prev)
    }

    const page = Math.max(1, parseInt(args[0]) || 1)
    return mostrarBoveda(sock, m, chatId, userId, page)
  }
}