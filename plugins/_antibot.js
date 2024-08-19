async function before(m, { isAdmin, isBotAdmin }) {
let chat = global.db.data.chats[m.chat]
if (chat.antiBot) {
if (m.isBaileys === true) {
if (m.fromMe || !isBotAdmin) {                 
} else {
conn.sendMessage(m.chat, { text: `\`💥 Anti Bots\`\n\n*𝐻𝑜𝑙𝑎 @${m.sender.split("@")[0]}, 𝑝𝑎𝑟𝑒𝑐𝑒 𝑞𝑢𝑒 𝑒𝑟𝑒𝑠 𝑢𝑛 𝐵𝑜𝑡, 𝑠𝑒𝑟𝑎𝑠 𝑒𝑙𝑖𝑚𝑖𝑛𝑎𝑑𝑜*` })
conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
}
}
}
return
}

module.exports = { before }