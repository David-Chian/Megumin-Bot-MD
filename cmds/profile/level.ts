import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['levelup', 'level', 'lvl'],
  category: 'profile',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, sock, m.chat)

    const user = await getUser(who)           // usuario específico
    const allUsers = await getUser() || []    // todos los usuarios

    if (!user)
      return m.reply(`「✎」 El usuario mencionado no está registrado en el bot.`)

    const users = allUsers.map(u => ({
      ...u,
      jid: u.id
    }))

    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    const rank = sortedLevel.findIndex(u => u.jid === who) + 1

    const txt = `*❑ ˳Usuario* ◢ ${user.name || who.split('@')[0]} ◤

𖹭  ׄ  ְ ✿ Experiencia › *${user.exp?.toLocaleString() || 0}*
𖹭  ׄ  ְ ✤ Nivel › *${user.level || 0}*
𖹭  ׄ  ְ ❀ Puesto › *#${rank}*

𖹭  ׄ  ְ ☆ Comandos totales › *${user.usedcommands?.toLocaleString() || 0}*`

    await m.reply(txt)
  }
}
