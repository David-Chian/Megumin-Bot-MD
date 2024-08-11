let handler = async (m, { conn, command, usedPrefix }) => {
let txt = `🚩 *O L Y M P U S - H O S T* 

*¿Quieres un Host de calidad y con bajos precios?*
Pues te presento a *OlympusHost*, un hosting de calidad con servidores dedicados y precios por debajo de 1USD, estos servidores están destinados a ofrecerte un Uptime 24/7 para que puedas alojar tus proyectos y qué estos funcionen de manera eficaz.

🟢 \`\`\`Información del Host\`\`\`

🔮 *Dashboard:* 
• https://dash.olympus-host.xyz

🧃 *Panel:*
• https://panel.olympus-host.xyz

💥 *Canal:*
• https://whatsapp.com/channel/0029ValCkNT2ER6gHWFRQ71J

⚜️ *Contacto (Mateo)*
https://wa.me/593979133620

> *Únete a está comunidad y disfruta de un servicio de calidad :D*` 
await conn.sendMessage(m.chat, { text: txt,
contextInfo:{
forwardingScore: 9999999,
isForwarded: false, 
"externalAdReply": {
"showAdAttribution": true,
"containsAutoReply": true,
title: `🔵 O L Y M P U S - H O S T 🔵`,
body: `⚜️ Super Hosting 24/7 ⚜️`,
"previewType": "PHOTO",
thumbnailUrl: 'https://qu.ax/waCu.jpg', 
sourceUrl: 'https://dash.olympus-host.xyz'}}},
{ quoted: fkontak})
}
handler.tags =['main'] 
handler.help = ['host', 'hosting'] 
handler.command = ['host', 'olympus', 'olympushost', 'hosting']
export default handler