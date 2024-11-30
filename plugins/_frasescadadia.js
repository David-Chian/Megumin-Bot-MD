// Powered By >> OfcKing

const frases = [
  "Peueba1",
  "Prueba2"
];

function enviarFrase() {
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
  conn.reply(idchannel, `🚩 ${fraseAleatoria}`, null, fake);
}

// Enviar frase cada minuto (60000 ms)
setInterval(enviarFrase, 60000);