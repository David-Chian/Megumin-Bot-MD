// Powered By >> OfcKing

const frases = [
  "Peueba1",
  "Prueba2"
];

function enviarFrase(conn) {
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
  conn.sendMessage(idchannel, { text: `🚩 ${fraseAleatoria}` });
}

// Simulación de la conexión del bot
const conn = {
  sendMessage: (chatId, message) => {
    console.log(`Mensaje enviado a ${chatId}: ${message.text}`);
  }
};

// Enviar frase cada minuto (60000 ms)
setInterval(() => enviarFrase(conn), 60000);