const TIEMPO_LIMITE_MS = 5 * 60 * 1000
const COOLDOWN_MS      = 10 * 60 * 1000

function msToTime(ms: number) {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

export default {
  command: ['duelo', 'aceptarduelo', 'rechazarduelo', 'cancelarduelo'],
  category: 'rpg',

  run: async ({ sock, m, args, command, usedPrefix }: any) => {
    const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatId  = m.chat
    const sender  = m.sender
    const monedas = getSettings(botId)?.currency || 'Monedas 🪙'

    const chat = getChat(chatId)
    if (chat.adminonly || !chat.rpg)
      return m.reply(mess.comandooff)

    sock.duelos = sock.duelos || {}

    const userA = getChatUser(chatId, sender)

    if (command === 'aceptarduelo') {
      const duelo = Object.values(sock.duelos).find(
        (d: any) => d.chatId === chatId && d.retado === sender && d.state === 'WAITING'
      ) as any
      if (!duelo) return m.reply(`❌ No tienes ningún reto pendiente.`)

      if (Date.now() > duelo.expira) {
        delete sock.duelos[duelo.id]
        return m.reply(`❌ El reto ya expiró.`)
      }

      clearTimeout(duelo.timeout)

      const { retador, monto } = duelo
      const userRetador = getChatUser(chatId, retador)

      if ((userA.coins || 0) < monto)
        return m.reply(`❌ Ya no tienes suficiente dinero para el duelo.`)

      if ((userRetador?.coins || 0) < monto) {
        delete sock.duelos[duelo.id]
        return sock.sendMessage(chatId, {
          text: `❌ *@${retador.split('@')[0]}* ya no tiene suficiente dinero. Duelo cancelado.`,
          mentions: [retador]
        })
      }

      delete sock.duelos[duelo.id]

      const retadorGana = Math.random() < 0.5
      const ganador     = retadorGana ? retador : sender
      const perdedor    = retadorGana ? sender  : retador
      const premio      = monto * 2

      const userGanador  = getChatUser(chatId, ganador)
      const userPerdedor = getChatUser(chatId, perdedor)

      updateChatUser(chatId, ganador,  'coins', (userGanador.coins  || 0) + premio - monto)
      updateChatUser(chatId, perdedor, 'coins', (userPerdedor.coins || 0) - monto)

      return sock.sendMessage(chatId, {
        text:
          `⚔️ *RESULTADO DEL DUELO*\n\n` +
          `🏆 *¡@${ganador.split('@')[0]} gana el duelo!*\n` +
          `💰 Premio: *${premio.toLocaleString()} ${monedas}*\n` +
          `💸 @${perdedor.split('@')[0]} perdió *${monto.toLocaleString()} ${monedas}*`,
        mentions: [retador, sender]
      })
    }

    if (command === 'rechazarduelo') {
      const duelo = Object.values(sock.duelos).find(
        (d: any) => d.chatId === chatId && d.retado === sender && d.state === 'WAITING'
      ) as any
      if (!duelo) return m.reply(`❌ No tienes ningún reto pendiente.`)

      clearTimeout(duelo.timeout)
      const retador = duelo.retador
      delete sock.duelos[duelo.id]

      return sock.sendMessage(chatId, {
        text: `🏳️ *@${sender.split('@')[0]}* rechazó el duelo de *@${retador.split('@')[0]}*.`,
        mentions: [sender, retador]
      })
    }

    if (command === 'cancelarduelo') {
      const duelo = Object.values(sock.duelos).find(
        (d: any) => d.chatId === chatId && d.retador === sender && d.state === 'WAITING'
      ) as any
      if (!duelo) return m.reply(`❌ No tienes ningún reto activo para cancelar.`)

      clearTimeout(duelo.timeout)
      const retado = duelo.retado
      delete sock.duelos[duelo.id]

      return sock.sendMessage(chatId, {
        text: `🚫 *@${sender.split('@')[0]}* canceló el reto a *@${retado.split('@')[0]}*.`,
        mentions: [sender, retado]
      })
    }

    if (command === 'duelo') {
      const cooldownRestante = (userA.dueloCooldown || 0) - Date.now()
      if (cooldownRestante > 0)
        return m.reply(`⏳ Debes esperar *${msToTime(cooldownRestante)}* para retar de nuevo.`)

      let opponent = m.mentionedJid?.[0] || m.quoted?.sender || null
      if (!opponent || opponent === sender) opponent = botId

      const monto = parseInt(args.find((a: string) => /^\d+$/.test(a)))
      if (!monto || monto < 100)
        return m.reply(
          `❌ Debes indicar una apuesta válida.\n` +
          `*Ejemplo:* \`${usedPrefix}duelo @usuario 5000\`\n` +
          `*Contra el bot:* \`${usedPrefix}duelo 5000\``
        )
      if (monto>10001)
        return m.reply(
          `❌ La apuesta máxima permitida es de 10000.`
          )

      if ((userA.coins || 0) < monto)
        return m.reply(
          `❌ No tienes suficiente dinero.\n` +
          `Necesitas: *${monto.toLocaleString()} ${monedas}*\n` +
          `Tienes: *${(userA.coins || 0).toLocaleString()} ${monedas}*`
        )

      const ocupado = Object.values(sock.duelos).find(
        (d: any) => d.chatId === chatId && (d.retador === sender || d.retado === sender)
      )
      if (ocupado) return m.reply(`❌ Ya tienes un duelo pendiente en este grupo.`)

      updateChatUser(chatId, sender, 'dueloCooldown', Date.now() + COOLDOWN_MS)

      if (opponent === botId) {
        const jugadorGana = Math.random() < 0.5
        const nuevoSaldo  = jugadorGana
          ? (userA.coins || 0) + monto
          : (userA.coins || 0) - monto

        updateChatUser(chatId, sender, 'coins', nuevoSaldo)

        return sock.sendMessage(chatId, {
          text:
            `⚔️ *DUELO CONTRA EL BOT*\n\n` +
            (jugadorGana
              ? `🏆 *¡Ganaste!* Te llevas *${(monto * 2).toLocaleString()} ${monedas}*`
              : `💀 *¡Perdiste!* El bot se lleva *${monto.toLocaleString()} ${monedas}*`),
          mentions: [sender]
        }, { quoted: m })
      }

      const userB = getChatUser(chatId, opponent)

      if ((userB?.coins || 0) < monto)
        return sock.sendMessage(chatId, {
          text:
            `❌ *@${opponent.split('@')[0]}* no tiene suficiente dinero.\n` +
            `Apuesta: *${monto.toLocaleString()} ${monedas}*\n` +
            `Su saldo: *${(userB?.coins || 0).toLocaleString()} ${monedas}*`,
          mentions: [opponent]
        })

      const ocupadoB = Object.values(sock.duelos).find(
        (d: any) => d.chatId === chatId && (d.retador === opponent || d.retado === opponent)
      )
      if (ocupadoB) return m.reply(`❌ Ese usuario ya tiene un duelo pendiente.`)

      const dueloId = `duelo-${Date.now()}`

      sock.duelos[dueloId] = {
        id: dueloId,
        chatId,
        retador: sender,
        retado:  opponent,
        monto,
        state:   'WAITING',
        expira:  Date.now() + TIEMPO_LIMITE_MS,
        timeout: setTimeout(() => {
          if (sock.duelos[dueloId]) {
            delete sock.duelos[dueloId]
            sock.sendMessage(chatId, {
              text: `⏰ El reto de @${sender.split('@')[0]} a @${opponent.split('@')[0]} expiró sin respuesta.`,
              mentions: [sender, opponent]
            })
          }
        }, TIEMPO_LIMITE_MS)
      }

      return sock.sendMessage(chatId, {
        text:
          `⚔️ *¡RETO DE DUELO!*\n\n` +
          `🗡️ *@${sender.split('@')[0]}* reta a *@${opponent.split('@')[0]}*\n` +
          `💰 Apuesta: *${monto.toLocaleString()} ${monedas}* cada uno\n` +
          `🏆 Premio total: *${(monto * 2).toLocaleString()} ${monedas}*\n\n` +
          `@${opponent.split('@')[0]}, tienes *5 minutos* para responder.\n\n` +
          `> *${usedPrefix}aceptarduelo* — Aceptar\n` +
          `> *${usedPrefix}rechazarduelo* — Rechazar`,
        mentions: [sender, opponent]
      }, { quoted: m })
    }
  }
}
