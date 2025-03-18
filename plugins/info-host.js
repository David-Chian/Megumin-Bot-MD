let handler = async (m, { conn, command, usedPrefix }) => {
let txt = `*S K Y - U L T R A - P L U S* 

*¿Quieres un Host de calidad y con bajos precios?*
Pues te presento a *SkyUltraPlus*, un hosting de calidad con servidores dedicados y precios por debajo de 1USD, estos servidores están destinados a ofrecerte un Uptime 24/7 para que puedas alojar tus proyectos y qué estos funcionen de manera eficaz.

🟢 \`\`\`Información del Host\`\`\`

🔮 *Dashboard:* 
• https://dash.skyultraplus.com

🧃 *Panel:*
• https://panel.skyultraplus.com


> *Únete y disfruta de un servicio de calidad :D*` 
await conn.sendMessage(m.chat, { text: txt,
contextInfo:{
forwardingScore: 9999999,
isForwarded: false, 
"externalAdReply": {
"showAdAttribution": true,
"containsAutoReply": true,
title: `☁ S K Y - U L T R A ☁`,
body: `⚜️ Super Hosting 24/7 ⚜️`,
"previewType": "PHOTO",
thumbnailUrl: 'https://files.catbox.moe/62pqnw.jpg', 
sourceUrl: 'https://www.skyultraplus.com'}}},
{ quoted: fkontak})
}
handler.tags =['main'] 
handler.help = ['host', 'hosting'] 
handler.command = ['host', 'skyultraplus', 'skyhost', 'hosting']
export default handler