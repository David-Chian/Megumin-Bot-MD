let users = {}

export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'rpg',
  run: async ({client, m, command, text}) => {
  if (globalThis.db.data.chats[m.chat].adminonly)
    return m.reply(`❒ Para acceder a los comandos de *Economía* en este grupo, es necesario desactivar el modo *solo administradores*. \n\n> Un *administrador* puede hacerlo con:\n› *${prefa}adminonly disable*`)

  if (!globalThis.db.data.chats[m.chat].rpg)
    return m.reply(`❒ Este grupo tiene los comandos de *Economía* en pausa.\n\nUn *administrador* puede activarlos con:\n› *${prefa}economia enable*`)

let user = globalThis.db.data.chats[m.chat].users[m.sender]
  if (!user.coinfCooldown) user.coinfCooldown = 0;
  let remainingTime = user.coinfCooldown - Date.now();

  if (remainingTime > 0) {
    return m.reply(`✿ Debes esperar *${msToTime(remainingTime)}* antes de intentar nuevamente.`);
  }
  let [cantidad, eleccion] = text.split(' ')
    let botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
  let botSettings = globalThis.db.data.settings[botId]
  let monedas = botSettings.currency

  if (!eleccion || !cantidad)
    return m.reply(`✿ Elige una opción ( *cara o cruz* ) y la cantidad a apostar.\n\n\`» Ejemplo:\`\n> *${prefa + command}* 2000 cara`)

  eleccion = eleccion.toLowerCase()
  cantidad = parseInt(cantidad)

  if (eleccion !== 'cara' && eleccion !== 'cruz')
    return m.reply(`ꕥ Elección no válida. Por favor, elige *cara* o *cruz*.\nEjemplo: *${prefa + command} 200 cruz*`)

  if (isNaN(cantidad) || cantidad <= 199)
    return m.reply(`ꕥ La apuesta mínima es de *200 ${monedas}*.\nEjemplo: *${prefa + command} 200 cara*`)
if (isNaN(cantidad) || cantidad >= 5001)
    return m.reply(`ꕥ La apuesta máxima es de *5000 ${monedas}*.\nEjemplo: *${prefa + command} 5000 cara*`)

  if (!user || user.coins === undefined) user.coins = 0

  if (user.coins < cantidad)
    return m.reply(`ꕥ No tienes suficientes *${monedas}* para apostar.`)

  let azar = Math.random()
    user.coinfCooldown = Date.now() + 10 * 60000; // 10 minutos de espera
  let resultado

  if (azar < 0.1) resultado = 'perdido'
  else resultado = azar < 0.55 ? 'cara' : 'cruz'

  let cantidadFormatted = cantidad.toLocaleString()
  let mensaje = `🎰 *Lanzando la moneda...*\n\n✿ La moneda ha caído en `

  if (resultado === eleccion) {
    user.coins += cantidad
    mensaje += `*${resultado.toUpperCase()}* 🪙\n\n✨ ¡Has ganado *¥${cantidadFormatted} ${monedas}*!`
  } else if (resultado === 'perdido') {
    let perdida = Math.floor(cantidad * 0.5)
    user.coins -= perdida
    mensaje += `*de canto* 😵‍💫\n\n💸 ¡La moneda se perdió y perdiste la mitad de tu apuesta! (*¥${perdida.toLocaleString()} ${monedas}*)`
  } else {
    user.coins -= cantidad
    mensaje += `*${resultado.toUpperCase()}* 💀\n\n❌ Has perdido *¥${cantidadFormatted} ${monedas}*.`
  }

  await client.reply(m.chat, mensaje, m)
}}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60);

  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  if (minutes === '00') {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
}