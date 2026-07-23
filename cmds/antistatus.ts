export default async (sock, m) => {
  if (!m.isGroup) return

  const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return

  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin).map(p => p.id || p.jid)
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupAdmins.includes(botId)
  const isAdmin = groupAdmins.includes(m.sender)

  const botSettings = await getSettings(botId)
  const isSelf = botSettings.self ?? 0
  if (isSelf) return

  const chat = await getChat(m.chat)
  const primaryBotId = chat?.primaryBot
  const isPrimary = !primaryBotId || primaryBotId === botId

  const isEstado = m.quoted?.groupStatusMentionMessage || 
                   m.quoted?.type === 'groupStatusMentionMessage' || 
                   m.message?.groupStatusMentionMessage ||
                   (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage)

  if (!isEstado || !chat?.antistatus || isAdmin || !isPrimary) return

  try {
    if (isBotAdmin) {
      let deleteObj = null
      if (isEstado) {
        deleteObj = {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      }
      if (deleteObj) {
        await sock.sendMessage(m.chat, { delete: deleteObj }).catch(err => {
          console.error('Error al borrar status:', err)
        })
      }
    }

    const targetId = m.sender
    const user = await getChatUser(m.chat, targetId)
    if (!user.warnings) user.warnings = []

    const now = new Date()
    const timestamp = now.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    user.warnings.unshift({
      reason: 'Anti-Status detectado',
      timestamp,
      by: botId,
    })

    await updateChatUser(m.chat, targetId, 'warnings', user.warnings)

    const total = user.warnings.length
    const warnLimit = chat.warnLimit || 3
    const expulsar = chat.expulsar === 1

    const warningList = user.warnings.map((w, i) => 
      `\`#${i + 1}\` » ${w.reason}\n> » Fecha: ${w.timestamp}`
    ).join('\n')

    let message = `✐ Se ha añadido una advertencia automática a @${targetId.split('@')[0]} por *Anti-Status*.\n✿ Advertencias totales \`(${total})\`:\n\n${warningList}`

    if (total >= warnLimit && expulsar) {
      try {
        await sock.groupParticipantsUpdate(m.chat, [targetId], 'remove')
        message += `\n\n> ❖ El usuario alcanzó el límite de advertencias y fue expulsado del grupo.`
      } catch {
        message += `\n\n> ❖ El usuario alcanzó el límite, pero no se pudo expulsar automáticamente.`
      }
    } else if (total >= warnLimit && !expulsar) {
      message += `\n\n> ❖ El usuario ha alcanzado el límite de advertencias.`
    }

    await sock.reply(m.chat, message, m, { mentions: [targetId] })

  } catch (error) {
    console.error('Error general en Anti-Estado:', error)
    await sock.reply(m.chat, `❖ Error en Anti-Status.`, m)
  }
}