export default {
  command: ['ritual'],
  category: 'rpg',
  run: async ({client, m}) => {
    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = global.db.data.settings[botId]
    const monedas = botSettings?.currency || 'Coins'

    const chat = global.db.data.chats[m.chat]
    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const user = chat.users[m.sender]
    const remaining = user.ritualCooldown - Date.now()
    if (remaining > 0) {
      return m.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para invocar otro ritual.`)
    }

    user.ritualCooldown = Date.now() + 15 * 60000

    const roll = Math.random()
    let reward = 0
    let narration = ''
    let bonusMsg = ''

    if (roll < 0.05) {
      reward = Math.floor(Math.random() * 100000) + 50000
      narration = '「✿」 ¡Has invocado un espíritu ancestral que te entrega un tesoro cósmico!'
      bonusMsg = '\nꕥ Recompensa MÍTICA obtenida!'
    } else if (roll < 0.25) {
      reward = Math.floor(Math.random() * 10000) + 2000
      narration = '「✿」 Tu ritual abre un portal y caen riquezas ardientes del vacío'
    } else if (roll < 0.75) {
      reward = Math.floor(Math.random() * 5000) + 500
      narration = `「✿」 Bajo la luna, tu ritual te concede *${reward.toLocaleString()} ${monedas}*`
    } else {
      const loss = Math.floor(Math.random() * 2000) + 500
      user.coins = Math.max(0, user.coins - loss)
      return m.reply(`「✿」 El ritual salió mal... una maldición te arrebató *${loss.toLocaleString()} ${monedas}*`)
    }

    if (Math.random() < 0.15) {
      const bonus = Math.floor(Math.random() * 4000) + 1000
      reward += bonus
      bonusMsg += `\n「✿」 ¡Energía extra! Ganaste *${bonus.toLocaleString()}* ${monedas} adicionales`
    }

    user.coins += reward

    let msg = `「✿」 ${narration}\nGanaste *${reward.toLocaleString()} ${monedas}*`
    if (bonusMsg) msg += `\n${bonusMsg}`

    await client.reply(m.chat, msg, m)
  },
};

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`
}