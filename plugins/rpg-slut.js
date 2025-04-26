let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
let users = global.db.data.users
let senderId = m.sender
let senderName = conn.getName(senderId)

let tiempo = 5 * 60
if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
m.reply(`🍟 Ya Te Has Postituido Recientemente, Espera ⏱️ *${tiempo2}* Para Volver A Las Calles Y Evitar Destruir Tu culo.`)
return
}
cooldowns[m.sender] = Date.now()
let senderCoo = users[senderId].chocolates || 0
let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
while (randomUserId === senderId) {
randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]}
let randomUserCoo = users[randomUserId].chocolates || 0
let minAmount = 15
let maxAmount = 50
let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
let randomOption = Math.floor(Math.random() * 3)
switch (randomOption) {
case 0:
users[senderId].chocolates += amountTaken
users[randomUserId].chocolates -= amountTaken
conn.sendMessage(m.chat, {
text: `🚩¡Te Postituiste Y Ganaste *${amountTaken} Chocolates 🍫* Dejaste Casi Seco A @${randomUserId.split("@")[0]}\n\nSe suman *+${amountTaken} Chocolates 🍫* a ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
case 1:
let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoo - minAmount + 1)) + minAmount, maxAmount)
users[senderId].chocolates -= amountSubtracted
conn.reply(m.chat, `🚩 Le Rompiste La Verga A Tu Cliente Te Cobro Y Se Te Quitan *-${amountSubtracted} Chocolates 🍫* a ${senderName}.`, m, rcanal)
break
case 2:
let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserDolares / 2 - minAmount + 1)) + minAmount, maxAmount)
users[senderId].chocolates += smallAmountTaken
users[randomUserId].chocolates -= smallAmountTaken
conn.sendMessage(m.chat, {
text: `🚩 Vuelves A Las Calles Y Te Vas A Un Motel Te Paga ${smallAmountTaken} Chocolates 🍫* de @${randomUserId.split("@")[0]}\n\nSe suman *+${smallAmountTaken} Chocolates 🍫* a ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
}
global.db.write()}

handler.tags = ['rpg']
handler.help = ['slut']
handler.command = ['slut', 'prostituirse']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
let horas = Math.floor(segundos / 3600)
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}