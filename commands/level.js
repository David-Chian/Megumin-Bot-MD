const canLevelUp = (level, exp, multiplier = 1) => {
  const req = Math.floor(Math.pow(level + 1, 2) * 100 * (multiplier || 1))
  return exp >= req
}

export async function before(m, { client }) {
  const user = global.db.data.users[m.sender]

  if (!user) return 

  const beforeLevel = user.level || 0
  let currentLevel = beforeLevel

  while (canLevelUp(currentLevel, user.exp, global.multiplier)) {
    currentLevel++
  }

  if (currentLevel !== beforeLevel) {
    user.level = currentLevel

    const name = m.pushName || 'Usuario'
    const status = `*¡FELICIDADES ${name.toUpperCase()}!* 🏆\n\n` +
                   `✐ *Nivel anterior:* ${beforeLevel}\n` +
                   `✐ *Nivel actual:* ${currentLevel}\n\n` +
                   `> Sigue interactuando para subir de rango.`

   // await client.reply(m.chat, status, m)
  }
}