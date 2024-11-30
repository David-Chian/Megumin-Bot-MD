// Powered By >> OfcKing

const frases = [
  "",
  ""
];

function enviarFrase() {
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
//  conn.reply(idchannel, `${fraseAleatoria}`, null, fake);
}

// Enviar frase cada minuto (60000 ms)
setInterval(enviarFrase, 60000);