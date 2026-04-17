export default async (client, m) => {
  if (!m.isGroup) return

  const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const chat = global.db.data.chats[m.chat]

  if (!chat?.antistatus) return

  const isEstado = !!(
    m.message?.groupStatusMentionMessage || 
    m.message?.extendedTextMessage?.contextInfo?.groupStatusMentionMessage ||
    m.type === 'groupStatusMentionMessage'
  )

  if (!isEstado) return

  const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return
  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin).map(p => p.id)

  const isBotAdmin = groupAdmins.includes(botId)
  const isAdmin = groupAdmins.includes(m.sender)
  const isSelf = global.db.data.settings[botId]?.self ?? false

  if (isAdmin || !isBotAdmin || isSelf) return

  try {
    await client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    const userName = m.pushName || 'Usuario'

    await client.reply(m.chat, `❖ *${userName}* ha sido expulsado. Prohibido enviar/mencionar estados aquí.`, null)

    setTimeout(async () => {
      await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }, 1000)

  } catch (error) {
    console.error('Error en Anti-Status:', error)
  }
}