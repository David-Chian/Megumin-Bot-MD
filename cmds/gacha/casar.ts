import { resolveLidToRealJid } from "../../core/utils.ts"

function safeJson(value: any, fallback: any) {
  if (value == null) return fallback
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function getJidNumber(jid: any) {
  if (!jid || typeof jid !== 'string') return 'desconocido'
  return jid.split('@')[0]
}

export default {
  command: ['casarw', 'marrygacha'],
  category: 'rpg',

  run: async ({ sock, m, args }: any) => {
    const text = args.join(' ').trim()
try {
    if (!text) {
      return sock.reply(m.chat,`💍 Debes escribir el nombre del personaje.\nEjemplo: */casarw Megumin*`,m, m.rcanal)
    }

    const chatId = m.chat
    const userId = m.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatConfig = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const currency = botSettings?.currency || 'Coins'

    if (chatConfig.adminonly || !chatConfig.gacha) {
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)
    }

    const marriages = safeJson(chatConfig.marriages, {})

    const yaCasado = Object.entries(marriages).find(([, data]: any) => {
      return data && typeof data === 'object' && data.partnerId === userId
    })

    if (yaCasado) {
      return sock.reply(m.chat,
        `⚠️ Ya estás casado con *${yaCasado[0]}*.\n` +
        `Usa */separar ${yaCasado[0]}* antes de casarte con alguien más.`,m,m.rcanal
      )
    }

    const characterName = text.toLowerCase()
    const basePrice = 1_000_000

    let targetChar: any = null
    let currentOwnerId: string | null = null

    const chatUsers = await getChatUser(chatId)

    if (Array.isArray(chatUsers)) {
      for (const u of chatUsers) {
        const chars = safeJson(u.characters, [])

        if (!Array.isArray(chars)) continue

        const found = chars.find((c: any) => {
          const name = typeof c?.name === 'string' ? c.name : ''
          return name.toLowerCase().includes(characterName)
        })

        if (found) {
          targetChar = found
          currentOwnerId = u.user_id
          break
        }
      }
    }

    if (!targetChar) {
      return sock.reply(m.chat,`❌ Ese personaje no existe o nadie lo ha reclamado aún.`,m,m.rcanal)
    }

    const realCharName = String(targetChar.name || text)
    const marriageRecord = marriages[realCharName]
    const user = await getChatUser(chatId, userId)

    if (marriageRecord && typeof marriageRecord === 'object') {
      const pricePaid = Number(marriageRecord.pricePaid || basePrice)
      const stealPrice = pricePaid * 2

      if ((Number(user.coins) || 0) < stealPrice) {
        return sock.reply(m.chat,
          `💔 *${realCharName}* ya tiene dueño. Para robártelo necesitas ` +
          `*${stealPrice.toLocaleString()}* ${currency}.`,m,m.rcanal
        )
      }

      const exPartnerId = marriageRecord.partnerId

      if (!exPartnerId || typeof exPartnerId !== 'string') {
        return sock.reply(m.chat,`⚠️ El registro de matrimonio de *${realCharName}* está dañado.`,m,m.rcanal)
      }

      const exUser = await getChatUser(chatId, exPartnerId)
      const compensation = Math.floor(pricePaid * 0.50)

      const exCharsRaw = safeJson(exUser.characters, [])
      const exChars = Array.isArray(exCharsRaw)
        ? exCharsRaw.filter((c: any) => c?.name !== realCharName)
        : []

      await updateChatUser(chatId, exPartnerId, 'characters', exChars)
      await updateChatUser(chatId, exPartnerId, 'coins', (Number(exUser.coins) || 0) + compensation)

      const userCharsRaw = safeJson(user.characters, [])
      const userChars = Array.isArray(userCharsRaw) ? userCharsRaw : []

      const newChars = [...userChars, targetChar]

      await updateChatUser(chatId, userId, 'characters', newChars)
      await updateChatUser(chatId, userId, 'coins', (Number(user.coins) || 0) - stealPrice)

      marriages[realCharName] = {
        partnerId: userId,
        pricePaid: stealPrice,
        date: Date.now()
      }

      await updateChat(chatId, 'marriages', marriages)

      return sock.sendMessage(m.chat, {
        image: { url: targetChar.url },
        caption:
          `🔥 *¡NTR DETECTADO!* 🔥\n\n` +
          `@${getJidNumber(userId)} ha pagado *${stealPrice.toLocaleString()}* ${currency} ` +
          `y le ha robado a *${realCharName}* a @${getJidNumber(exPartnerId)}.\n\n` +
          `💔 El ex recibió *${compensation.toLocaleString()}* ${currency} de consolación.`,
        mimetype: 'image/jpeg',
        mentions: [userId, exPartnerId]
      }, { quoted: m })
    }

    if (currentOwnerId !== userId) {
      return sock.reply(m.chat,`⚠️ Para casarte con *${realCharName}* por primera vez, primero debe estar en tu inventario.`,m, m.rcanal)
    }

    if ((Number(user.coins) || 0) < basePrice) {
      return sock.reply(m.chat,`💍 Casarse cuesta *${basePrice.toLocaleString()}* ${currency}. No tienes suficiente dinero.`,m, m.rcanal)
    }

    await updateChatUser(chatId, userId, 'coins', (Number(user.coins) || 0) - basePrice)

    marriages[realCharName] = {
      partnerId: userId,
      pricePaid: basePrice,
      date: Date.now()
    }

    await updateChat(chatId, 'marriages', marriages)

    return sock.sendMessage(m.chat, {
      image: { url: targetChar.url },
      caption:
        `💒 ¡Felicidades! Te has casado con *${realCharName}* ` +
        `por *${basePrice.toLocaleString()}* ${currency}.\n\n` +
        `¡Que vivan los novios!`,
      mimetype: 'image/jpeg'
    }, { quoted: m })
    } catch(err) {
sock.reply(m.chat,`${err.message}`,m,m.rcanal)
}
  }
}