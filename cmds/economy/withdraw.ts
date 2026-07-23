export default {
  command: ['withdraw', 'with'],
  category: 'rpg',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const senderId = m.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const chatData = await getChat(m.chat)

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const user = await getChatUser(m.chat, m.sender)
    const currency = botSettings.currency || 'Monedas'

    if (!args[0]) return m.reply(`《✤》 Ingresa la cantidad de *${currency}* que quieras retirar.`)

    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0)
        return m.reply(`✐ No tienes *${currency}* para retirar de tu Banco.`)

      const amount = user.bank
      user.bank = 0
      user.coins = (user.coins || 0) + amount

   await updateChatUser(m.chat, m.sender, 'bank', user.bank)
   await updateChatUser(m.chat, m.sender, 'coins', user.coins)

      return m.reply(`✐ Has retirado *¥${amount.toLocaleString()} ${currency}* de tu Banco.`)
    }

    const count = parseInt(args[0])
    if (isNaN(count) || count < 1) return m.reply(`✎ Ingresa una cantidad válida para retirar.`)

    if ((user.bank || 0) < count)
      return m.reply(
        `✐ No tienes suficientes *${currency}* en tu banco para retirar esa cantidad.`,
      )

    user.bank -= count
    user.coins = (user.coins || 0) + count

   await updateChatUser(m.chat, m.sender, 'bank', user.bank)
   await updateChatUser(m.chat, m.sender, 'coins', user.coins)

    await m.reply(`✐ Has retirado *¥${count.toLocaleString()} ${currency}* de tu Banco.`)
  },
};
