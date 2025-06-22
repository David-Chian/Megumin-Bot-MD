const handler = async (m, { conn }) => {
  
  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.')

  const participants = groupMetadata.participants || []
  const senderNumber = m.sender.split('@')[0]

  let user = participants.find(p => p.id.includes(senderNumber))

  if (!user) {
    const nameInChat = await conn.getName(m.sender)
    user = participants.find(p => (p.name || p.notify || '').toLowerCase() === nameInChat.toLowerCase())
  }
  if (!user) {
    const list = participants
      .map(p => `• ${p.id} ${p.name ? `(${p.name})` : ''}`)
      .join('\n')
    return m.reply(`❌ No se pudo vincular tu número con tu ID @lid.\n\nAquí están los participantes:\n${list}`)
  }
  await m.reply(`🆔 Tu ID en este grupo es:\n${user.id}`)
}
handler.command = /^miid$/i
handler.group = true
export default handler