export default {
  command: ['withdraw', 'with'],
  category: 'rpg',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const user = chatData.users[m.sender]
    const currency = botSettings.currency || 'Monedas'

    if (!args[0]) return m.reply(`《✧》 Ingresa la cantidad de *${currency}* que quieras retirar.`)

    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0)
        return m.reply(`《✧》 No tienes *${currency}* para retirar de tu Banco.`)

      const amount = user.bank
      user.bank = 0
      user.coins = (user.coins || 0) + amount

      return m.reply(`✎ Has retirado *¥${amount.toLocaleString()} ${currency}* de tu Banco.`)
    }

    const count = parseInt(args[0])
    if (isNaN(count) || count < 1) return m.reply(`《✧》 Ingresa una cantidad válida para retirar.`)

    if ((user.bank || 0) < count)
      return m.reply(
        `《✧》 No tienes suficientes *${currency}* en tu banco para retirar esa cantidad.`,
      )

    user.bank -= count
    user.coins = (user.coins || 0) + count

    await m.reply(`✎ Has retirado *¥${count.toLocaleString()} ${currency}* de tu Banco.`)
  },
};
