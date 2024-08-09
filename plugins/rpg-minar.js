let cooldowns = {}

let handler = async (m, { conn }) => {
let dinero = Math.floor(Math.random() * 5000)
let tiempo = 5 * 60
if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
conn.reply(m.chat, `🍟 Hola ${nombre}, Ya has minado recientemente, espera ⏱️ *${tiempo2}* para regresar a la Mina.`, m, rcanal)
return
}
global.db.data.users[m.sender].exp += dinero
let minar = `🚩 Genial! minaste *${dinero} 💫 XP.*`
await m.react('⛏️')
await conn.reply(m.chat, minar, m, rcanal)
cooldowns[m.sender] = Date.now()}

handler.help = ['minar']
handler.tags = ['rpg']
handler.command = ['minar', 'miming', 'mine'] 
handler.group = true;
handler.register = true
export default handler

function segundosAHMS(segundos) {
let horas = Math.floor(segundos / 3600)
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}