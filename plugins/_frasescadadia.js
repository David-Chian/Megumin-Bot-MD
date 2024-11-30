// Powered By >> OfcKing

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// import { WAConnection } from '@adiwajshing/baileys';
const conn = new WAConnection();

const frases = [
  "¡Sigue adelante! Cada paso cuenta.",
  "¡Eres increíble! No te detengas.",
  "¡Confía en ti mismo! El éxito está a la vuelta de la esquina.",
  "¡No te rindas! Los grandes logros requieren tiempo.",
  "¡Tu esfuerzo vale la pena! Sigue así."
];

function enviarFrase() {
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
  conn.sendMessage(idchannel, `🚩 ${fraseAleatoria}`, MessageType.text);
}

setInterval(enviarFrase, 60000);  // 60000 ms = 1 minuto