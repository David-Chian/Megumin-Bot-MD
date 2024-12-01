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

function enviarFrase() {
  if (frases.length === 0) {
    conn.reply(idchannel, '👏 No hay frases disponibles, por enviar.', null, fake);
    return;
  }

  if (frasesEnviadas.length === frases.length) {
    conn.reply(idchannel, '👏 Todas las frases han sido enviadas', null, fake);
    frasesEnviadas = []; // Reiniciar las frases enviadas
    return;
  }

  let fraseAleatoriaIndex;
  do {
    fraseAleatoriaIndex = Math.floor(Math.random() * frases.length);
  } while (frasesEnviadas.includes(fraseAleatoriaIndex));

  frasesEnviadas.push(fraseAleatoriaIndex);

  const fraseAleatoria = frases[fraseAleatoriaIndex];
  conn.reply(idchannel, `${fraseAleatoria}`, null, fake);
}

// Enviar frase cada minuto (60000 ms)
setInterval(enviarFrase, 60000);