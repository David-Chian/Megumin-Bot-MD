// Powered By >> OfcKing

export function before(m, { conn }) {
  const frases = [
    "¡Sigue adelante! Cada paso cuenta.",
    "¡Eres increíble! No te detengas.",
    "¡Confía en ti mismo! El éxito está a la vuelta de la esquina.",
    "¡No te rindas! Los grandes logros requieren tiempo.",
    "¡Tu esfuerzo vale la pena! Sigue así."
  ]

  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)]

  // Enviar la frase después de 1 minuto
  setTimeout(() => {
    conn.reply(idchannel, `🚩 ${fraseAleatoria}`, null, fake)
  }, 60000)  // 60000 ms = 1 minuto
}