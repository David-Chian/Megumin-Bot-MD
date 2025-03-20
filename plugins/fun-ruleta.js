let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users[m.sender]

  let tiempoEspera = 10

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🚩 Ya has iniciado una apuesta recientemente, espera *⏱ ${tiempoRestante}* para apostar nuevamente`, m, rcanal)
    return
  }

  cooldowns[m.sender] = Date.now()

  if (!text) return conn.reply(m.chat, `🚩 Debes ingresar una cantidad de *🍫 Chocolates* y apostar a un color, por ejemplo: *${usedPrefix + command} 20 black*`, m)

  let args = text.trim().split(" ")
  if (args.length !== 2) return conn.reply(m.chat, `🚩 Formato incorrecto. Debes ingresar una cantidad de *🍫 Chocolates* y apostar a un color, por ejemplo: *${usedPrefix + command} 20 black*`, m)

  let chocolates = parseInt(args[0])
  let color = args[1].toLowerCase()

  if (isNaN(chocolates) || chocolates <= 0) return conn.reply(m.chat, `🚩 Por favor, ingresa una cantidad válida para la apuesta.`, m)

  if (chocolates > 50) return conn.reply(m.chat, "🚩 La cantidad máxima de apuesta es de 50 *🍫 Chocolates*.", m)

  if (!(color === 'black' || color === 'red')) return conn.reply(m.chat, "🚩 Debes apostar a un color válido: *black* o *red*.", m)

  if (chocolates > users.chocolates) return conn.reply(m.chat, "🚩 No tienes suficientes *🍫 Chocolates* para realizar esa apuesta.", m)

  await conn.reply(m.chat, `🚩 Apostaste ${chocolates} *🍫 Chocolates* al color ${color}. Espera *⏱ 10 segundos* para conocer el resultado.`, m)

  setTimeout(() => {
    let result = Math.random()
    let win = false

    if (result < 0.5) {
      win = color === 'black'
    } else {
      win = color === 'red'
    }

    if (win) {
      users.chocolates += chocolates
      conn.reply(m.chat, `🚩 ¡Ganaste! Obtuviste ${chocolates} *🍫 Chocolates*. Total: ${users.chocolates} *🍫 Chocolates*.`, m)
    } else {
      users.chocolates -= chocolates
      conn.reply(m.chat, `🚩 Perdiste. Se restaron ${chocolates} *🍫 Chololates*. Total: ${users.choclates} *🍫 Chocolates*.`, m)
    }


  }, 10000)
}
handler.tags = ['fun']
handler.help =['ruleta *<cantidad> <color>*']
handler.command = ['ruleta', 'roulette', 'rt']
handler.register = true
export default handler

function segundosAHMS(segundos) {
  let segundosRestantes = segundos % 60
  return `${segundosRestantes} segundos`
}