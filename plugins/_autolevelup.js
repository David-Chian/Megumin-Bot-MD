/*import { canLevelUp, xpRange } from '../lib/levelling.js'
import { levelup } from '../lib/canvas.js'
export function before(m, { conn }) {

let user = global.db.data.users[m.sender]
let chat = global.db.data.chats[m.chat]
if (!chat.autolevelup)
return !0

let before = user.level * 1
while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
 if (before !== user.level) {

conn.reply(m.chat, `🚩 *SUBISTE DE NIVEL*\n\n🍟 *Nuevo Nivel:* ${user.level}\n✨️ *Nivel Anterior:* ${before}\n🍭 *Rango:* ${user.role}\n🗓 *Fecha:* ${new Date().toLocaleString('id-ID')}`.trim(),m, rcanal, )
    }
}*/