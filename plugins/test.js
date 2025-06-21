const handler = async (m, { conn, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  let groupMetadata = {}
  let participants = []

  try {
    groupMetadata = await conn.groupMetadata(m.chat)
    participants = groupMetadata.participants || []
  } catch (e) {
    return m.reply(`❌ No se pudo obtener la información del grupo.\n${e.message}`)
  }

  const botJid = (conn.user?.id || conn.user?.jid || '').split(':')[0]
  const senderJid = m.sender.split(':')[0]

  const botParticipant = participants.find(p => p.id?.split(':')[0] === botJid)
  const userParticipant = participants.find(p => p.id?.split(':')[0] === senderJid)

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

  console.log('=== TEST ADMIN ===')
  console.log('BOT JID:', botJid)
  console.log('SENDER JID:', senderJid)
  console.log('BOT PARTICIPANT:', botParticipant)
  console.log('USER PARTICIPANT:', userParticipant)
  console.log('isBotAdmin:', isBotAdmin)
  console.log('isAdmin:', isAdmin)
}

handler.command = /^testadmin$/i
export default handler