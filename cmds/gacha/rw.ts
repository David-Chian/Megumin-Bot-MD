import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./core/characters.json', 'utf-8')
    return JSON.parse(contenido)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return m === '00'
    ? `${s} segundo${s > 1 ? 's' : ''}`
    : `${m} minuto${m > 1 ? 's' : ''}, ${s} segundo${s > 1 ? 's' : ''}`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async ({ sock, m, args }) => {
    const chatId  = m.chat
    const userId  = m.sender
    const chat     = await getChat(chatId)
    const user     = await getUser(userId)
    const chatUser = await getChatUser(chatId, userId)
    const now      = Date.now()

    if (chat.adminonly || !chat.gacha)
      return sock.reply(m.chat, `${mess.comandooff}`,m,m.rcanal)

    const cooldown  = chatUser.rwCooldown || 0
    const restante  = cooldown - now
    if (restante > 0)
      return sock.reply(m.chat,`✎ Espera *${msToTime(restante)}* para volver a usar este comando.`,m,m.rcanal)

    const personajes = obtenerPersonajes()
    if (!personajes.length)
      return sock.reply(m.chat,'《✤》 No se encontró ningún personaje disponible.',m,m.rcanal)

    const chatUsers = await getChatUser(chatId)

    const estaReclamado = (nombre: string) => {
      if (chatUsers.find(u =>
        Array.isArray(u.characters) && u.characters.some(c => c.name === nombre)
      )) return true

      const reservados: any[] = chat.personajesReservados || []
      const reserva = reservados.find(p => p.name === nombre)
      if (reserva && reserva.expiresAt > now) return true

      return false
    }

    const libres     = personajes.filter(p => !estaReclamado(p.name))
    const hayLibres  = libres.length > 0

    const usarLibres = hayLibres && Math.random() < 0.75
    const pool       = usarLibres ? libres : personajes

    const personaje = pool[Math.floor(Math.random() * pool.length)]
    if (!personaje)
      return sock.reply(m.chat,'《✤》 No se encontró ningún personaje disponible.',m,m.rcanal)

    const poseedor = chatUsers.find(u =>
      Array.isArray(u.characters) && u.characters.some(c => c.name === personaje.name)
    )

    const reservado = (chat.personajesReservados || []).find(
      p => p.name === personaje.name && p.expiresAt > now
    )

    try {
      let estado = 'Libre'
      if (poseedor) {
        const userData = await getUser(poseedor.user_id)
        estado = `Reclamado por ${userData.name || 'Alguien'}`
      } else if (reservado) {
        const userData = await getUser(reservado.userId)
        estado = `Reservado por ${userData.name || 'Alguien'}`
      }

      await updateChatUser(chatId, userId, 'rwCooldown', now + 15 * 60000)

      const valorPersonaje =
        typeof personaje.value === 'number' ? personaje.value.toLocaleString() : '0'

      const mensaje = `➩ Nombre › *${personaje.name || 'Desconocido'}*

ੈ⚥‧₊˚ Género › *${personaje.gender || 'Desconocido'}*
ੈ⛁‧₊˚ Valor › *${valorPersonaje}*
ੈ❖‧₊˚ Estado › *${estado}*
ੈ❀︎‧₊˚ Fuente › *${personaje.source || 'Desconocido'}*

${dev}`

      if (!personaje.url)
        return sock.reply(m.chat,`✎ No se encontró imagen para *${personaje.name}*.`,m,m.rcanal)

      const sent = await sock.sendMessage(chatId, {
        image: { url: personaje.url },
        caption: mensaje,
        mimetype: 'image/jpeg'
      }, { quoted: m })

      if (!poseedor && !reservado) {
        const idUnico      = uuidv4().slice(0, 8)
        const nuevoReservado = {
          id:            idUnico,
          name:          personaje.name,
          value:         personaje.value || 0,
          gender:        personaje.gender,
          source:        personaje.source,
          url:           personaje.url,
          userId,
          reservedUntil: now + 30000,
          expiresAt:     now + 300000,
          messageId:     sent.key.id
        }

        const personajesReservados: any[] = chat.personajesReservados || []
        const indexExistente = personajesReservados.findIndex(p => p.name === personaje.name)

        if (indexExistente !== -1) {
          personajesReservados[indexExistente] = nuevoReservado
        } else {
          personajesReservados.push(nuevoReservado)
        }

        await updateChat(chatId, 'personajesReservados', personajesReservados)
      }

    } catch (err: any) {
      await updateChatUser(chatId, userId, 'rwCooldown', 0)
      await sock.sendMessage(m.chat, {
        text: `❌ *Error al enviar la imagen del personaje*\n
👤 *Nombre:* ${personaje.name}
⚥ *Género:* ${personaje.gender}
⛁ *Precio:* ${personaje.value?.toLocaleString() ?? '0'}
✤ *Fuente:* ${personaje.source}
🌐 *URL:* ${personaje.url}
🪲 *Detalles del error:* ${err?.message || err}`
      }, { quoted: m })
    }
  }
}
