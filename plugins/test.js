const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  let groupMetadata, participants
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
    participants = groupMetadata?.participants || []
  } catch (e) {
    console.error('Error al obtener metadata:', e)
    return m.reply('❌ No se pudo obtener metadata del grupo.')
  }

  const botJid = conn.decodeJid(conn.user?.jid || '')
  const senderJid = conn.decodeJid(m.sender)

  const allParticipantIds = participants.map(p => conn.decodeJid(p.id))
  const debug = participants.map(p => `• ${conn.decodeJid(p.id)} | admin: ${p.admin}`).join('\n')

  const botParticipant = participants.find(p => conn.decodeJid(p.id) === botJid)
  const userParticipant = participants.find(p => conn.decodeJid(p.id) === senderJid)

  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
  const isRAdmin = userParticipant?.admin === 'superadmin'
  const isAdmin = isRAdmin || userParticipant?.admin === 'admin'

  const result = `
✅ *Resultado de Test Admin Detallado*

📍 Bot JID: ${botJid}
📍 Tu JID: ${senderJid}

👤 *Usuario*
- Admin: ${isAdmin ? '✅ Sí' : '❌ No'}
- Superadmin: ${isRAdmin ? '✅ Sí' : '❌ No'}

🤖 *Bot*
- Admin: ${isBotAdmin ? '✅ Sí' : '❌ No'}

👥 *Participantes del grupo*:
${debug}
`.trim()

  await m.reply(result)

  console.log('=== PARTICIPANTES ===')
  console.log(participants)
}

handler.command = /^test$/i
export default handler