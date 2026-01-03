import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['setbotowner'],
  category: 'socket',
  run: async ({client, m, args}) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    const who = await resolveLidToRealJid(who2, client, m.chat);
    const menti = client.user.id.split(':')[0] + "@s.whatsapp.net"
    if (!who2) {
     return client.reply(m.chat, `💣 Debes mencionar al nuevo dueño del bot.\n> Ejemplo: *${prefa}setbotowner @${menti.split('@')[0]}*`, m, { mentions: [menti] })
    }

const anteriorOwner = config.owner
const esCambio = anteriorOwner && anteriorOwner.endsWith('@s.whatsapp.net')

config.owner = who

const mensaje = esCambio
  ? `💥 El dueño del bot ha sido cambiado de @${anteriorOwner.split('@')[0]} a @${who.split('@')[0]}!`
  : `💥 El nuevo dueño de *${config.namebot2}* es @${who.split('@')[0]}!`

return m.reply(mensaje, {
  mentions: esCambio ? [anteriorOwner, who] : [who]
})
  },
};