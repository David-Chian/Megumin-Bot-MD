function msToTime(duration: number) {
  let seconds: any = Math.floor((duration / 1000) % 60)
  let minutes: any = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'rpg',

  run: async ({ sock, m, command, text, usedPrefix }: any) => {
    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId)?.currency || 'Monedas'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    const user      = getChatUser(chatId, sender)
    const remaining = (user.coinfCooldown || 0) - Date.now()

    if (remaining > 0)
      return m.reply(`✿ Debes esperar *${msToTime(remaining)}* antes de intentar nuevamente.`)

    if (!text)
      return m.reply(
        `✿ Elige una opción ( *cara o cruz* ) y la cantidad a apostar.\n\n\`» Ejemplo:\`\n> *${usedPrefix + command}* 2000 cara`
      )

    const parts    = text.trim().split(' ')
    const cantidad = parseInt(parts[0])
    const eleccion = (parts[1] || '').toLowerCase()

    if (!eleccion || isNaN(cantidad))
      return m.reply(
        `✿ Elige una opción ( *cara o cruz* ) y la cantidad a apostar.\n\n\`» Ejemplo:\`\n> *${usedPrefix + command}* 2000 cara`
      )

    if (eleccion !== 'cara' && eleccion !== 'cruz')
      return m.reply(
        `ꕥ Elección no válida. Por favor, elige *cara* o *cruz*.\nEjemplo: *${usedPrefix + command} 200 cruz*`
      )

    if (cantidad < 200)
      return m.reply(`ꕥ La apuesta mínima es de *200 ${monedas}*.\nEjemplo: *${usedPrefix + command} 200 cara*`)

    if (cantidad > 5000)
      return m.reply(`ꕥ La apuesta máxima es de *5000 ${monedas}*.\nEjemplo: *${usedPrefix + command} 5000 cara*`)

    if ((user.coins || 0) < cantidad)
      return m.reply(`ꕥ No tienes suficientes *${monedas}* para apostar.`)

    updateChatUser(chatId, sender, 'coinfCooldown', Date.now() + 10 * 60000)

    const azar              = Math.random()
    const resultado         = azar < 0.1 ? 'perdido' : azar < 0.55 ? 'cara' : 'cruz'
    const cantidadFormatted = cantidad.toLocaleString()
    let nuevoSaldo          = user.coins || 0

    let mensaje = `🎰 *Lanzando la moneda...*\n\n✿ La moneda ha caído en `

    if (resultado === eleccion) {
      nuevoSaldo += cantidad
      mensaje += `*${resultado.toUpperCase()}* 🪙\n\n✨ ¡Has ganado *¥${cantidadFormatted} ${monedas}*!`
    } else if (resultado === 'perdido') {
      const perdida = Math.floor(cantidad * 0.5)
      nuevoSaldo   -= perdida
      mensaje      += `*de canto* 😵‍💫\n\n💸 ¡La moneda se perdió y perdiste la mitad de tu apuesta! (*¥${perdida.toLocaleString()} ${monedas}*)`
    } else {
      nuevoSaldo -= cantidad
      mensaje    += `*${resultado.toUpperCase()}* 💀\n\n❌ Has perdido *¥${cantidadFormatted} ${monedas}*.`
    }

    updateChatUser(chatId, sender, 'coins', nuevoSaldo)

    return m.reply(mensaje)
  }
}