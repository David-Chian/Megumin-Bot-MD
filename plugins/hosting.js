const handler = async (m, { conn, args }) => {

    const caption = `╭━━━〔 ☕ *Cafirexos Hosting* 〕━━━╮

✦ 🌐 *Sitio Web*  
➤ https://cafirexos.com  
─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪
✦ 👤 *Área de Clientes*  
➤ https://cafirexos.com/clientarea.php  
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

    await conn.reply(m.chat, caption, rcanal, m)

  }
handler.command: ['cafi', 'hosting', 'cafirexos']
export default handler