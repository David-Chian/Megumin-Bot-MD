const words = [
  'estrella', 'ventana', 'puerta', 'computadora', 'televisor', 'desenlace', 'animacion', 'instruccion', 'contraseña', 'bicampeonato', 'melancolia', 'desconocido', 'interrogante', 'subterraneo', 'tratamiento', 'plan', 'hielo', 'helado', 'reencarnacion', 'resultado', 'caricatura', 'desintegrado', 'graduacion', 'rechazo', 'murmullo', 'escalofrio', 'colores',
  'universidad', 'biblioteca', 'montaña', 'telefono', 'elefante', 'hipopotamo', 'murcielago', 'arquitectura', 'electricidad', 'fotografia', 'aguacate', 'contenedor', 'tenedor', 'paralelogramo', 'circunferencia', 'inverosimil', 'yacimiento', 'jengibre', 'bumeran', 'metafisica', 'jugabilidad', 'olvidar', 'hentai', 'maltrato', 'alquimia', 'silueta', 'tridente',
  'bicicleta', 'sombrero', 'paraguas', 'manzana', 'naranja', 'linterna', 'brujula', 'teclado', 'mochila', 'espejo', 'martillo', 'pincel', 'reloj', 'museo', 'aeropuerto', 'teatro', 'catedral', 'prision', 'torre', 'elegria', 'tristeza', 'sorpresa', 'excitacion', 'enojo', 'calma', 'ansiedad', 'degenerada', 'inodoro', 'nintendo', 'twitter', 'quimera', 'cosmico',
  'castillo', 'jirafa', 'serpiente', 'tortuga', 'chocolate', 'youtube', 'cama', 'diccionario', 'kilometro', 'valquiria', 'negro', 'barcelona', 'singapur', 'vasectomia', 'relampago', 'repampanos', 'oreja', 'vocero', 'washington', 'anomalia', 'japon', 'mondongo', 'volcan', 'arrecife', 'lechuza', 'cangrejo', 'cactus', 'pinguino', 'delfin', 'laberinto', 'pantano',
  'galaxia', 'cometa', 'ballena', 'tiburon', 'hospital', 'mercado', 'megumin', 'diamond', 'servicio', 'decadencia', 'administracion', 'holograma', 'peliculas', 'hambre', 'ahorcado', 'calcinado', 'ganaremos', 'perderan', 'putos', 'guallaba', 'diamantes', 'callejero', 'pinga'
]

const hangmanArt = [
  `
   ------
   |    |
        |
        |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
        |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
   |    |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|    |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|\\  |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|\\  |
  /     |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|\\  |
  / \\  |
        |
  =========`
]

global.games = global.games || {}
const games = global.games

const TIME_LIMIT        = 5 * 60 * 1000
const COOLDOWN          = 10 * 60 * 1000
const PENALTY_EXP       = 100
const PENALTY_CHOCOLATES = 200

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

export default {
  command: ['ahorcado', 'hangman'],
  category: 'game',
before: async (m: any, { sock }: any) => {
  global.games = global.games || {}
  const games = global.games

  const chatId   = m.chat
  const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const chat     = getChat(chatId)
  const primaryBotId = chat.primaryBot

  if (primaryBotId && primaryBotId !== botId) return
  if (!m.quoted || !games[chatId] || m.quoted.id !== games[chatId].messageId || m.sender !== games[chatId].player) return

  try {
    const game    = games[chatId]
    const guess   = m.text.trim().toLowerCase()
    const word    = game.word
    const monedas = getSettings(botId).currency

    if (!guess.match(/^[a-z]+$/)) {
      await sock.reply(chatId, `✧ Por favor, envía solo letras o una palabra válida (sin números ni caracteres especiales).`, m, m.rcanal)
      return
    }

    if (guess.length === word.length) {
      if (guess === word) {
const chatUser   = getChatUser(chatId, m.sender)
const globalUser = getUser(m.sender)

updateChatUser(chatId, m.sender, 'coins', (chatUser.coins || 0) + 1000)
updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
updateUser(m.sender, 'exp', (globalUser.exp || 0) + 500)

const uAfter     = getChatUser(chatId, m.sender)
const uAfterGlob = getUser(m.sender)
        clearTimeout(game.timeout)
        delete games[chatId]
        await sock.reply(
          chatId,
          `➪ *¡Ganaste!*\n\n> La palabra era: *${word}*\n> Recompensa: *500 exp* y *1000 ${monedas}*\n> Total: ${uAfterGlob.exp} exp, ${uAfter.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`,
          m, m.rcanal 
        )
      } else {
        game.attemptsLeft -= 1
        const hiddenWord  = game.hidden.join(' ')
        const usedLetters = Array.from(game.guessedLetters).join(', ') || 'Ninguna'

        if (game.attemptsLeft === 0) {
const chatUser   = getChatUser(chatId, m.sender)
const globalUser = getUser(m.sender)

updateChatUser(chatId, m.sender, 'coins', Math.max(0, (chatUser.coins || 0) - PENALTY_CHOCOLATES))
updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
updateUser(m.sender, 'exp', Math.max(0, (globalUser.exp || 0) - PENALTY_EXP))

const uAfter     = getChatUser(chatId, m.sender)
const uAfterGlob = getUser(m.sender)
          clearTimeout(game.timeout)
          delete games[chatId]
          await sock.reply(
            chatId,
            `➪ *Perdiste*\n\n> La palabra era: *${word}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${uAfterGlob.exp} exp, ${uAfter.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n${hangmanArt[6]}`,
            m, m.rcanal 
          )
        } else {
          const info = `➪ *Palabra incorrecta*\n\n> Palabra: ${hiddenWord}\n> Intentos restantes: ${game.attemptsLeft}\n> Letras usadas: ${usedLetters}\n${hangmanArt[6 - game.attemptsLeft]}\n\n✧ Responde con una letra o palabra.`
          const sentMsg = await sock.reply(chatId, info, m, m.rcanal)
          game.messageId = sentMsg.key.id
        }
      }
      return
    }

    if (guess.length === 1) {
      if (game.guessedLetters.has(guess)) {
        await sock.reply(chatId, `✧ La letra *${guess}* ya fue usada. Intenta otra.`, m, m.rcanal)
        return
      }

      game.guessedLetters.add(guess)
      let correct = false
      for (let i = 0; i < word.length; i++) {
        if (word[i] === guess) { game.hidden[i] = guess; correct = true }
      }
      if (!correct) game.attemptsLeft -= 1

      const hiddenWord  = game.hidden.join(' ')
      const usedLetters = Array.from(game.guessedLetters).join(', ') || 'Ninguna'

if (game.hidden.join('') === word) {
  const chatUser   = getChatUser(chatId, m.sender)
  const globalUser = getUser(m.sender)

  updateChatUser(chatId, m.sender, 'coins', (chatUser.coins || 0) + 1000)
  updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
  updateUser(m.sender, 'exp', (globalUser.exp || 0) + 500)

  const uAfter     = getChatUser(chatId, m.sender)
  const uAfterGlob = getUser(m.sender)
  clearTimeout(game.timeout)
  delete games[chatId]
  await sock.reply(
    chatId,
    `➪ *¡Ganaste!*\n\n> La palabra era: *${word}*\n> Recompensa: *500 exp* y *1000 ${monedas}*\n> Total: ${uAfterGlob.exp} exp, ${uAfter.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`,
    m, m.rcanal
  )
  return
}

if (game.attemptsLeft === 0) {
  const chatUser   = getChatUser(chatId, m.sender)
  const globalUser = getUser(m.sender)

  updateChatUser(chatId, m.sender, 'coins', Math.max(0, (chatUser.coins || 0) - PENALTY_CHOCOLATES))
  updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
  updateUser(m.sender, 'exp', Math.max(0, (globalUser.exp || 0) - PENALTY_EXP))

  const uAfter     = getChatUser(chatId, m.sender)
  const uAfterGlob = getUser(m.sender)
  clearTimeout(game.timeout)
  delete games[chatId]
  await sock.reply(
    chatId,
    `➪ *Perdiste*\n\n> La palabra era: *${word}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${uAfterGlob.exp} exp, ${uAfter.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n${hangmanArt[6]}`,
    m, m.rcanal
  )
  return
}

      const info = `➪ *Juego del Ahorcado*\n\n> Palabra: ${hiddenWord}\n> Intentos restantes: ${game.attemptsLeft}\n> Letras usadas: ${usedLetters}\n${hangmanArt[6 - game.attemptsLeft]}\n\n✧ Responde con una letra o palabra.`
      const sentMsg = await sock.reply(chatId, info, m)
      game.messageId = sentMsg.key.id

    } else {
      await sock.reply(chatId, `✧ Envía una sola letra o la palabra completa de ${word.length} letras.`, m,m.rcanal)
    }

  } catch (e) {
    console.error('Error in hangman before handler:', e)
    await sock.reply(chatId, `✎ Ocurrió un error inesperado: ${e.message}.`, m)
    if (games[chatId]) {
      clearTimeout(games[chatId].timeout)
      delete games[chatId]
    }
  }
},
  run: async ({ sock, m, usedPrefix, command, text }) => {
    try {
      const chatId = m.chat
      const botId  = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const monedas = getSettings(botId).currency

      const chat = getChat(chatId)

      if (chat.adminonly)
        return sock.reply(m.chat,
          `❒ Para acceder a los comandos de *Economía* en este grupo, es necesario desactivar el modo *solo administradores*.\n\n> Un *administrador* puede realizarlo con:\n› *${usedPrefix}adminonly disable*`, m, m.rcanal 
        )
      if (!chat.rpg)
        return sock.reply(m.chat,
          `❒ Este grupo tiene los comandos de *Economía* en modo pausa.\n\nUn *administrador* puede activarlo con:\n› *${usedPrefix}economia enable*`
        )

      if (text?.toLowerCase() === 'cancel' && games[chatId]) {
        clearTimeout(games[chatId].timeout)
        const word = games[chatId].word
        updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
        delete games[chatId]
        return sock.reply(chatId, `✧ Juego cancelado. La palabra era: *${word}*\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`, m, m.rcanal)
      }

      if (games[chatId])
        return sock.reply(m.chat,`✧ Ya hay un juego del ahorcado activo en este grupo. Usa *${usedPrefix}${command} cancel* para cancelarlo.`,m,m.rcanal)

      const user = getChatUser(chatId, m.sender)
      if (!user) return sock.reply(m.chat,`❌ No estás registrado en el bot.`,m,m.rcanal)

      const remaining = (user.ahorcadoCooldown || 0) - Date.now()
      if (remaining > 0)
        return sock.reply(m.chat,`✿ Debes esperar *${msToTime(remaining)}* para jugar de nuevo.`,m,m.rcanal)

      const word        = words[Math.floor(Math.random() * words.length)]
      const maxAttempts = 6

      games[chatId] = {
        word,
        hidden: Array(word.length).fill('_'),
        attemptsLeft: maxAttempts,
        guessedLetters: new Set(),
        messageId: null,
        player: m.sender,
        timeout: null
      }

      const revealIdx    = Math.floor(Math.random() * word.length)
      const revealLetter = word[revealIdx]
      for (let i = 0; i < word.length; i++) {
        if (word[i] === revealLetter) games[chatId].hidden[i] = revealLetter
      }
      games[chatId].guessedLetters.add(revealLetter)

 games[chatId].timeout = setTimeout(async () => {
  if (games[chatId]) {
    const w        = games[chatId].word
    const chatUser   = getChatUser(chatId, m.sender)
    const globalUser = getUser(m.sender)

    updateChatUser(chatId, m.sender, 'coins', Math.max(0, (chatUser.coins || 0) - PENALTY_CHOCOLATES))
    updateChatUser(chatId, m.sender, 'ahorcadoCooldown', Date.now() + COOLDOWN)
    updateUser(m.sender, 'exp', Math.max(0, (globalUser.exp || 0) - PENALTY_EXP))

    const uAfter     = getChatUser(chatId, m.sender)
    const uAfterGlob = getUser(m.sender)
    delete games[chatId]
    await sock.reply(
      chatId,
      `✧ ¡Tiempo agotado! La palabra era: *${w}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${uAfterGlob.exp} exp, ${uAfter.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`,
      m, m.rcanal
    )
  }
}, TIME_LIMIT)

      const hiddenWord = games[chatId].hidden.join(' ')
      const info =
        `➪ *Juego del Ahorcado*\n\n` +
        `> Palabra: ${hiddenWord}\n` +
        `> Intentos restantes: ${maxAttempts}\n` +
        `> Letras usadas: ${revealLetter.toUpperCase()}\n` +
        `${hangmanArt[0]}\n\n` +
        `✧ Responde a este mensaje con una letra o la palabra completa. ¡Tienes 5 minutos para ganar *500 exp* y *1000 ${monedas}*! ¡Perder te costará *${PENALTY_EXP} exp* y *${PENALTY_CHOCOLATES} ${monedas}*!`

      const sentMsg = await sock.reply(chatId, info, m)
      games[chatId].messageId = sentMsg.key.id

    } catch (e) {
      console.error('Error in hangman handler:', e)
      await m.reply(`✎ Ocurrió un error inesperado: ${e.message}.`)
      if (games[m.chat]) {
        clearTimeout(games[m.chat].timeout)
        delete games[m.chat]
      }
    }
  }
}