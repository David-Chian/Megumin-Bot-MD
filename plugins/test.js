const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  let groupMetadata = {}
  let participants = []

  try {
    groupMetadata = await conn.groupMetadata(m.chat)
    participants = groupMetadata.participants || []
  } catch (e) {
    m.reply(`❌ Error al obtener groupMetadata: ${e.message}`)
  }

  const botJid = conn.decodeJid(conn.user?.jid || '')
  const senderJid = conn.decodeJid(m.sender)

  const botParticipant = participants.find(p => conn.decodeJid(p.id) === botJid)
  const userParticipant = participants.find(p => conn.decodeJid(p.id) === senderJid)

  const isBotAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
  const isRAdmin = userParticipant?.admin === 'superadmin'
  const isAdmin = isRAdmin || userParticipant?.admin === 'admin'

  let result = `✅ *Resultado de Test Admin*\n\n`
  result += `📍 Bot JID: ${botJid}\n`
  result += `📍 Tu JID: ${senderJid}\n`
  result += `\n👤 *Usuario*\n`
  result += `- Admin: ${isAdmin ? '✅ Sí' : '❌ No'}\n`
  result += `- Superadmin: ${isRAdmin ? '✅ Sí' : '❌ No'}\n`
  result += `\n🤖 *Bot*\n`
  result += `- Admin: ${isBotAdmin ? '✅ Sí' : '❌ No'}\n`

  await m.reply(result)

  console.log('=== TEST ADMIN CORREGIDO ===')
  console.log('BOT JID:', botJid)
  console.log('SENDER JID:', senderJid)
  console.log('BOT PARTICIPANT:', botParticipant)
  console.log('USER PARTICIPANT:', userParticipant)
  console.log('isBotAdmin:', isBotAdmin)
  console.log('isAdmin:', isAdmin)
}

handler.command = /^test$/i
export default handler