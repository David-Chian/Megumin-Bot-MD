import { resolveLidToRealJid } from '../../core/utils.ts'

const COOLDOWN = 60 * 60 * 1000 // 1 hora

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours   = Math.floor(duration / (1000 * 60 * 60))
  if (hours > 0)   return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export default {
  command: ['robarp', 'robarpersonaje', 'robarrw'],
  category: 'gacha',

  run: async ({ sock, m, args }) => {
    const chatId = m.chat
    const userId = m.sender
    const now    = Date.now()
    const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const currency   = botSettings?.currency || 'Coins'

    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const mentioned = m.mentionedJid || []
    const who       = mentioned.length > 0
      ? mentioned[0]
      : (m.quoted ? m.quoted.sender : null)

    const target = who ? await resolveLidToRealJid(who, sock, chatId) : null

    if (!target)
      return sock.reply(m.chat,'Por favor menciona a un usuario o responde a su mensaje para robarle.',m,m.rcanal)

    if (target === userId)
      return sock.reply(m.chat,'No puedes robarte a ti mismo 🤨',m,m.rcanal)

    const nombreSolicitado = args
  .filter(a => !a.startsWith('@'))
  .join(' ')
  .trim()
  .toLowerCase()
    const ladronData  = await getChatUser(chatId, userId)
    const targetData  = await getChatUser(chatId, target)
    const targetGlobal = await getUser(target)
    const ladronGlobal = await getUser(userId)

    const targetName = targetGlobal?.name || target.split('@')[0]
    const ladronName = ladronGlobal?.name || userId.split('@')[0]

    if (!targetData?.characters?.length)
      return m.reply(`@${target.split('@')[0]} no tiene personajes para robar.`)

    const lastRob     = ladronData.robopCooldown || 0
    const restante    = (lastRob + COOLDOWN) - now
    if (restante > 0)
      return sock.reply(m.chat,`⏳ Debes esperar *${msToTime(restante)}* antes de volver a robar.`,m,m.rcanal)

    const marriages      = chatConfig.marriages || {}
    const casados        = new Set(Object.keys(marriages).map(n => n.toLowerCase()))
    const personajesRobables = targetData.characters.filter(p =>
      !p.vaulted && !casados.has(p.name.toLowerCase())
    )

    if (!personajesRobables.length)
      return m.reply(`@${target.split('@')[0]} no tiene personajes robables (todos están en bóveda o casados).`)

    let personajeRobado = null

    if (nombreSolicitado) {
      personajeRobado = personajesRobables.find(
        p => p.name.toLowerCase() === nombreSolicitado
      )

      if (!personajeRobado)
        return m.reply(
          `@${target.split('@')[0]} no tiene el personaje *"${nombreSolicitado}"* disponible para robar\n(puede estar en bóveda, casado o no lo tiene).`
        )

      if (Math.random() > 0.2) {
        await updateChatUser(chatId, userId, 'robopCooldown', now)
        return sock.reply(m.chat,`😔 Intentaste robar a *${personajeRobado.name}* pero fallaste. Intenta de nuevo más tarde.`,m, m.rcanal)
      }
    } else {
      personajeRobado = personajesRobables[
        Math.floor(Math.random() * personajesRobables.length)
      ]
    }

    const nuevosCharsTarget = targetData.characters.filter(
      p => p.name !== personajeRobado.name
    )
    const nuevaVentaTarget = (targetData.personajesEnVenta || []).filter(
      p => p.name !== personajeRobado.name
    )

    const nuevosCharsLadron = [...(ladronData.characters || []), personajeRobado]

    await updateChatUser(chatId, target,  'characters',       nuevosCharsTarget)
    await updateChatUser(chatId, target,  'personajesEnVenta', nuevaVentaTarget)
    await updateChatUser(chatId, userId,  'characters',       nuevosCharsLadron)
    await updateChatUser(chatId, userId,  'robopCooldown',     now)

    const caption =
      `😈 *¡Robo exitoso!*\n\n` +
      `*${ladronName}* le robó a *${targetName}*:\n\n` +
      `➩ *Nombre:* ${personajeRobado.name}\n` +
      `➩ *Género:* ${personajeRobado.gender || 'Desconocido'}\n` +
      `➩ *Fuente:* ${personajeRobado.source || 'Desconocido'}\n` +
      `➩ *Valor:* ${(personajeRobado.value || 0).toLocaleString()} ${currency}`

    return sock.sendMessage(chatId, {
      image:    { url: personajeRobado.url },
      caption,
      mimetype: 'image/jpeg',
      mentions: [userId, target]
    }, { quoted: m })
  }
}