export default {
  command: ['rwdivorce', 'divorcerw', 'separar'],
  category: 'rpg',

  run: async ({ sock, m, args }) => {
    const text = args.join(' ').trim()
    if (!text)
      return sock.reply(m.chat,`💔 Escribe el nombre del personaje del que te quieres divorciar.\nEjemplo: */separar Megumin*`,m, m.rcanal)

    const chatId = m.chat
    const userId = m.sender
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatConfig = await getChat(chatId)
    const botSettings = await getSettings(botId)
    const currency = botSettings?.currency || 'Coins'

    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const marriages = chatConfig.marriages || {}
    const characterName = text.toLowerCase()

    const marriageEntry = Object.entries(marriages).find(([name, data]) =>
      name.toLowerCase().includes(characterName) && data.partnerId === userId
    )

    if (!marriageEntry)
      return sock.reply(m.chat,`⚠️ No estás casado con ningún personaje llamado *${text}* en este grupo.`,m,m.rcanal)

    const [realCharName, marriageData] = marriageEntry
    const user = await getChatUser(chatId, userId)
    const refund = Math.floor(marriageData.pricePaid * 0.50)

    await updateChatUser(chatId, userId, 'coins', (user.coins || 0) + refund)

    delete marriages[realCharName]
    await updateChat(chatId, 'marriages', marriages)

    return sock.reply(m.chat,
      `💔 Has firmado los papeles del divorcio con *${realCharName}*.\n\n💰 Reembolso del 50%: *${refund.toLocaleString()}* ${currency}.\n\n*${realCharName}* ahora está disponible para nuevos pretendientes.`
   , m,m.rcanal)
  }
}