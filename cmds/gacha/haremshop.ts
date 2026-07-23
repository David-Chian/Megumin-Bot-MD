import fs from 'fs'
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

const mostrarShop = async (sock, m, chatId, currentPage, currency) => {
  const chatUsers = await getChatUser(chatId)

  const allForSale = []
  for (const user of chatUsers) {
    if (!user.personajesEnVenta?.length) continue
    const vendedorInfo = await getUser(user.user_id)
    const vendedorNombre = vendedorInfo?.name || user.user_id.split('@')[0]
    for (const p of user.personajesEnVenta) {
      allForSale.push({ ...p, seller: user.user_id, vendedorNombre })
    }
  }

  if (!allForSale.length)
    return sock.reply(m.chat,'《✤》 No hay personajes en venta actualmente.', m, m.rcanal)

  const totalPages  = Math.max(1, Math.ceil(allForSale.length / ITEMS_PER_PAGE))
  currentPage       = Math.max(1, Math.min(currentPage, totalPages))

  sessions[chatId]              = sessions[chatId] || {}
  sessions[chatId][m.sender]    = { page: currentPage }

  const start          = (currentPage - 1) * ITEMS_PER_PAGE
  const charactersToShow = allForSale.slice(start, start + ITEMS_PER_PAGE)

  const results = await Promise.all(
    charactersToShow.map(async (character) => {
      const imageMessage = await createImageMessage(sock, character.url)

      return {
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title:
            `*🫒 N᥆mᑲrᥱ:* ${character.name}\n` +
            `*🍒 Gᥱ́ᥒᥱr᥆:* ${character.gender || 'Desconocido'}\n` +
            `*🧀 Fᥙᥱᥒ𝗍ᥱ:* ${character.source || 'Desconocido'}\n` +
            `*💲 Prᥱᥴі᥆:* ${(character.precio || 0).toLocaleString()} ${currency}\n` +
            `*📌 Vᥱᥒძᥱძ᥆r:* ${character.vendedorNombre}`,
          hasMediaAttachment: Boolean(imageMessage),
          ...(imageMessage ? { imageMessage } : {})
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      }
    })
  )

  const bodyText =
    `*Pᥱrs᥆ᥒᥲȷᥱs ᥱᥒ ᥎ᥱᥒ𝗍ᥲ:*\n` +
    `${charactersToShow.map((c, i) => `● ${start + i + 1}. ${c.name}`).join('\n')}\n\n` +
    `*Pᥲrᥲ ᥴ᥆m⍴rᥲrᥣ᥆s ᥙsᥲ:*\n` +
    `*/comprar <nombre>*\n` +
    `_Eȷᥱm⍴ᥣ᥆: /comprar Megumin_`

  const footerText =
    `Pᥲ́gіᥒᥲ ${currentPage} ძᥱ ${totalPages}\n` +
    `_Usᥲ */wsnext* ᥆ */wsprev* ⍴ᥲrᥲ ᥒᥲ᥎ᥱgᥲr._`

  const messageContent = generateWAMessageFromContent(chatId, {
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

  await sock.relayMessage(chatId, messageContent.message, {
    messageId: messageContent.key.id
  })
}

export default {
  command: ['haremshop', 'tiendawaifus', 'wshop', 'wsnext', 'wsprev'],
  category: 'gacha',

  run: async ({ sock, m, args }) => {
    const chatId  = m.chat
    const userId  = m.sender
    const cmd     = m.command
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatConfig  = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const currency    = botSettings?.currency || 'Coins'

    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    if (cmd === 'wsnext') {
      if (!sessions[chatId]?.[userId])
        return sock.reply(m.chat,'✐ Primero abre la tienda con */haremshop*.',m, m.rcanal)

      const chatUsers      = await getChatUser(chatId)
      const totalForSale   = chatUsers.reduce((acc, u) => acc + (u.personajesEnVenta?.length || 0), 0)
      const totalPages     = Math.max(1, Math.ceil(totalForSale / ITEMS_PER_PAGE))
      const currentPage    = Math.min((sessions[chatId][userId].page || 1) + 1, totalPages)

      if (currentPage === sessions[chatId][userId].page)
        return sock.reply(m.chat,`✐ Ya estás en la última página (${totalPages}).`,m, m.rcanal)

      return mostrarShop(sock, m, chatId, currentPage, currency)
    }

    if (cmd === 'wsprev') {
      if (!sessions[chatId]?.[userId])
        return sock.reply(m.chat,'✐ Primero abre la tienda con */haremshop*.',m, m.rcanal)

      const currentPage = Math.max((sessions[chatId][userId].page || 1) - 1, 1)

      if (currentPage === sessions[chatId][userId].page)
        return sock.reply(m.chat,'✐ Ya estás en la primera página.',m,m.rcanal)

      return mostrarShop(sock, m, chatId, currentPage, currency)
    }

    const page = Math.max(1, parseInt(args[0]) || 1)
    return mostrarShop(sock, m, chatId, page, currency)
  }
}