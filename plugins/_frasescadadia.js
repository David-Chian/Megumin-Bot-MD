// Powered By >> OfcKing

let frases = [];

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
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
  conn.reply(idchannel, `${fraseAleatoria}`, null, fake);
}

// Enviar frase cada minuto (60000 ms)
setInterval(enviarFrase, 60000);