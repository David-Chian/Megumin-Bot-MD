const handler = async (m, { conn }) => {
  if (m.sender.includes('@lid')) {
    return m.reply(`🆔 Tu JID es:\n${m.sender}`)
  }

  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.')

  const participants = groupMetadata.participants || []
  const number = m.sender.split('@')[0]
  const user = participants.find(p => p.id.includes(number) && p.id.includes('@lid'))

  if (!user) {
    const list = participants
      .map(p => `• ${p.id}`)
      .join('\n')
    return m.reply(`❌ No se encontró tu ID tipo @lid.\n\nParticipantes del grupo:\n${list}`)
  }

  await m.reply(`🆔 Tu ID (JID) en este grupo es:\n${user.id}`)
}

handler.command = ['miid']
export default handler