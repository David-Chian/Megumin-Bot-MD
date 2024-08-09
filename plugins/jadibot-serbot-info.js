import ws from 'ws'

async function handler(m, { conn: stars, usedPrefix }) {
  let uniqueUsers = new Map()

  global.conns.forEach((conn) => {
    if (conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED) {
      uniqueUsers.set(conn.user.jid, conn)
    }
  })

  let users = [...uniqueUsers.values()]

  let message = users.map((v, index) => `╭─⬣「 ${packname} 」⬣\n│⁖ฺ۟̇࣪·֗٬̤⃟🌸 *${index + 1}.-* @${v.user.jid.replace(/[^0-9]/g, '')}\n│❀ *Link:* https://wa.me/${v.user.jid.replace(/[^0-9]/g, '')}\n│❀ *Nombre:* ${v.user.name || '𝚂𝚄𝙱-𝙱𝙾𝚃'}\n╰─⬣`).join('\n\n')

  let replyMessage = message.length === 0 ? '' : message
  global.totalUsers = users.length
  let responseMessage = `╭━〔 𝗦𝗨𝗕-𝗕𝗢𝗧𝗦 𝗝𝗔𝗗𝗜𝗕𝗢𝗧 🤍 〕⬣\n┃ *𝚃𝙾𝚃𝙰𝙻 𝙳𝙴 𝚂𝚄𝙱𝙱𝙾𝚃𝚂* : ${totalUsers || '0'}\n╰━━━━━━━━━━━━⬣\n\n${replyMessage.trim()}`.trim()

await stars.sendMessage(m.chat, { text: responseMessage, mentions: stars.parseMention(responseMessage) }, { quoted: fkontak })
// await conn.reply(m.chat, responseMessage, m, rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['jadibot']
export default handler