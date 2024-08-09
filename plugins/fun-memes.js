/* ig : https://www.instagram.com/fg98._/ */
import hispamemes from 'hispamemes'
let handler = async (m, { conn, usedPrefix, command }) => {
const meme = hispamemes.meme()
conn.sendFile(m.chat, meme, '', '', fkontak)
m.react(emoji2)
}
handler.help = ['meme']
handler.tags = ['fun']
handler.command = ['meme', 'memes']
handler.estrellas = 1
handler.group = true;
handler.register = true
export default handler