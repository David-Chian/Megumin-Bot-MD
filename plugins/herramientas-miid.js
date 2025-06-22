const handler = async (m, { conn }) => {
  const jid = m.sender
  await m.reply(`🆔 Tu JID es:\n${jid}`)
}

handler.command = /^miid$/i
export default handler