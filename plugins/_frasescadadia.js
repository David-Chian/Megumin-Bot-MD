// Powered By >> OfcKing

import fs from "fs";

let frases = [];
let frasesEnviadas = [];

fs.readFile('./src/FRASE/frases.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo JSON:', err);
    return;
  }
  const jsonData = JSON.parse(data);
  frases = jsonData.frasesMotivadoras;
});

function enviarFrase(conn, idCreator) {
  if (frases.length === 0) {
    conn.sendMessage(idCreator, { text: "No hay más frases disponibles. Por favor, agrega más frases motivadoras." });
    return;
  }

  if (frasesEnviadas.length === frases.length) {
    frasesEnviadas = []; // Reiniciar las frases enviadas cuando todas hayan sido usadas
  }

  let fraseAleatoriaIndex;
  do {
    fraseAleatoriaIndex = Math.floor(Math.random() * frases.length);
  } while (frasesEnviadas.includes(fraseAleatoriaIndex));

  frasesEnviadas.push(fraseAleatoriaIndex);

  const fraseAleatoria = frases[fraseAleatoriaIndex];
    conn.sendMessage(idCreator, { text: `👏 ${fraseAleatoria}` });
}

const conn = {
  sendMessage: (chatId, message) => {
    console.log(`Mensaje enviado a ${chatId}: ${message.text}`);
  }
};

const idCreator = '573012482597@s.whatsapp.net';

// Enviar frase cada minuto (60000 ms)
setInterval(() => enviarFrase(conn, idCreator), 60000);