// Powered By >> OfcKing

const frases = [
  "♻️♻️♻️",
  "🙌🙌🙌"
];

let ultimaFrase = '';

function enviarFrase() {
  let fraseAleatoria;
  do {
    fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
  } while (fraseAleatoria === ultimaFrase);

  ultimaFrase = fraseAleatoria;
    conn.reply(idchannel, `🚩 ${fraseAleatoria}`, null, fake);
}

// Enviar frase cada minuto
setInterval(enviarFrase, 60000);