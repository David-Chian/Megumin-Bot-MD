const lidMapTemp = {}

const handler = async (m, { conn }) => {
  const jid = m.sender
  let lidGuardado = lidMapTemp[jid]

  if (m.isGroup) {
    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    const participants = groupMetadata?.participants || []

    const posibleLid = participants.find(p =>
      p.id.includes('@lid') && p.id.includes(jid.split('@')[0])
    )

    if (posibleLid) {
      lidGuardado = posibleLid.id
      lidMapTemp[jid] = lidGuardado
    }
  }

  if (lidGuardado) {
    return m.reply(`🆔 Tu ID tipo @lid es:\n${lidGuardado}`)
  } else {
    return m.reply(`❌ No se pudo detectar tu ID tipo @lid.\nHabla en un grupo donde esté el bot para que pueda asociarlo.`)
  }
}

handler.command = /^miid$/i
export default handler