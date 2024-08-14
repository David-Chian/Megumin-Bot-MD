const free = 25
const prem = 15

var handler = async (m, {conn, isPrems }) => {

let coin = `${pickRandom([5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99, 100, 110, 120, 130, 600, 1000, 1500])}` * 1
let exp = `${pickRandom([500, 600, 700, 800, 900, 999, 1000, 1300, 1500, 1800])}` * 1
let exppremium = `${pickRandom([1000, 1500, 1800, 2100, 2500, 2900, 3300, 3600, 4000, 4500])}` * 1
let d = Math.floor(Math.random() * 30)
global.db.data.users[m.sender].diamond += d
global.db.data.users[m.sender].money += d
let time = global.db.data.users[m.sender].lastclaim + 86400000 //12 Horas
if (new Date - global.db.data.users[m.sender].lastclaim < 7200000) return conn.reply(m.chat, `🕚 *Vuelve en ${msToTime(time - new Date())}*`, m, )
global.db.data.users[m.sender].exp += exppremium ? prem : exp
conn.reply(m.chat, `🎁 *Recompensa Diaria*

Recursos:
✨ Xp : *+${isPrems ? exppremium : exp}*
💎 Diamantes : *+${d}*
❤️‍🔥 MeguCoins : *+${coin}*`, m, )

global.db.data.users[m.sender].lastclaim = new Date * 1

}
handler.help = ['daily', 'claim']
handler.tags = ['rpg']

handler.command = ['daily', 'claim']

handler.group = true;
handler.register = true

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]}

function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds

return hours + ' Horas ' + minutes + ' Minutos'
}