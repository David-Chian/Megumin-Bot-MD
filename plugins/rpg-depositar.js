import db from '../lib/database.js'

let handler = async (m, { args }) => {
let user = global.db.data.users[m.sender]
if (!args[0]) return m.reply('🚩 Ingresa la cantidad de *Cookies 🍪* que deseas Depositar.')
if ((args[0]) < 1) return m.reply('🚩 Ingresa una cantidad válida de *Cookies 🍪*.')
if (args[0] == 'all') {
let count = parseInt(user.cookies)
user.cookies -= count * 1
user.bank += count * 1
await m.reply(`Depositaste *${count} Cookies 🍪* al Banco.`)
return !0
}
if (!Number(args[0])) return m.reply('🚩 La cantidad deve ser un Numero.')
let count = parseInt(args[0])
if (!user.cookies) return m.reply('No tienes *Cookies 🍪* en la Cartera.')
if (user.cookies < count) return m.reply(`Solo tienes *${user.cookies} Cookies 🍪* en la Cartera.`)
user.cookies -= count * 1
user.bank += count * 1
await m.reply(`Depositaste *${count} Cookies 🍪* al Banco.`)}

handler.help = ['depositar']
handler.tags = ['rpg']
handler.command = ['deposit', 'depositar', 'dep', 'aguardar']
handler.group = true;
handler.register = true
export default handler 