const handler = async (m, { conn }) => {
  
  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.')

  const participants = groupMetadata.participants || []

  const user = participants.find(p => {
    return p?.id?.endsWith('@lid') && p?.admin !== undefined && p?.admin !== null && m.participant === p?.id
  }) || participants.find(p => {
    return p?.id && p?.id.includes('@lid') && m.sender.includes(p?.id.split('@')[0])
  })

  if (!user) {
    const lidList = participants
      .filter(p => p.id?.endsWith('@lid'))
      .map(p => `• ${p.id}`)
      .join('\n')
    return m.reply(`❌ No se encontró tu ID @lid.\n\nLista de participantes con @lid:\n${lidList}`)
  }

  await m.reply(`🆔 Tu ID con @lid es:\n${user.id}`)
}

handler.command = /^miid$/i
handler.group = true
export default handler