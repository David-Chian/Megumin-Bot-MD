import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['count', 'mensajes', 'messages', 'msgcount'],
  category: 'rpg',
  run: async ({sock, m, args, command, text, prefix}) => {
    const chatId = m.chat
    const chatData = await getChat(m.chat)

    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, sock, m.chat)

   const user = await getChatUser(m.chat, who)
    if (!user)
      return m.reply(`「✎」 El usuario mencionado no está registrado en el bot.`)

    const userStats = user.stats || {}
    const now = new Date()
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const days = Object.entries(userStats)
      .filter(([date]) => new Date(date) >= cutoff)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))

    const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
    const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

    let report = `❀ Contador de mensajes de @${who.split('@')[0]}\n`
    report += `> Total en los últimos *30* días: \`${totalMsgs}\` mensajes\n\n`

    for (const [date, d] of days) {
      const fecha = new Date(date).toLocaleDateString('es-CO', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        timeZone: 'America/Bogota' 
      })
      report += `*❏ ${fecha}*\n`
      report += `\t» Mensajes: \`${d.msgs || 0}\`, Comandos: \`${d.cmds || 0}\`\n`
    }

await sock.reply(
  chatId,
  report,
  m,
  { mentions: [who] }
)
  }
}
