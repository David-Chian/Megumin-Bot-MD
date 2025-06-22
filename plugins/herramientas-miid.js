import fs from 'fs'

const LID_PATH = './lidmap.json'
function guardarLidMap(jidS, jidL) {
  let db = {}
  if (fs.existsSync(LID_PATH)) {
    db = JSON.parse(fs.readFileSync(LID_PATH))
  }
  db[jidS] = jidL
  fs.writeFileSync(LID_PATH, JSON.stringify(db, null, 2))
}

const handler = async (m, { conn }) => {
  let db = {}
  if (fs.existsSync(LID_PATH)) {
    db = JSON.parse(fs.readFileSync(LID_PATH))
  }
  const jid = m.sender
  let lidGuardado = db[jid]
  if (m.isGroup) {
    const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
    const participants = groupMetadata?.participants || []

    const posibleLid = participants.find(p => {
      return p.id.includes('@lid') && p.id.includes(jid.split('@')[0])
    })

    if (posibleLid) {
      lidGuardado = posibleLid.id
      guardarLidMap(jid, lidGuardado)
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