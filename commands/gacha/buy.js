function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes === 0
    ? `${seconds} segundo${seconds > 1 ? 's' : ''}`
    : `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export default {
  command: ['claim', 'buy', 'c'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = db.chats[chatId]
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency
    const user = chatConfig.users[userId]

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    if (!user.buyCooldown) user.buyCooldown = 0
    const remainingTime = user.buyCooldown - Date.now()
    if (remainingTime > 0)
      return m.reply(
        `ꕥ Debes esperar *${msToTime(remainingTime)}* para usar *"${m.command}"* nuevamente`,
      )

    if (!m.quoted) return m.reply(`✎ Responde a una waifu para reclamarla.`)

    // chatConfig.users ||= {}
   // chatConfig.personajesReservados ||= []

    const quotedMessage = m.quoted.body || m.quoted.text || ''
    const reservedCharacter = chatConfig.personajesReservados.find((p) =>
      quotedMessage.includes(p.name),
    )

    if (!reservedCharacter) {
      const claimedEntry = Object.entries(chatConfig.users).find(([_, u]) =>
        u.characters?.some((c) => quotedMessage.includes(c.name)),
      )
      if (claimedEntry) {
        const [claimerId, u] = claimedEntry
        const claimedChar = u.characters.find((c) => quotedMessage.includes(c.name))
        if (claimerId === userId) return m.reply(`✎ Tú ya has reclamado a *${claimedChar.name}*.`)
        const ownerName = db.users[claimerId]?.name || claimerId.split('@')[0]
        return m.reply(
          `✎ El personaje *${claimedChar.name}* ya ha sido reclamado por *${ownerName}*.`,
        )
      }
      return m.reply(`《✧》 No se pudo identificar ni reclamar el personaje.`)
    }

    const alreadyClaimed = Object.entries(chatConfig.users).find(([_, u]) =>
      u.characters?.some((c) => c.name === reservedCharacter.name),
    )
    if (alreadyClaimed) {
      const [claimerId] = alreadyClaimed
      if (claimerId === userId)
        return m.reply(`ꕥ Tú ya has reclamado a *${reservedCharacter.name}*.`)
      const ownerName = db.users[claimerId]?.name || claimerId.split('@')[0]
      return m.reply(
        `✎ El personaje *${reservedCharacter.name}* ya ha sido reclamado por *${ownerName}*.`,
      )
    }

    const now = Date.now()
    if (reservedCharacter.reservedBy && now < reservedCharacter.reservedUntil) {
      const isUserReserver = reservedCharacter.reservedBy === userId
      const reserverName =
        db.users[reservedCharacter.reservedBy]?.name || reservedCharacter.reservedBy.split('@')[0]
      const secondsLeft = ((reservedCharacter.reservedUntil - now) / 1000).toFixed(1)
      if (!isUserReserver)
        return m.reply(
          `✎ *${reservedCharacter.name}* está protegido por *${reserverName}* durante *${secondsLeft}s*`,
        )
    }

    if (
      reservedCharacter.expiresAt &&
      now > reservedCharacter.expiresAt &&
      !reservedCharacter.user &&
      !(reservedCharacter.reservedBy && now < reservedCharacter.reservedUntil)
    ) {
      const expiredTime = ((now - reservedCharacter.expiresAt) / 1000).toFixed(1)
      return m.reply(
        `《✧》 El personaje *${reservedCharacter.name}* ha expirado hace *${expiredTime}s*.`,
      )
    }

    // chatConfig.users[userId] ||= { characters: [], characterCount: 0, totalRwcoins: 0 }
    const userData = chatConfig.users[userId]

    if (user.coins < reservedCharacter.value)
      return m.reply(
        `ꕥ No tienes suficiente *${monedas}* para comprar a *${reservedCharacter.name}*.`,
      )

   // userData.characters ||= []
    userData.characters.push({
      name: reservedCharacter.name,
      value: reservedCharacter.value,
      gender: reservedCharacter.gender,
      source: reservedCharacter.source,
      keyword: reservedCharacter.keyword,
      claim: formatDate(now),
      user: userId,
    })

    userData.characterCount++
    userData.totalRwcoins += reservedCharacter.value
    chatConfig.personajesReservados = chatConfig.personajesReservados.filter(
      (p) => p.id !== reservedCharacter.id,
    )
    user.buyCooldown = now + 15 * 60000
    user.coins -= reservedCharacter.value

    const displayName = db.users[userId]?.name || userId.split('@')[0]
    delete reservedCharacter.reservedBy
    delete reservedCharacter.reservedUntil
    const duration = ((now - reservedCharacter.expiresAt + 60000) / 1000).toFixed(1)

    const frases = [
      `*${reservedCharacter.name}* ha sido reclamado por *${displayName}*`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* al valle de la Pascua`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* a la cama`,
      `*${displayName}* se llevó a *${reservedCharacter.name}* a la luna de miel`,
      `*${reservedCharacter.name}* reclutada por *${displayName}* para actos de terrorismo`,
      `*${displayName}* ha reclamado a *${reservedCharacter.name}*`,
      `*${displayName}* hizo dudar de su existencia a *${reservedCharacter.name}*`,
      `*${displayName}* llevó a *${reservedCharacter.name}* a explorar el multiverso`,
      `*${reservedCharacter.name}* ahora es fiel compañero de *${displayName}* en mil aventuras`,
      `*${displayName}* robó el corazón de *${reservedCharacter.name}* con una mirada`,
      `*${reservedCharacter.name}* fue elegido por *${displayName}* para gobernar juntos el reino`,
      `*${displayName}* encendió la chispa en *${reservedCharacter.name}*, y no hubo marcha atrás`,
      `*${reservedCharacter.name}* cayó rendido ante los encantos de *${displayName}*`,
      `*${displayName}* invitó a *${reservedCharacter.name}* a una noche inolvidable bajo las estrellas`,
      `*${displayName}* desató emociones intensas en *${reservedCharacter.name}* con solo un suspiro`,
      `*${reservedCharacter.name}* y *${displayName}* desaparecieron entre susurros y miradas ardientes`,
    ]

    const final = frases[Math.floor(Math.random() * frases.length)]
    await client.sendMessage(chatId, { text: `✎ ${final} _(${duration}s)_` }, { quoted: m })
  },
};
