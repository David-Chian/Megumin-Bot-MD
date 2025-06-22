const handler = async (m, { conn }) => {
  
  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  if (!groupMetadata) return m.reply('❌ No se pudo obtener la información del grupo.')

  const participants = groupMetadata.participants || []

  const user = participants.find(p => p.id === m.participant)

  if (!user) {
    return m.reply('❌ No se encontró tu ID en este grupo.')
  }

  await m.reply(`🆔 Tu ID en este grupo es:\n${user.id}`)
}

handler.command = /^miid$/i
handler.group = true
export default handler