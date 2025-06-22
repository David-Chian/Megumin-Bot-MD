const handler = async (m, { conn }) => {
  
  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.')

  const participants = groupMetadata.participants || []
  const senderNumber = m.sender.split('@')[0]
  const probable = participants.find(p => p.id.includes(senderNumber) && p.id.includes('@lid'))

  if (probable) {
    return m.reply(`🆔 Tu ID tipo @lid es:\n${probable.id}`)
  }

  const lidList = participants
    .filter(p => p.id.includes('@lid'))
    .map(p => `• ${p.id}`)
    .join('\n')

  return m.reply(`❌ No se pudo determinar con certeza tu ID tipo @lid.\n\nLista de participantes tipo @lid:\n${lidList}`)
}

handler.command = /^miid$/i
handler.group = true 
export default handler