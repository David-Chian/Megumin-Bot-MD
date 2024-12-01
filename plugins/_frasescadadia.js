// Powered By >> OfcKing

import fs from "fs";

let frases = [];
let frasesEnviadas = [];

let isfrases = global.db.data.settings[this.user.jid].frases  
if (!isfrases) return
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
    conn.reply(idchannel, '🍄 No hay frases disponibles para enviar', null, fake);
    return;
  }
 
  if (frasesEnviadas.length === frases.length) {
    conn.reply(idchannel, '✨️ Todas las frases ya fueron enviadas, reiniciaremos la raíz para que se vuelven a enviar las frases antiguas!', null, fake);
      frasesEnviadas = []; 
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

// Enviar frase cada 1 minuto
setInterval(enviarFrase, 60000);