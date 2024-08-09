import db from '../lib/database.js'

let handler = async (m, { args }) => {
let user = global.db.data.users[m.sender]
if (!args[0]) return m.reply('🚩 Ingresa la cantidad de *⭐ Estrellas* que deseas Depositar.')
if ((args[0]) < 1) return m.reply('🚩 Ingresa una cantidad válida de *⭐ Estrellas.')
if (args[0] == 'all') {
let count = parseInt(user.estrellas)
user.estrellas -= count * 1
user.bank += count * 1
await m.reply(`Depositaste *${count} ⭐ Estrellas* al Banco.`)
return !0
}
if (!Number(args[0])) return m.reply('🚩 La cantidad deve ser un Numero.')
let count = parseInt(args[0])
if (!user.estrellas) return m.reply('No tienes *⭐ Estrellas* en la Cartera.')
if (user.estrellas < count) return m.reply(`Solo tienes *${user.estrellas} ⭐ Estrellas* en la Cartera.`)
user.estrellas -= count * 1
user.bank += count * 1
await m.reply(`Depositaste *${count} ⭐ Estrellas* al Banco.`)}

handler.help = ['depositar']
handler.tags = ['rpg']
handler.command = ['deposit', 'depositar', 'dep', 'aguardar']
handler.group = true;
handler.register = true
export default handler 