const handler = async (m, { conn }) => {
  const userId = m.sender
  if (userId.includes('@lid')) {
    return m.reply(`🆔 Tu ID es:\n${userId}`)
  }

  const contacts = await conn.onWhatsApp(userId.split('@')[0])
  const jid = contacts?.[0]?.jid

  if (jid && jid.includes('@lid')) {
    return m.reply(`🆔 Tu ID tipo @lid es:\n${jid}`)
  }

  return m.reply(`🆔 Tu ID es:\n${userId}`)
}

handler.command = /^miid$/i
export default handler