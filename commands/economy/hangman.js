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

global.games = global.games || {};
const games = global.games;
const TIME_LIMIT = 5 * 60 * 1000;
const COOLDOWN = 10 * 60 * 1000;
const PENALTY_EXP = 100;
const PENALTY_CHOCOLATES = 200;

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

const handler = {
  command: ['ahorcado', 'hangman'],
  category: 'game',
  
    run: async ({client, m, prefa, command, text}) => {
  try {
    if (text.toLowerCase() === 'cancel' && games[m.chat]) {
      clearTimeout(games[m.chat].timeout);
      const word = games[m.chat].word;
      const user = global.db.data.chats[m.chat].users[m.sender];
      user.ahorcadoCooldown = Date.now() + COOLDOWN;
      delete games[m.chat];
      return await client.reply(m.chat, `✧ Juego cancelado. La palabra era: *${word}*\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`, m);
    }

    if (global.db.data.chats[m.chat].adminonly) {
      return m.reply(`❒ Para acceder a los comandos de *Economía* en este grupo, es necesario desactivar el modo *solo administradores*. \n\n> Un *administrador* puede realizar este cambio utilizando el comando › *${prefa}adminonly disable*`);
    }
    if (!global.db.data.chats[m.chat].rpg) {
      return m.reply(`❒ Este grupo tiene los comandos de *Economía* en modo pausa.\n\nPero la solución está en manos de un *administrador*, que puede activarlo usando:\n› *${prefa}economia enable*.`);
    }

    if (games[m.chat]) {
      return m.reply(`✧ Ya hay un juego del ahorcado activo en este grupo. ¡Termina el juego actual o espera! Usa *${prefa}${command} cancel* para cancelarlo.`);
    }

    if (!global.db.data.chats[m.chat].users[m.sender]) {
      global.db.data.chats[m.chat].users[m.sender] = { exp: 0, coins: 0, ahorcadoCooldown: 0 };
    }
    const user = global.db.data.chats[m.chat].users[m.sender];

    if (!user.ahorcadoCooldown) user.ahorcadoCooldown = 0;
    let remainingTime = user.ahorcadoCooldown - Date.now();
    if (remainingTime > 0) {
      return m.reply(`✿ Debes esperar *${msToTime(remainingTime)}* para jugar de nuevo.`);
    }

    const word = words[Math.floor(Math.random() * words.length)];
    const maxAttempts = 6;

    games[m.chat] = {
      word,
      hidden: Array(word.length).fill('_'),
      attemptsLeft: maxAttempts,
      guessedLetters: new Set(),
      messageId: null,
      player: m.sender,
      timeout: null
    };

    const randomIndex = Math.floor(Math.random() * word.length);
    const revealedLetter = word[randomIndex];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === revealedLetter) {
        games[m.chat].hidden[i] = revealedLetter;
      }
    }
    games[m.chat].guessedLetters.add(revealedLetter);

    const hiddenWord = games[m.chat].hidden.join(' ');
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    games[m.chat].timeout = setTimeout(async () => {
      if (games[m.chat]) {
        const word = games[m.chat].word;
        const monedas = global.db.data.settings[botId]?.currency
        user.exp = Math.max(0, user.exp - PENALTY_EXP);
        user.coins = Math.max(0, user.coins - PENALTY_CHOCOLATES);
        user.ahorcadoCooldown = Date.now() + COOLDOWN;
        delete games[m.chat];
        await client.reply(m.chat, `✧ ¡Tiempo agotado! La palabra era: *${word}*\n> Penalización: -${PENALTY_EXP} exp, -${PENALTY_CHOCOLATES} ${monedas}\n> Total: ${user.exp} exp, ${user.coins} ${monedas}\n> Debes esperar *${msToTime(COOLDOWN)}* para jugar de nuevo.`, m);
      }
    }, TIME_LIMIT);

    const monedas = global.db.data.settings[botId].currency
    const info = `➪ *Juego del Ahorcado*\n\n> Palabra: ${hiddenWord}\n> Intentos restantes: ${maxAttempts}\n> Letras usadas: ${revealedLetter.toUpperCase()}\n${hangmanArt[0]}\n\n✧ Responde a este mensaje con una letra o la palabra completa. ¡Tienes 5 minutos para ganar *500 exp* y *1000 ${monedas}*! ¡Perder te costará *${PENALTY_EXP} exp* y *${PENALTY_CHOCOLATES} ${monedas}*!`;

    const sentMsg = await client.reply(m.chat, info, m);
    games[m.chat].messageId = sentMsg.key.id;

  } catch (e) {
    console.error('Error in hangman handler:', e);
    await m.reply(`✎ Ocurrió un error inesperado: ${e.message}.`);
    if (games[m.chat]) {
      clearTimeout(games[m.chat].timeout);
      delete games[m.chat];
    }
  }
}
}

export default handler;