export default {
  command: ['ping', 'p'],
  category: 'info',
  run: async ({sock, m}) => {
    const start = Date.now()
    const sent = await sock.sendMessage(m.chat, { text: '`❏ ¡Pong!`' + `\n> *${await getSettings(sock.user.id.split(':')[0] + "@s.whatsapp.net").namebot}*`}, { quoted: m })
    const latency = Date.now() - start

    await sock.sendMessage(m.chat, {
      text: `✿ *Pong!*\n> Tiempo ⴵ ${latency}ms`,
      edit: sent.key
    }, { quoted: m })
  },
};
