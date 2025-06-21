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

  const sampleParticipant = participants[0]?.id || ''
  const domain = sampleParticipant.includes('@lid') ? '@lid' : '@s.whatsapp.net'
  const botJid = conn.decodeJid(conn.user?.jid || '').replace(/@.*/, '') + domain
  const senderJid = m.sender.replace(/@.*/, '') + domain

  const botParticipant = participants.find(p => p.id === botJid)
  const userParticipant = participants.find(p => p.id === senderJid)

  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
  const isRAdmin = userParticipant?.admin === 'superadmin'
  const isAdmin = isRAdmin || userParticipant?.admin === 'admin'

  const debug = participants.map(p => `• ${p.id} | admin: ${p.admin}`).join('\n')

  const result = `
✅ *Resultado de Test Admin Corregido*

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
}

handler.command = /^test$/i
export default handler