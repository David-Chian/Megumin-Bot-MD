const carreras = new Map()

export default {
  command: ['carrera'],
  category: 'rpg',
  run: async ({ sock, m, args, usedPrefix }) => {
    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId).currency || 'Coins'

    const chat = getChat(m.chat)
    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const user = getChatUser(m.chat, m.sender)

    const caballoElegido = Number(args[0])
    const apuesta = Number(args[1])

    if (!caballoElegido || caballoElegido < 1 || caballoElegido > 6)
      return m.reply(`🐴 Uso correcto:\n${usedPrefix}carrera <1-6> <apuesta>`)

    if (!apuesta || apuesta <= 0)
      return m.reply(`💰 Apuesta inválida.`)

    if (user.coins < apuesta)
      return m.reply(`🎙️ *ÁRBITRO*: Hey mano no tienes suficientes ${monedas}.`)

    const remaining = user.carreraCooldown - Date.now()
    if (remaining > 0)
      return m.reply(`🎙️ *ÁRBITRO*: Los caballos están descansando bro, espera *${msToTime(remaining)}* para la proxima carrera.`)

    if (carreras.has(m.chat))
      return m.reply(`🏁 Ya hay una carrera en curso.`)

    const newCooldown = Date.now() + 15 * 60000
    const newCoins = user.coins - apuesta

    updateChatUser(m.chat, m.sender, 'carreraCooldown', newCooldown)
    updateChatUser(m.chat, m.sender, 'coins', newCoins)

    let currentCoins = newCoins
    carreras.set(m.chat, true)

    const meta = 15
    const caballos = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      pos: 0,
      eliminado: false
    }))

    let narrador = '🎙️ *ÁRBITRO*: ¡Arranca la carrera!\n'

    const { key } = await sock.sendMessage(
      m.chat,
      { text: renderCarrera(caballos, narrador) },
      { quoted: m }
    )

    const inicio = Date.now()

    const intervalo = setInterval(async () => {
      if (Date.now() - inicio > 20 * 60 * 1000) {
        clearInterval(intervalo)
        carreras.delete(m.chat)
        return sock.sendMessage(m.chat, {
          text: '⏱️ Carrera cancelada por tiempo.',
          edit: key
        })
      }

      let eventos = []

      for (const c of caballos) {
        if (c.eliminado) continue

        const rnd = Math.random()

        if (rnd < 0.05) {
          c.eliminado = true
          eventos.push(`❌ El caballo ${c.id} fue descalificado`)
          continue
        }

        if (rnd < 0.15) {
          eventos.push(`🪨 El caballo ${c.id} tropieza`)
          continue
        }

        c.pos += Math.floor(Math.random() * 3) + 1
        if (c.pos > meta) c.pos = meta
      }

      const lider = [...caballos]
        .filter(c => !c.eliminado)
        .sort((a, b) => b.pos - a.pos)[0]

      narrador =
        `🎙️ *ÁRBITRO*\n` +
        (lider ? `🔥 El caballo ${lider.id} va a la cabeza!\n` : '') +
        eventos.join('\n')

      const ganador = caballos.find(c => c.pos >= meta && !c.eliminado)

      await sock.sendMessage(m.chat, {
        text: renderCarrera(caballos, narrador),
        edit: key
      })

      if (ganador) {
        clearInterval(intervalo)
        carreras.delete(m.chat)

        if (ganador.id === caballoElegido) {
          const premio = apuesta * 2
          const coinsGanador = currentCoins + premio
          updateChatUser(m.chat, m.sender, 'coins', coinsGanador)
          return sock.sendMessage(m.chat, {
            text: `🏆 *CABALLO ${ganador.id} GANÓ!*\n🎉 Ganaste ${premio} ${monedas}`
          })
        } else {
          return sock.sendMessage(m.chat, {
            text: `💀 *CABALLO ${ganador.id} GANÓ*\n❌ Perdiste ${apuesta} ${monedas}`
          })
        }
      }
    }, 4000)
  }
}

function renderCarrera(caballos, narrador) {
  const pista = caballos.map(c => {
    const pos = Math.min(c.pos, 15)
    const avance = '-'.repeat(pos)
    const resto = '-'.repeat(15 - pos)
    const icono = c.eliminado ? '❌' : '🐴'
    return `${c.id} ${avance}${icono}${resto}`
  }).join('\n')

  return `${narrador}\n\n${pista}`
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}