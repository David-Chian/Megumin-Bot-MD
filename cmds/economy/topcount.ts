import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['topcount', 'topmensajes', 'topmsgcount', 'topmessages'],
  category: 'rpg',
  run: async ({sock, m, args, command, text, prefix}) => {
    const chatId = m.chat
    const chatData = await getChat(m.chat)
    const chatDatas = await getChatUser(m.chat)

    const now = new Date()
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const ranking = (chatDatas || [])
      .map(user => {
        const stats = user.stats || {}
        const days = Object.entries(stats).filter(([date]) => new Date(date) >= cutoff)

        const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0)
        const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0)

        return { jid: user.user_id, totalMsgs, totalCmds }
      })
      .filter(u => u.totalMsgs > 0)
      .sort((a, b) => b.totalMsgs - a.totalMsgs)

    if (ranking.length === 0)
      return m.reply(`「✎」 No hay actividad registrada en los últimos 30 días.`)

    const page = parseInt(args[0]) || 1
    const perPage = 10
    const totalPages = Math.ceil(ranking.length / perPage)

    if (page < 1 || page > totalPages)
      return m.reply(`「✎」 Página inválida. Solo hay ${totalPages} páginas disponibles.`)

    const start = (page - 1) * perPage
    const end = start + perPage
    const pageRanking = ranking.slice(start, end)

    const fechaActual = now.toLocaleString('es-CO', { 
      timeZone: 'America/Bogota', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    let report = `❀ Top de mensajes en los últimos *30* días\n\n`

    for (let i = 0; i < pageRanking.length; i++) {
      const u = pageRanking[i]
      const na = await getUser(u.jid) || {}
      const name = na.name || 'Usuario'
      report += `*${start + i + 1}.* ${name}\n`
      report += `   » Mensajes: \`${u.totalMsgs}\`, Comandos: \`${u.totalCmds}\`\n`
    }

    if (page < totalPages) {
      report += `\n> Para ver la siguiente página › *${prefix + command} ${page + 1}*`
    }

    await sock.reply(chatId, report, m)
  }
}
