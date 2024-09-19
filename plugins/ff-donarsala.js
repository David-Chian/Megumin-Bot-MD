let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let b
do b = ps.getRandom()
while (b === a)
m.reply(`*${toM(a)},* Le tocó donar sala el dia de hoy. 😿`, null, {
mentions: [a, b]
})}
handler.help = ['donarsala']
handler.tags = ['ff']
handler.command = ['donarsala']
handler.group = true
export default handler