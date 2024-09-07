let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
let users = global.db.data.users
let senderId = m.sender
let senderName = conn.getName(senderId)

let tiempo = 5 * 60
if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
m.reply(`🍟 Ya has cometido un Crimen recientemente, espera ⏱️ *${tiempo2}* para cometer tu próximo Crimen y evitar ser atrapado.`)
return
}
cooldowns[m.sender] = Date.now()
let senderCookies = users[senderId].cookies || 0
let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
while (randomUserId === senderId) {
randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]}
let randomUserCookies = users[randomUserId].cookies || 0
let minAmount = 15
let maxAmount = 50
let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
let randomOption = Math.floor(Math.random() * 3)
switch (randomOption) {
case 0:
users[senderId].cookies += amountTaken
users[randomUserId].cookies -= amountTaken
conn.sendMessage(m.chat, {
text: `🚩¡Lograste cometer tu crimen con exito!, acabas de robar *${amountTaken} Cookies 🍪* a @${randomUserId.split("@")[0]}\n\nSe suman *+${amountTaken} Cookies 🍪* a ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
case 1:
let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCookies - minAmount + 1)) + minAmount, maxAmount)
users[senderId].cookies -= amountSubtracted
conn.reply(m.chat, `🚩 No fuiste cuidadoso y te atraparon mientras cometias tu cirme, se restaron *-${amountSubtracted} Cookies 🍪* a ${senderName}.`, m, rcanal)
break
case 2:
let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCookies / 2 - minAmount + 1)) + minAmount, maxAmount)
users[senderId].cookies += smallAmountTaken
users[randomUserId].cookies -= smallAmountTaken
conn.sendMessage(m.chat, {
text: `🚩 Lograste cometer tu crimen con exito, pero te descubrieron y solo lograste tomar *${smallAmountTaken} Cookies 🍪* de @${randomUserId.split("@")[0]}\n\nSe suman *+${smallAmountTaken} Cookies 🍪* a ${senderName}.`,
contextInfo: { 
mentionedJid: [randomUserId],
}}, { quoted: m })
break
}
global.db.write()}

handler.tags = ['rpg']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
let horas = Math.floor(segundos / 3600)
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}