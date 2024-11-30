// Powered By >> OfcKing

const frases = [
  "Hola",
  "78"
];

let ultimaFraseIndex = -1;

function enviarFrase() {
  let nuevaFraseIndex;
  do {
    nuevaFraseIndex = Math.floor(Math.random() * frases.length);
  } while (nuevaFraseIndex === ultimaFraseIndex);

  ultimaFraseIndex = nuevaFraseIndex;
  const fraseAleatoria = frases[nuevaFraseIndex];
  console.log(`🚩 ${fraseAleatoria}`); // Simula el envío del mensaje en la consola
}

// Enviar frase cada minuto (60000 ms)
setInterval(enviarFrase, 60000);