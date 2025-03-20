let handler = async (m, { conn, usedPrefix, command }) => {
if (!m.quoted) return conn.reply(m.chat, `🤍 Responde a un *Video.*`, m)
const q = m.quoted || m
let mime = (q.msg || q).mimetype || ''
if (!/(mp4)/.test(mime)) return conn.reply(m.chat, `🤍 Responde a un *Video.*`, m)
let media = await q.download()
conn.sendMessage(m.chat, { video: media, gifPlayback: true, caption: '*Listo* 💣' }, { quoted: m })
}
handler.help = ['togifaud']
handler.tags = ['transformador']
handler.register = true
handler.command = ['togifaud']
export default handler