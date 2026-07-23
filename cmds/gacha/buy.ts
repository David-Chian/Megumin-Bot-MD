import fs from 'fs';

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  return minutes === 0
    ? `${seconds} segundo${seconds !== 1 ? 's' : ''}`
    : `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

const frasesClaim = [
  `*{name}* ha sido reclamado por *{user}*`,
  `*{user}* se llevó a *{name}* al valle de la Pascua`,
  `*{user}* se llevó a *{name}* a la cama`,
  `*{user}* se llevó a *{name}* a la luna de miel`,
  `*{name}* reclutada por *{user}* para actos de terrorismo`,
  `*{user}* ha reclamado a *{name}*`,
  `*{user}* hizo dudar de su existencia a *{name}*`,
  `*{user}* llevó a *{name}* a explorar el multiverso`,
  `*{name}* ahora es fiel compañero de *{user}* en mil aventuras`,
  `*{user}* robó el corazón de *{name}* con una mirada`,
  `*{user}* fue elegido por *{name}* para gobernar juntos el reino`,
  `*{user}* encendió la chispa en *{name}*, y no hubo marcha atrás`,
  `*{name}* cayó rendido ante los encantos de *{user}*`,
  `*{user}* invitó a *{name}* a una noche inolvidable bajo las estrellas`,
  `*{user}* desató emociones intensas en *{name}* con solo un suspiro`,
  `*{name}* y *{user}* desaparecieron entre susurros y miradas ardientes`,
  `*{user}* encontró a *{name}* perdido entre dimensiones y lo reclamó`,
  `*{name}* juró lealtad a *{user}* tras una épica aventura`,
  `*{user}* convenció a *{name}* con una oferta imposible de rechazar`,
  `*{name}* decidió acompañar a *{user}* en su próximo viaje`,
  `*{user}* y *{name}* sellaron un pacto que nadie podrá romper`,
]

const frasesRoboExito = [
  `🗡️ ¡*{thief}* arrebató a *{name}* de las manos de *{victim}*!`,
  `⚔️ *{thief}* aprovechó el descuido de *{victim}* y se llevó a *{name}*`,
  `🌑 En la oscuridad, *{thief}* robó a *{name}* antes de que *{victim}* pudiera reaccionar`,
  `🎭 *{name}* cambió de manos: ahora pertenece a *{thief}*`,
  `🕶️ *{thief}* ejecutó el robo perfecto y se llevó a *{name}* de *{victim}*`,
  `🎭 Mientras *{victim}* estaba distraído, *{thief}* escapó con *{name}*`,
  `🚀 *{thief}* actuó tan rápido que *{victim}* no pudo reaccionar y perdió a *{name}*`,
  `💎 *{name}* cambió de dueño; ahora acompaña a *{thief}*`,
  `🎯 El plan de *{thief}* fue un éxito total: *{name}* ya no pertenece a *{victim}*`,
]

const frasesRoboFallo = [
  `💨 *{thief}* intentó robar a *{name}* de *{victim}* pero falló estrepitosamente`,
  `🛡️ *{victim}* protegió bien a *{name}*, *{thief}* no pudo hacer nada`,
  `🎲 La suerte no acompañó a *{thief}* esta vez. *{name}* sigue con *{victim}*`,
  `😤 *{thief}* salió con las manos vacías. *{name}* es leal a *{victim}*`,
  `🛡️ *{victim}* descubrió el plan de *{thief}* y protegió a *{name}*`,
  `👀 *{name}* vio venir a *{thief}* y avisó a *{victim}* a tiempo`,
  `🚔 *{thief}* fue atrapado antes de poder acercarse a *{name}*`,
  `💥 El intento de robo salió mal y *{thief}* terminó huyendo sin *{name}*`,
  `🍀 La suerte estuvo del lado de *{victim}*: *{name}* sigue a salvo de las garras de *{thief}*`,
]

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

function parseCharacters(raw: any): any[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default {
  command: ['claim', 'c'],
  category: 'gacha',
  run: async ({ sock, m, args }) => {
    const chatId      = m.chat
    const userId      = m.sender
    const botId       = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig  = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const monedas     = botSettings.currency
    const user        = await getChatUser(chatId, userId)
    const now         = Date.now()

    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const remainingTime = (user.buyCooldown || 0) - now
    if (remainingTime > 0)
      return sock.reply(m.chat,`《✤》 Debes esperar *${msToTime(remainingTime)}* para usar *"${m.command}"* nuevamente`,m,m.rcanal)

    if (!m.quoted)
      return sock.reply(m.chat,`《✤》 Responde a una waifu para reclamarla.`,m,m.rcanal)

    const quotedId         = m.quoted?.id
    const reservedCharacter = chatConfig.personajesReservados?.find(p => p.messageId === quotedId)

    if (!reservedCharacter)
      return sock.reply(m.chat,`✿ Solo puedes reclamar personajes generados con *rollwaifu*.`,m,m.rcanal)

    const chatUsers    = await getChatUser(chatId)
    const alreadyClaimed = chatUsers.find(u =>
      parseCharacters(u.characters).some((c: any) => c.name?.toLowerCase() === reservedCharacter.name.toLowerCase())
    )

    if (alreadyClaimed) {
      if (alreadyClaimed.user_id === userId)
        return sock.reply(m.chat,`✤ Tú ya has reclamado a *${reservedCharacter.name}*.`,m, m.rcanal)

      const ownerData = await getUser(alreadyClaimed.user_id)
      const ownerName = ownerData?.name || alreadyClaimed.user_id.split('@')[0]
      return sock.reply(m.chat,`❀ El personaje *${reservedCharacter.name}* ya a sido reclamado por *${ownerName}*.`,m, m.rcanal)
    }

    const estaReservadoPorOtro =
      reservedCharacter.userId &&
      reservedCharacter.userId !== userId &&
      now < reservedCharacter.expiresAt

    if (estaReservadoPorOtro) {
      const victimData = await getUser(reservedCharacter.userId)
      const victimName = victimData?.name || reservedCharacter.userId.split('@')[0]
      const thiefData  = await getUser(userId)
      const thiefName  = thiefData?.name || userId.split('@')[0]

      await updateChatUser(chatId, userId, 'buyCooldown', now + 15 * 60000)

      const exito = Math.random() < 0.5

      if (exito) {
        const reservasFrescas: any[] = chatConfig.personajesReservados
          ? (await getChat(chatId)).personajesReservados || []
          : []
        const sigueReservado = reservasFrescas.find((p: any) => p.id === reservedCharacter.id)

        if (!sigueReservado) {
          return sock.reply(m.chat,`✿ *${reservedCharacter.name}* ya no estaba disponible para robar.`,m, m.rcanal)
        }

        const ladronFresco = await getChatUser(chatId, userId)
        const charsLadron  = parseCharacters(ladronFresco?.characters)
        charsLadron.push({
          name:    reservedCharacter.name,
          value:   reservedCharacter.value,
          gender:  reservedCharacter.gender,
          source:  reservedCharacter.source,
          keyword: reservedCharacter.keyword,
          url:     reservedCharacter.url,
          claim:   formatDate(now),
          user:    userId,
        })
        await updateChatUser(chatId, userId, 'characters', charsLadron)
        await updateChatUser(chatId, userId, 'coins', Math.max(0, (ladronFresco?.coins || 0) - reservedCharacter.value))

        const chatFresco = await getChat(chatId)
        const sinReservado = (chatFresco.personajesReservados || []).filter((p: any) => p.id !== reservedCharacter.id)
        await updateChat(chatId, 'personajesReservados', sinReservado)

        const frase = pick(frasesRoboExito)
          .replace('{thief}', thiefName)
          .replace('{name}',  reservedCharacter.name)
          .replace('{victim}', victimName)

        return sock.reply(m.chat,`✐ ${frase}`,m,m.rcanal)
      } else {
        const frase = pick(frasesRoboFallo)
          .replace('{thief}', thiefName)
          .replace('{name}',  reservedCharacter.name)
          .replace('{victim}', victimName)

        return sock.reply(m.chat,`${frase}`)
      }
    }

    if (
      reservedCharacter.userId &&
      reservedCharacter.userId !== userId &&
      now < reservedCharacter.reservedUntil
    ) {
      const reserverData = await getUser(reservedCharacter.userId)
      const reserverName = reserverData?.name || reservedCharacter.userId.split('@')[0]
      const segsLeft     = ((reservedCharacter.reservedUntil - now) / 1000).toFixed(1)
      return sock.reply(m.chat,`✿ *${reservedCharacter.name}* está protegido por *${reserverName}* durante *${segsLeft}s*`,m,m.rcanal)
    }

    if (
      reservedCharacter.expiresAt &&
      now > reservedCharacter.expiresAt &&
      !(reservedCharacter.userId && now < reservedCharacter.reservedUntil)
    ) {
      const expiredSecs = ((now - reservedCharacter.expiresAt) / 1000).toFixed(1)
      return sock.reply(m.chat,`❖ *${reservedCharacter.name}* ha expirado hace *${expiredSecs}s*.`,m, m.rcanal)
    }

    if (user.coins < reservedCharacter.value)
      return sock.reply(m.chat,`《✤》 No tienes suficiente *${monedas}* para reclamar a *${reservedCharacter.name}*.`,m,m.rcanal)

    const chatFrescoClaim = await getChat(chatId)
    const reservaVigente = (chatFrescoClaim.personajesReservados || []).find((p: any) => p.id === reservedCharacter.id)
    if (!reservaVigente) {
      return sock.reply(m.chat,`✿ *${reservedCharacter.name}* ya fue reclamado por otra persona justo antes.`,m, m.rcanal)
    }
    const userFresco = await getChatUser(chatId, userId)
    if (userFresco.coins < reservedCharacter.value)
      return sock.reply(m.chat,`《✤》 No tienes suficiente *${monedas}* para reclamar a *${reservedCharacter.name}*.`,m,m.rcanal)

    const characters = parseCharacters(userFresco.characters)
    characters.push({
      name:    reservedCharacter.name,
      value:   reservedCharacter.value,
      gender:  reservedCharacter.gender,
      source:  reservedCharacter.source,
      keyword: reservedCharacter.keyword,
      url:     reservedCharacter.url,
      claim:   formatDate(now),
      user:    userId,
    })

    const sinReservado = (chatFrescoClaim.personajesReservados || []).filter((p: any) => p.id !== reservedCharacter.id)

    await updateChatUser(chatId, userId, 'characters',  characters)
    await updateChatUser(chatId, userId, 'buyCooldown', now + 15 * 60000)
    await updateChatUser(chatId, userId, 'coins',       userFresco.coins - reservedCharacter.value)
    await updateChat(chatId, 'personajesReservados', sinReservado)

    const userData    = await getUser(userId)
    const displayName = userData?.name || userId.split('@')[0]
    const duration    = ((now - reservedCharacter.expiresAt + 60000) / 1000).toFixed(1)

    const frase = pick(frasesClaim)
      .replace('{name}', reservedCharacter.name)
      .replace('{user}', displayName)

    await sock.reply(chatId, `✐ ${frase} _(${duration}s)_`, m,m.rcanal)
  },
}