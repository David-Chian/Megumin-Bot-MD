const toxicRegex = /g0re|g0r3|g.o.r.e|sap0|sap4|malparido|malparida|malparidos|malparidas|m4lp4rid0|m4lp4rido|m4lparido|malp4rido|m4lparid0|malp4rid0|chocha|chup4la|chup4l4|chupalo|chup4lo|chup4l0|chupal0|chupon|chupameesta|sabandija|hijodelagranputa|hijodeputa|hijadeputa|hijadelagranputa|kbron|kbrona|cajetuda|laconchadedios|putita|putito|put1t4|putit4|putit0|put1to|put1ta|pr0stitut4s|pr0stitutas|pr05titutas|pr0stitut45|prostitut45|prostituta5|pr0stitut45|fanax|f4nax|drogas|droga|dr0g4|nepe|p3ne|p3n3|pen3|p.e.n.e|pvt0|pvto|put0|hijodelagransetentamilparesdeputa|Chingadamadre|coño|c0ño|coñ0|c0ñ0|afeminado|drog4|cocaína|marihuana|chocho|chocha|cagon|pedorro|agrandado|agrandada|pedorra|cagona|pinga|joto|sape|mamar|chigadamadre|hijueputa|chupa|caca|bobo|boba|loco|loca|chupapolla|estupido|estupida|estupidos|polla|pollas|idiota|maricon|chucha|verga|vrga|naco|zorra|zorro|zorras|zorros|pito|huevon|huevona|huevones|rctmre|mrd|ctm|csm|cepe|sepe|sepesito|cepecito|cepesito|hldv|ptm|baboso|babosa|babosos|babosas|feo|fea|feos|feas|mamawebos|chupame|bolas|qliao|imbecil|embeciles|kbrones|cabron|capullo|carajo|gore|gorre|gorreo|gordo|gorda|gordos|gordas|sapo|sapa|mierda|cerdo|cerda|puerco|puerca|perra|perro|dumb|fuck|shit|bullshit|cunt|semen|bitch|motherfucker|foker|fucking/i

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) { 
if (m.isBaileys && m.fromMe)
return !0
if (!m.isGroup)
return !1
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[this.user.jid] || {}
  let img = 'https://telegra.ph/file/516ff7b7c47cbf5b58a38.png'
 const isToxic = toxicRegex.exec(m.text)

if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
user.warn += 1
if (!(user.warn >= 4)) await m.reply(`${user.warn == 1 ? `*@${m.sender.split`@`[0]}*` : `*@${m.sender.split`@`[0]}*`}, 𝙏𝙞𝙚𝙣𝙚𝙨: (${isToxic}) 𝙖𝙙𝙫𝙚𝙧𝙩𝙚𝙣𝙘𝙞𝙖𝙨... 𝙏𝙞𝙚𝙣𝙚𝙨: *${user.warn}/4*\n\n𝙙𝙚 𝙖𝙙𝙫𝙚𝙧𝙩𝙚𝙣𝙘𝙞𝙖𝙨.`, false, { mentions: [m.sender] })}

if (user.warn >= 4) {
user.warn = 0
await m.reply(`'𝙎𝙚𝙧𝙖𝙨 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤  \n*@${m.sender.split`@`[0]}*`, false, { mentions: [m.sender] })
user.banned = true
await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
//await this.updateBlockStatus(m.sender, 'block')
}
return !1
}
export default handler