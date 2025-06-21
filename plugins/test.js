const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
  const participants = groupMetadata?.participants || []

  const debug = participants.map(p => `• ${p.id} | admin: ${p.admin}`).join('\n')
  const senderNumber = m.sender.replace(/\D/g, '')
  const botNumber = conn.user?.id?.replace(/\D/g, '')
  const userParticipant = participants.find(p => p.id.replace(/\D/g, '') === senderNumber)
  const botParticipant = participants.find(p => p.id.replace(/\D/g, '') === botNumber)

  const senderJid = userParticipant?.id || m.sender
  const botJid = botParticipant?.id || conn.user?.jid

  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
  const isRAdmin = userParticipant?.admin === 'superadmin'
  const isAdmin = isRAdmin || userParticipant?.admin === 'admin'

  const result = `
✅ *Resultado de Test Admin Final*

📍 Bot JID: ${botJid}
📍 Tu JID (detectado): ${senderJid}

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

handler.command = /^testadmin$/i
export default handler