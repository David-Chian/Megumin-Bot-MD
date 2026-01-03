import fs from 'fs';

global.math = global.math || {};

const limits = {
  facil: 10,
  medio: 50,
  dificil: 90,
  imposible: 100,
  imposible2: 160
};

const generateRandomNumber = (max) => Math.floor(Math.random() * max) + 1;
const getOperation = () => ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];

const generarProblema = (dificultad) => {
  const maxLimit = limits[dificultad] || 30;
  const num1 = generateRandomNumber(maxLimit);
  const num2 = generateRandomNumber(maxLimit);
  const operador = getOperation();
  const resultado = eval(`${num1} ${operador === '×' ? '*' : operador} ${num2}`);
  return {
    problema: `${num1} ${operador} ${num2}`,
    resultado: operador !== '÷' ? resultado : resultado.toFixed(2)
  };
};

async function run({client, m, args, command}) {
  const chatId = m.chat;
  const db = global.db.data.chats[chatId];
  const user = global.db.data.users[m.sender]
  const juego = global.math[chatId];
    if (db.adminonly || !db.rpg)
      return m.reply(`✐ Estos comandos estan desactivados en este grupo.`)

  if (command === 'responder') {
    if (!juego?.juegoActivo)
      return // client.reply(chatId, '「✎」No hay ningún juego activo. Usa *math <dificultad>* para comenzar uno.', m);

    const quotedId = m.quoted?.key?.id || m.quoted?.id || m.quoted?.stanzaId;
    if (quotedId !== juego.problemMessageId)
      return // client.reply(chatId, '「✎」Debes responder citando el mensaje del problema matemático.', m);

    const respuestaUsuario = args[0]?.toLowerCase();
    if (!respuestaUsuario)
      return client.reply(chatId, '「✎」Debes escribir tu respuesta. Ejemplo: */responder 42*', m);

    const respuestaCorrecta = juego.respuesta;
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const primaryBotId = db.primaryBot;

    if (!primaryBotId || primaryBotId === botId) {
      if (respuestaUsuario === respuestaCorrecta) {
        const expaleatorio = Math.floor(Math.random() * 50) + 10;
        user.exp = expaleatorio;

        clearTimeout(juego.tiempoLimite);
        delete global.math[chatId];

        return client.reply(chatId, `「❀」Respuesta correcta.\n> *Ganaste ›* ${expaleatorio} Exp`, m);
      } else {
        juego.intentos += 1;
        if (juego.intentos >= 3) {
          clearTimeout(juego.tiempoLimite);
          delete global.math[chatId];
          return client.reply(chatId, '「✎」Te quedaste sin intentos. Suerte a la próxima.', m);
        } else {
          const intentosRestantes = 3 - juego.intentos;
          return client.reply(chatId, `「✎」Respuesta incorrecta, te quedan ${intentosRestantes} intentos.`, m);
        }
      }
    }
    return;
  }

  if (command === 'math') {
    if (juego?.juegoActivo)
      return client.reply(chatId, 'ꕥ Ya hay un juego activo. Espera a que termine.', m);

    const dificultad = args[0]?.toLowerCase();
    if (!limits[dificultad])
      return client.reply(chatId, '「✎」Especifica una dificultad válida: *facil, medio, dificil, imposible, imposible2*', m);

    const { problema, resultado } = generarProblema(dificultad);
    const problemMessage = await client.reply(chatId, `「✩」Tienes 1 minuto para resolver:\n\n> ✩ *${problema}*\n\n_✐ Usa » *${prefa}responder* para responder!_`, m);

    globalThis.math[chatId] = {
      juegoActivo: true,
      problema,
      respuesta: resultado.toString(),
      intentos: 0,
      timeout: Date.now() + 60000,
      problemMessageId: problemMessage.key?.id,
      tiempoLimite: setTimeout(() => {
        if (global.math[chatId]?.juegoActivo) {
          delete globalThis.math[chatId];
          client.reply(chatId, '「✿」Tiempo agotado. El juego ha terminado.', m);
        }
      }, 60000)
    };
  }
}

export default {
  command: ['math', 'matematicas', 'responder'],
  category: 'rpg',
  run
};