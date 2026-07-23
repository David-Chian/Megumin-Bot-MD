// ♡
export default {
  command: ['cafi', 'hosting', 'cafirexos'],
  category: 'info',
  run: async ({sock, m, args}) => {

    const caption = `╭━━━〔 ☕ *Cafirexos Hosting* 〕━━━╮

✦ 🌐 *Sitio Web*  
➤ https://cafirexos.com  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 👤 *Área de sockes*  
➤ https://cafirexos.com/sockarea.php  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 🖥️ *Panel de Control*  
➤ https://panel.cafirexos.com  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 📊 *Estado de Servicios*  
➤ https://estado.cafirexos.com  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 📢 *Canal Oficial de WhatsApp*  
➤ https://links.cafirexos.com/whatsapp/canal  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 🛠️ *Soporte Técnico*  
➤ https://cafirexos.com/contactenos  

╰━━━〔 ✨ Calidad • Estabilidad • Soporte ✨ 〕━━━╯`;

    await sock.reply(m.chat, caption, m, rcanal)

  }}