import fs from 'fs'
import { proto, generateWAMessageFromContent, generateWAMessageContent, prepareWAMessageMedia } from "@whiskeysockets/baileys"
import { resolveLidToRealJid } from "../../core/utils.ts"

const ITEMS_PER_PAGE = 20
const FALLBACK_IMAGE = 'https://cdn.sockywa.xyz/files/1751246122292.jpg'

const sessions = {}

function loadCharacters() {
  try {
    return JSON.parse(fs.readFileSync('./core/characters.json', 'utf-8'))
  } catch {
    return []
  }
}

function safeJson(value: any, fallback: any) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try { return JSON.parse(value) } catch { return fallback }
}

const mostrarInventario = async (sock, m, userId, currentPage) => {
  const chat = await getChat(m.chat)
  const marriages = safeJson(chat.marriages, {})
  const globalUser = await getUser(userId)
  const name = globalUser?.name || userId.split('@')[0]
  const titulo = userId === m.sender ? '𝐈ᥒ᥎ᥱᥒ𝗍ᥲrі᥆' : `𝐈ᥒ᥎ᥱᥒ𝗍ᥲrі᥆ de ${name}`

  const userData = await getChatUser(m.chat, userId)
  const characters = userData?.characters || []
  const personajesEnVenta = userData?.personajesEnVenta || []

  const allCharacters = loadCharacters()
  const totalCharacters = allCharacters.length

  const chatUsers = await getChatUser(m.chat)
  const personajesObtenidos = new Set()
  if (Array.isArray(chatUsers)) {
    chatUsers.forEach(u => {
      ;(u.characters || []).forEach(c => personajesObtenidos.add(c.name))
    })
  }

  const characterCount = characters.length
  const totalPages = Math.max(1, Math.ceil(characterCount / ITEMS_PER_PAGE))
  currentPage = Math.max(1, Math.min(currentPage, totalPages))

  sessions[m.chat] = sessions[m.chat] || {}
  sessions[m.chat][userId] = { page: currentPage }

  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  const charactersToShow = characters.slice(start, end)
  const availableCount = totalCharacters - personajesObtenidos.size

  const createImageMessage = async (url) => {
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

  const results = await Promise.all(
    charactersToShow.map(async (character) => {
      let estado = "Iᥒ᥎ᥱᥒ𝗍ᥲrі᥆"
      if (personajesEnVenta.some(p => p.name === character.name)) estado = "Eᥒ ᥎ᥱᥒ𝗍ᥲ"
      if (character.vaulted) estado = "B᥆́᥎ᥱძᥲ"
      if (marriages[character.name]?.partnerId === userId) estado = "💍 Cᥲsᥲძ᥆/ᥲ"
      const imageMessage = await createImageMessage(character.url)

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `*🫒 Nombre:* ${character.name}\n*🍒 Género:* ${character.gender}\n*🧀 Fuente:* ${character.source}\n*🥙 Valor:* ${(character.value || 0).toLocaleString()} rwcoins\n*📌 Estado:* ${estado}`,
          hasMediaAttachment: Boolean(imageMessage),
          ...(imageMessage ? { imageMessage } : {})
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      }
    })
  )

  const inventarioMensaje = `*╭┈ٖٖٖٖٖ┄۬─ׅ╼۪۪۪╭┄ַ֩╼࣭࣭࣭࣭࣭࣭࣭࣭֟፝╾ַ֠┄ֺ۪۪۪╮╾─۬┄ٖٖٖٖٖ┈╮*
         *${titulo}*    
*╰┄۟۟۟۟۟۟۟۟࣪┈ٜ─ֹ╼۫۫۫╰ׅ┄ֿ֑╼࣪࣪࣪࣪࣪࣪࣪࣪۬╾ֿ֑┄ׅ۟۟۟╯╾─ٜ┈۟۟۟۟۟۟۟۟࣪┄╯*
*🫐̵⃘̲˙·̣ Tᥙs ᑭᥱrs᥆ᥒᥲȷᥱs:* ${characterCount} 𝐰𝐟 ♡
*🫐̵⃘̲˙·̣ ᑭᥱrs᥆ᥒᥲȷᥱs ძіs⍴᥆ᥒіᑲᥣᥱs:* ${availableCount} de ${totalCharacters}
*🫐̵⃘̲˙·̣ Tᥙ ⍴r᥆grᥱs᥆:* ${(characterCount / totalCharacters * 100).toFixed(2)}%
*╰┈┄─╶━━━━━━━╴─┈┄╯*

╭ *Tᥙs ⍴ᥱrs᥆ᥒᥲȷᥱs* ╮
${charactersToShow.map((c, i) => `🫟 ${start + i + 1}. ${c.name}`).join('\n')}

*Página ${currentPage} de ${totalPages}*
Usa */next* o */return* para navegar.`

  const messageContent = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({ text: inventarioMensaje }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: `ᑭᥲ́gіᥒᥲ ${currentPage} ძᥱ ${totalPages}\nᑌsᥲ /ᥒᥱ᥊𝗍 ᥆ /rᥱ𝗍ᥙrᥒ ⍴ᥲrᥲ ᥒᥲ᥎ᥱgᥲr ᥱᥒ𝗍rᥱ ᥣᥲs ⍴ᥲgіᥒᥲs.`
          }),
          header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [...results]
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
  command: ['harem', 'ob', 'obtenidos', 'miswaifus', 'claims', 'next', 'siguiente', 'return', 'atras'],
  category: 'gacha',
  run: async ({ sock, m, args }) => {
    const cmd = m.command
    const chatId = m.chat
    const senderId = m.sender

    if (cmd === 'next' || cmd === 'siguiente') {
      sessions[chatId] = sessions[chatId] || {}

      if (!sessions[chatId][senderId])
        return sock.reply(m.chat,`✐ Primero abre tu inventario con */harem*.`, m, m.rcanal)

      const userData = await getChatUser(chatId, senderId)
      const characterCount = userData?.characters?.length || 0
      const totalPages = Math.max(1, Math.ceil(characterCount / ITEMS_PER_PAGE))

      let currentPage = sessions[chatId][senderId].page || 1
      const pageArg = parseInt(args[0])

      if (!isNaN(pageArg) && pageArg > 0) {
        currentPage = Math.min(pageArg, totalPages)
      } else {
        currentPage = Math.min(currentPage + 1, totalPages)
      }

      if (currentPage === sessions[chatId][senderId].page && !(!isNaN(pageArg) && pageArg > 0))
        return sock.reply(m.chat,`✐ Ya estás en la última página (${totalPages}).`,m,m.rcanal)

      return mostrarInventario(sock, m, senderId, currentPage)
    }

    if (cmd === 'return' || cmd === 'atras') {
      sessions[chatId] = sessions[chatId] || {}

      if (!sessions[chatId][senderId])
        return sock.reply(m.chat,`✐ Primero abre tu inventario con */harem*.`,m,m.rcanal)

      const userData = await getChatUser(chatId, senderId)
      const characterCount = userData?.characters?.length || 0
      const totalPages = Math.max(1, Math.ceil(characterCount / ITEMS_PER_PAGE))

      let currentPage = sessions[chatId][senderId].page || 1
      const pageArg = parseInt(args[0])

      if (!isNaN(pageArg) && pageArg > 0) {
        currentPage = Math.max(Math.min(pageArg, totalPages), 1)
      } else {
        currentPage = Math.max(currentPage - 1, 1)
      }

      if (currentPage === sessions[chatId][senderId].page && !(!isNaN(pageArg) && pageArg > 0))
        return sock.reply(m.chat,`✐ Ya estás en la primera página.`,m,m.rcanal)

      return mostrarInventario(sock, m, senderId, currentPage)
    }

    const chatConfig = await getChat(chatId)
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const userId = await resolveLidToRealJid(who2, sock, chatId)

    const userData = await getChatUser(chatId, userId)
    const globalUser = await getUser(userId)
    const name = globalUser?.name || userId.split('@')[0]

    if (!userData?.characters?.length) {
      return sock.reply(m.chat,
        userId === m.sender
          ? `✐ No tienes personajes reclamados en tu inventario.`
          : `✐ *${name}* no tiene personajes reclamados en su inventario.`
      ,m,m.rcanal)
    }

    const page = Math.max(1, parseInt(args[0]) || 1)
    await mostrarInventario(sock, m, userId, page)
  }
}