const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
const participants = groupMetadata?.participants || []

  const sampleId = participants[0]?.id || ''
  const anyParticipant = participants[0]?.id || ''
const domain = anyParticipant.includes('@lid') ? '@lid' : '@s.whatsapp.net'
  const botJID = (conn.user?.id || conn.user?.jid || '').replace(/@.+/, '') + domain
  const senderLID = participants.find(p => p.id === m.sender)?.id || participants.find(p => p.admin)?.id || ''
  const senderJid = senderLID || m.sender.replace(/@.*/, '') + domain

  const botParticipant = participants.find(p => p.id === botJID)
const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
  const userParticipant = participants.find(p => p.id === senderJid)

  
  const isRAdmin = userParticipant?.admin === 'superadmin'
  const isAdmin = isRAdmin || userParticipant?.admin === 'admin'

  const debug = participants.map(p => `• ${p.id} | admin: ${p.admin}`).join('\n')

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

handler.command = /^test$/i
export default handler