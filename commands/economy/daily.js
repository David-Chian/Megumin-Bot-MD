export default {
  command: ['daily'],
  category: 'rpg',
  run: async ({client, m}) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings[botId].currency

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const twoDays = oneDay * 2

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

user.dailyStreak = user.dailyStreak ?? 0
user.lastDaily = user.lastDaily ?? 0
user.coins = user.coins ?? 0

    const timeSinceLast = now - user.lastDaily

    if (timeSinceLast < oneDay) {
      const restante = formatRemainingTime(oneDay - timeSinceLast)
     return m.reply(
        `✐ Ya has reclamado tu *Daily* de hoy.\n` +
        `> Puedes reclamarlo de nuevo en *${restante}*`
      ) 
    }

   if (timeSinceLast > twoDays) {
  const perdioRacha = user.dailyStreak >= 10
  user.dailyStreak = 1
  user.lastDaily = now
  const recompensa = calcularRecompensa(user.dailyStreak)
  const siguiente = calcularRecompensa(user.dailyStreak + 1)
  user.coins += recompensa

  return m.reply(
    `「✿」Has reclamado tu recompensa diaria de *${recompensa.toLocaleString()} ${monedas}*! (Día *1*)\n` +
    `> Día *2* » *¥${siguiente.toLocaleString()}*` +
    (perdioRacha ? `\n> ☆ ¡Has perdido tu racha de días!` : '')
  )
}

    user.dailyStreak += 1
    user.lastDaily = now
    const recompensa = calcularRecompensa(user.dailyStreak)
    const siguiente = calcularRecompensa(user.dailyStreak + 1)
    user.coins += recompensa

    const rachaExtra = user.dailyStreak >= 10
      ? `\n> ☆ ¡Racha de *${user.dailyStreak}* días, ¡Sigue así!`
      : ''

    await m.reply(
      `「✿」Has reclamado tu recompensa diaria de *¥${recompensa.toLocaleString()} ${monedas}* (Día *${user.dailyStreak}*)\n` +
      `> Día *${user.dailyStreak + 1}* » *¥${siguiente.toLocaleString()}*${rachaExtra}`
    )
  },
};

function calcularRecompensa(dia) {
  const base = 10000
  const incremento = 5000
  const maximo = 100000
  const recompensa = base + (dia - 1) * incremento
  return Math.min(recompensa, maximo)
}

function formatRemainingTime(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const seg = s % 60
  const partes = []
  if (h) partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`)
  if (m) partes.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`)
  if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`)
  return partes.join(' ')
}