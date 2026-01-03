import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';

const obtenerImagenGelbooru = async (keyword) => {
  const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const extensionesImagen = /\.(jpg|jpeg|png)$/i
    const imagenesValidas = data?.data?.filter(
      (item) => typeof item?.image === 'string' && extensionesImagen.test(item.image),
    )
    if (!imagenesValidas?.length) return null
    const aleatoria = imagenesValidas[Math.floor(Math.random() * imagenesValidas.length)]
    return aleatoria.image
  } catch {
    return null
  }
}

const obtenerPersonajes = () => {
  try {
    const contenido = fs.readFileSync('./lib/characters.json', 'utf-8')
    return JSON.parse(contenido)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const reservarPersonaje = (chatId, userId, personaje, db) => {
  // db.chats[chatId].personajesReservados ||= []
  db.chats[chatId].personajesReservados.push({ userId, ...personaje })
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
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chat = db.chats[chatId] || {}
   // chat.users ||= {}
    // chat.personajesReservados ||= []
    const user = chat.users[userId] || {}
    const now = Date.now()

    if (chat.adminonly || !chat.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const cooldown = user.rwCooldown || 0
    const restante = cooldown - now
    if (restante > 0) {
      return m.reply(`ꕥ Espera *${msToTime(restante)}* para volver a usar este comando.`)
    }

    const personajes = obtenerPersonajes()
    const personaje = personajes[Math.floor(Math.random() * personajes.length)]
    if (!personaje) return m.reply('《✧》 No se encontró ningún personaje disponible.')

    const idUnico = uuidv4().slice(0, 8)
    const reservado = Array.isArray(chat.personajesReservados)
      ? chat.personajesReservados.find((p) => p.name === personaje.name)
      : null

    const poseedor = Object.entries(chat.users).find(
      ([_, u]) =>
        Array.isArray(u.characters) && u.characters.some((c) => c.name === personaje.name),
    )

    try {
      let estado = 'Libre'
      if (poseedor) {
        const [id] = poseedor
        estado = `Reclamado por ${db.users[id]?.name || 'Alguien'}`
      } else if (reservado) {
        estado = `Reservado por ${db.users[reservado.userId]?.name || 'Alguien'}`
      }

      user.rwCooldown = now + 15 * 60000

      const valorPersonaje =
        typeof personaje.value === 'number' ? personaje.value.toLocaleString() : '0'
      const mensaje = `➩ Nombre › *${personaje.name || 'Desconocido'}*

⚥ Género › *${personaje.gender || 'Desconocido'}*
⛁ Valor › *${valorPersonaje}*
♡ Estado › *${estado}*
❖ Fuente › *${personaje.source || 'Desconocido'}*

${dev}`

      const imagenUrl = await obtenerImagenGelbooru(personaje.keyword)

      await client.sendMessage(
        chatId,
        {
          image: { url: imagenUrl },
          caption: mensaje,
          mimetype: 'image/jpeg',
        },
        { quoted: m },
      )

      if (!poseedor) {
        reservarPersonaje(
          chatId,
          userId,
          {
            ...personaje,
            id: idUnico,
            reservedBy: userId,
            reservedUntil: now + 20000,
            expiresAt: now + 60000,
          },
          db,
        )
      }
    } catch (e) {
      user.rwCooldown = 0
      return m.reply(msgglobal)
    }
  },
};
