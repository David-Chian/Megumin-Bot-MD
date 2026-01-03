let proposals = {}
import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['marry'],
  category: 'rpg',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const proposer = m.sender
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    const proposee = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2)
      return m.reply('《✧》 Menciona al usuario al que deseas proponer matrimonio.')

    if (proposer === proposee)
      return m.reply('《✧》 No puedes proponerte matrimonio a ti mismo.')

    if (db.users[proposer]?.marry)
      return m.reply(`《✧》 Ya estás casado con *${db.users[db.users[proposer].marry]?.name || 'alguien'}*.`)

    if (db.users[proposee]?.marry)
      return m.reply(`《✧》 *${db.users[proposee].name || proposee.split('@')[0]}* ya está casado con *${db.users[db.users[proposee].marry]?.name || 'alguien'}*.`)

    setTimeout(() => {
      delete proposals[proposer]
    }, 120000)

    if (proposals[proposee] === proposer) {
      delete proposals[proposee]
      db.users[proposer].marry = proposee
      db.users[proposee].marry = proposer
      return m.reply(`✎ Felicidades, *${db.users[proposer].name || proposer.split('@')[0]}* y *${db.users[proposee].name || proposee.split('@')[0]}* ahora están casados.`)
    } else {
      proposals[proposer] = proposee
      return client.sendMessage(chatId, {
        text: `✎ @${proposee.split('@')[0]}, el usuario @${proposer.split('@')[0]} te ha enviado una propuesta de matrimonio.\n\n⚘ *Responde con:*\n> ❀ *_marry @${proposer.split('@')[0]}_* para confirmar.\n> ❀ La propuesta expirará en 2 minutos.`,
        mentions: [proposer, proposee]
      }, { quoted: m })
    }
  }
};