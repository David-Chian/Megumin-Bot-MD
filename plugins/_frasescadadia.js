// Powered By >> OfcKing

const frases = [
  "¡Sigue adelante! Cada paso cuenta.",
  "¡Eres increíble! No te detengas.",
  "¡Confía en ti mismo! El éxito está a la vuelta de la esquina.",
  "¡No te rindas! Los grandes logros requieren tiempo.",
  "¡Tu esfuerzo vale la pena! Sigue así."
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