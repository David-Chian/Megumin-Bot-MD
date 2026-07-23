import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['balance', 'bal'],
  category: 'rpg',
    run: async ({sock, m, args, command, text, prefix}) => {
    const chatId = m.chat
    const chatData = await getChat(m.chat)
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = await getSettings(botId)
    const monedas = botSettings.currency

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, sock, m.chat);

    const user = await getChatUser(m.chat, who)
    const user2 = await getUser(who)
    if (!user)
      return m.reply(`「✿」 El usuario mencionado no está registrado en el bot.`)

    const total = (user.coins || 0) + (user.bank || 0)

    const bal = `*ꕥ Balance de ›* ${user2.name}

	➠ *${monedas}* : *¥${user.coins?.toLocaleString() || 0}*
	➠ *Banco* : *¥${user.bank?.toLocaleString() || 0}*
	➠ *Total* : *¥${total.toLocaleString()}*

> Para proteger tus *${monedas}*, depósitalas en el banco usando *${prefix}dep*`

    await sock.reply(m.chat, bal, m,m.rcanal)
  }
};
