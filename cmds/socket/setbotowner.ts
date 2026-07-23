import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['setbotowner'],
  category: 'socket',
  run: async ({sock, m, args, command, text, prefix}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...global.mods.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)
    const who = await resolveLidToRealJid(who2, sock, m.chat);
    const menti = sock.user.id.split(':')[0] + "@s.whatsapp.net"
    if (!who2) {
     return sock.reply(m.chat, `✿ Debes mencionar al nuevo dueño del bot.\n> Ejemplo: *${prefix + command} @${menti.split('@')[0]}*`, m, { mentions: [menti] })
    }

const anteriorOwner = config.owner
const esCambio = anteriorOwner && anteriorOwner.endsWith('@s.whatsapp.net')

config.owner = who

await updateSettings(idBot, 'owner', config.owner)

const mensaje = esCambio
  ? `✤ El dueño del bot ha sido cambiado de @${anteriorOwner.split('@')[0]} a @${who.split('@')[0]}!`
  : `✤ El nuevo dueño de *${config.namebot2}* es @${who.split('@')[0]}!`

return m.reply(mensaje, {
  mentions: esCambio ? [anteriorOwner, who] : [who]
})
  },
};
