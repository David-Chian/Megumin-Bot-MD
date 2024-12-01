// Powered By >> OfcKing

import fs from "fs";

let frases = [];
let frasesEnviadas = [];
let bot = global.db.data.settings[conn.user.jid];

fs.readFile('./src/FRASE/frases.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo JSON:', err);
    return;
  }
  const jsonData = JSON.parse(data);
  frases = jsonData.frasesMotivadoras;
});

if (bot.frases) { 
function enviarFrase() {
  if (frases.length === 0) {
    conn.reply(idchannel, '🍄 No hay frases disponibles para enviar', null, fake);
    return;
  }}

  if (bot.frases) { 
  if (frasesEnviadas.length === frases.length) {
    conn.reply(idchannel, '✨️ Todas las frases ya fueron enviadas, reiniciaremos la raíz para que se vuelven a enviar las frases antiguas!', null, fake);
      frasesEnviadas = []; 
    return;
  }}

  if (bot.frases) { 
  let fraseAleatoriaIndex;
  do {
    fraseAleatoriaIndex = Math.floor(Math.random() * frases.length);
  } while (frasesEnviadas.includes(fraseAleatoriaIndex));

  frasesEnviadas.push(fraseAleatoriaIndex);

  const fraseAleatoria = frases[fraseAleatoriaIndex];
  conn.reply(idchannel, `${fraseAleatoria}`, null, fake);
}}

// Enviar frase cada 1 minuto
setInterval(enviarFrase, 60000);