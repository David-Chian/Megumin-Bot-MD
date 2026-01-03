export default {
  command: ['crime'],
  category: 'rpg',
  run: async ({client, m}) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = global.db.data.settings[botId].currency

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✐ Estos comandos estan desactivados en este grupo.`)

    if (!user.crimeCooldown) user.crimeCooldown = 0
    const remainingTime = user.crimeCooldown - Date.now()

    if (remainingTime > 0) {
      return m.reply(`ꕥ Debes esperar *${msToTime(remainingTime)}* antes de intentar nuevamente.`)
    }

    const éxito = Math.random() < 0.5
    const cantidad = Math.floor(Math.random() * 5000)
    user.crimeCooldown = Date.now() + 10 * 60 * 1000

    const successMessages = [
      `Realizaste un espectacular atraco a un banco y ganaste *¥${cantidad.toLocaleString()} ${monedas}*!`,
      `Hackeaste un sistema de seguridad y accediste a *¥${cantidad.toLocaleString()} ${monedas}*!`,
      `Robaste joyas de una exhibición y obtuviste *¥${cantidad.toLocaleString()} ${monedas}*!`,
      `Vendiste información confidencial y ganaste *¥${cantidad.toLocaleString()} ${monedas}*!`,
      `Implementaste un plan maestro y ganaste *¥${cantidad.toLocaleString()} ${monedas}*!`,
      `Te convertiste en el rey del contrabando y ganaste *¥${cantidad.toLocaleString()} ${monedas}*!`,
    ]

    const failMessages = [
      `Intentaste escapar tras un robo, pero te atraparon y perdiste *¥${cantidad.toLocaleString()} ${monedas}*.`,
      `Hackeaste un sistema y fallaste, perdiendo *¥${cantidad.toLocaleString()} ${monedas}*.`,
      `Cometiste un error al disfrazarte y te reconocieron, perdiendo *¥${cantidad.toLocaleString()} ${monedas}*.`,
      `Intentaste extorsionar a un cliente, pero te denunciaron y perdiste *¥${cantidad.toLocaleString()} ${monedas}*.`,
      `Tu plan fue delatado y la policía te atrapó, perdiendo *¥${cantidad.toLocaleString()} ${monedas}*.`,
    ]

    const message = éxito ? pickRandom(successMessages) : pickRandom(failMessages)

    if (éxito) {
      user.coins += cantidad
    } else {
      const total = user.coins + user.bank
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad
        } else {
          const restante = cantidad - user.coins
          user.coins = 0
          user.bank -= restante
        }
      } else {
        user.coins = 0
        user.bank = 0
      }
    }

    await client.sendMessage(m.chat, { text: `「✿」 ${message}` }, { quoted: m })
  },
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)

  const min = minutes < 10 ? '0' + minutes : minutes
  const sec = seconds < 10 ? '0' + seconds : seconds

  return min === '00'
    ? `${sec} segundo${sec > 1 ? 's' : ''}`
    : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
