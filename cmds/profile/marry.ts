import { resolveLidToRealJid } from "../../core/utils.ts"

let proposals = {}

export default {
  command: ['marry'],
  category: 'profile',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const proposer = m.sender
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    if (!who2) return m.reply('《✤》 Menciona al usuario al que deseas proponer matrimonio.')

    const proposee = await resolveLidToRealJid(who2, sock, m.chat)

    if (proposer === proposee)
      return m.reply('「✿」 No puedes proponerte matrimonio a ti mismo.')

    const proposerData = await getUser(proposer)
    const proposeeData = await getUser(proposee)

    if (proposerData?.marry)
      return m.reply(`✐ Ya estás casado con *${getUser(proposerData.marry)?.name || 'alguien'}*.`)

    if (proposeeData?.marry)
      return m.reply(`✎ *${proposeeData.name || proposee.split('@')[0]}* ya está casado con *${getUser(proposeeData.marry)?.name || 'alguien'}*.`)

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]

      proposerData.marry = proposee
      proposeeData.marry = proposer

      await updateUser(m.sender, 'marry', proposerData.marry)
      await updateUser(proposee, 'marry', proposeeData.marry)
     return m.reply(`✐ Felicidades, *${proposerData.name || proposer.split('@')[0]}* y *${proposeeData.name || proposee.split('@')[0]}* ahora están casados.`)
    } else {
      proposals[proposer] = proposee
      return sock.reply(
        chatId,
        `✎ @${proposee.split('@')[0]}, el usuario @${proposer.split('@')[0]} te ha enviado una propuesta de matrimonio.\n\n⚘ *Responde con:*\n> ❀ *_marry @${proposer.split('@')[0]}_* para confirmar.\n> ❀ La propuesta expirará en 2 minutos.`,
        m,
        { mentions: [proposer, proposee] }
      )
    }
  }
}
