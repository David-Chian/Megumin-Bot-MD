const words = [
  'estrella', 'ventana', 'puerta', 'computadora', 'televisor', 'desenlace', 'animacion', 'instruccion', 'contraseña', 'bicampeonato', 'melancolia', 'desconocido', 'interrogante', 'subterraneo', 'tratamiento', 'plan', 'hielo', 'helado', 'reencarnacion', 'resultado', 'caricatura', 'desintegrado', 'graduacion', 'rechazo', 'murmullo', 'escalofrio', 'condor',
  'universidad', 'biblioteca', 'montaña', 'teléfono', 'elefante', 'hipopotamo', 'murcielago', 'arquitectura', 'electricidad', 'fotografia', 'aguacate', 'contenedor', 'tenedor', 'paralelepipedo', 'circunferencia', 'inverosimil', 'yacimiento', 'jengibre', 'bumeran', 'metafisica', 'jugabilidad', 'olvidar', 'hentai', 'maltrato', 'alquimia', 'silueta', 'tridente',
  'bicicleta', 'sombrero', 'paraguas', 'manzana', 'naranja', 'linterna', 'brujula', 'teclado', 'mochila', 'espejo', 'martillo', 'pincel', 'reloj', 'museo', 'aeropuerto', 'teatro', 'catedral', 'prision', 'torre', 'elegria', 'tristeza', 'sorpresa', 'excitacion', 'enojo', 'calma', 'ansiedad', 'degenerada', 'inodoro', 'nintendo', 'twitter', 'quimera', 'cosmico',
  'castillo', 'jirafa', 'serpiente', 'tortuga', 'chocolate', 'youtube', 'cama', 'diccionario', 'kilometro', 'valquiria', 'negro', 'barcelona', 'singapur', 'vasectomia', 'relampago', 'repampanos', 'oreja', 'vocero', 'washington', 'anomalia', 'japon', 'mondongo', 'volcan', 'arrecife', 'lechuza', 'cangrejo', 'cactus', 'pinguino', 'delfin', 'laberinto', 'pantano',
  'galaxia', 'cometa', 'ballena', 'tiburón', 'hospital', 'mercado','megumin','diamond','servicio','decadencia','administracion','momdongo','peliculas','hambre','ahorcado','tuereunloco','vanacaer','perderan','puto','guallaba','diamantes','conestotunovasaganarwajahaha', 'pinga'
];

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
  /|\\   |
        |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|\\   |
  /     |
        |
  =========`,
  `
   ------
   |    |
   O    |
  /|\\   |
  / \\   |
        |
  =========`
];

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60);
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  if (minutes === '00') {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
}

const COOLDOWN = 10 * 60 * 1000;
const PENALTY_EXP = 100;
const PENALTY_CHOCOLATES = 200;

export async function before(m, { client }) {
if (!global.games) global.games = {};

  const games = global.games;
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const chat = global.db.data.chats[m.chat];
  chat.primaryBot = chat.primaryBot || null
  const primaryBotId = chat?.primaryBot;

  if (!primaryBotId || primaryBotId === botId) {
    if (!m.quoted || !games[m.chat] || m.quoted.id !== games[m.chat].messageId || m.sender !== games[m.chat].player) {
      return;
    }

    try {
      const game = games[m.chat];
      const guess = m.text.trim().toLowerCase();
      const word = game.word;
      const monedas = global.db.data.settings[botId]?.currency
      let user = global.db.data.chats[m.chat].users[m.sender];

      if (!guess.match(/^[a-z]+$/)) {
        await client.reply(m.chat, `✧ Por favor, envía solo letras o una palabra válida (sin números ni caracteres especiales).`, m);
        return;
      }

      if (guess.length === word.length) {
        if (guess === word) {
          user.exp += 500;
          user.coins += 1000;
          user.ahorcadoCooldown = Date.now() + COOLDOWN;
          const info = `➪ *¡Ganaste!*\n\n> La palabra era: *${word}*\n> Recompensa: *500 exp* y *1000 ${monedas}*\n> Total: ${user.exp} exp, ${user.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n\n${dev}`;
          clearTimeout(game.timeout);
          delete games[m.chat];
          await client.reply(m.chat, info, m);
        } else {
          game.attemptsLeft -= 1;
          const hiddenWord = game.hidden.join(' ');
          const usedLetters = Array.from(game.guessedLetters).join(', ') || 'Ninguna';
          let info;
          if (game.attemptsLeft === 0) {
            user.exp = Math.max(0, user.exp - PENALTY_EXP);
            user.coins = Math.max(0, user.coins - PENALTY_CHOCOLATES);
            user.ahorcadoCooldown = Date.now() + COOLDOWN;
            info = `➪ *Perdiste*\n\n> La palabra era: *${word}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${user.exp} exp, ${user.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n${hangmanArt[6]}`;
            clearTimeout(game.timeout);
            delete games[m.chat];
          } else {
            info = `➪ *Palabra incorrecta*\n\n> Palabra: ${hiddenWord}\n> Intentos restantes: ${game.attemptsLeft}\n> Letras usadas: ${usedLetters}\n${hangmanArt[6 - game.attemptsLeft]}\n\n✧ Responde con una letra o palabra.`;
          }
          const sentMsg = await client.reply(m.chat, info, m);
          game.messageId = sentMsg.key.id;
        }
        return;
      }

      if (guess.length === 1) {
        if (game.guessedLetters.has(guess)) {
          await client.reply(m.chat, `✧ La letra *${guess}* ya fue usada. Intenta otra.`, m);
          return;
        }

        game.guessedLetters.add(guess);
        let correct = false;
        for (let i = 0; i < word.length; i++) {
          if (word[i] === guess) {
            game.hidden[i] = guess;
            correct = true;
          }
        }

        if (!correct) {
          game.attemptsLeft -= 1;
        }

        const hiddenWord = game.hidden.join(' ');
        const usedLetters = Array.from(game.guessedLetters).join(', ') || 'Ninguna';

        if (game.hidden.join('') === word) {
          user.exp += 500;
          user.coins += 1000;
          user.ahorcadoCooldown = Date.now() + COOLDOWN;
          const info = `➪ *¡Ganaste!*\n\n> La palabra era: *${word}*\n> Recompensa: *500 exp* y *1000 ${monedas}*\n> Total: ${user.exp} exp, ${user.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n\n${dev}`;
          clearTimeout(game.timeout);
          delete games[m.chat];
          await client.reply(m.chat, info, m);
          return;
        }

        if (game.attemptsLeft === 0) {
          user.exp = Math.max(0, user.exp - PENALTY_EXP);
          user.coins = Math.max(0, user.coins - PENALTY_CHOCOLATES);
          user.ahorcadoCooldown = Date.now() + COOLDOWN;
          const info = `➪ *Perdiste*\n\n> La palabra era: *${word}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${user.exp} exp, ${user.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.\n${hangmanArt[6]}`;
          clearTimeout(game.timeout);
          delete games[m.chat];
          await client.reply(m.chat, info, m);
          return;
        }

        const info = `➪ *Juego del Ahorcado*\n\n> Palabra: ${hiddenWord}\n> Intentos restantes: ${game.attemptsLeft}\n> Letras usadas: ${usedLetters}\n${hangmanArt[6 - game.attemptsLeft]}\n\n✧ Responde con una letra o palabra.`;
        const sentMsg = await client.reply(m.chat, info, m);
        game.messageId = sentMsg.key.id;
      } else {
        await client.reply(m.chat, `✧ Envía una sola letra o la palabra completa de ${word.length} letras.`, m);
      }
    } catch (e) {
      console.error('Error in hangman before handler:', e);
      await client.reply(m.chat, `✎ Ocurrió un error inesperado: ${e.message}.`, m);
      if (games[m.chat]) {
        clearTimeout(games[m.chat].timeout);
        delete games[m.chat];
      }
    }
  }
}