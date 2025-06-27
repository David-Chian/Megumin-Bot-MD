let handler = async function (m, { conn }) {
  conn.tekateki = conn.tekateki || {}
  let id = m.chat
  if (!(id in conn.tekateki)) return
  let [msg, json, poin, timeout, intentos = 0] = conn.tekateki[id]
  if (!m.quoted || m.quoted.id !== msg.key.id) return
  let correcta = json.response.trim().toLowerCase()
  let respuesta = m.text.trim().toLowerCase()
  if (respuesta === correcta) {
    clearTimeout(timeout)
    delete conn.tekateki[id]
    conn.reply(m.chat, `🎉 ¡Correcto!\nHas resuelto el caso y ganaste +${poin} Exp`, m)
    if (!db.data.users[m.sender].exp) db.data.users[m.sender].exp = 0
    db.data.users[m.sender].exp += poin
  } else {
    conn.tekateki[id][4] = intentos + 1
    if (conn.tekateki[id][4] === 2) {
      let pista = generarPista(correcta)
      conn.reply(m.chat, `❌ Esa no es la respuesta correcta.\n💡 *Pista:* ${pista}`, m)
    } else {
      conn.reply(m.chat, `❌ Respuesta incorrecta. Intenta de nuevo.`, m)
    }
  }
}
export default handler
function generarPista(respuesta) {
  let chars = respuesta.split('')
  let ocultas = chars.map((c, i) => {
    if (/[a-z]/i.test(c) && Math.random() > 0.5) return '_'
    return c
  })
  return ocultas.join('')
}