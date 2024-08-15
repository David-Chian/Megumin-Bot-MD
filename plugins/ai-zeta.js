import fetch from 'node-fetch'

const handler = async (m, { conn, command, args, text }) => {
  if (!text) return conn.reply(m.chat, `*[ ☆ ] Has usado mal el comando.*\n*EJEMPLO:* ${command} HOLA BUENAS :)`, m, rcanal)

  try {
    let response = await fetch(`https://api.kyuurzy.site/api/ai/aizeta?query=${encodeURIComponent(text)}`);
    let zeta = await response.json();

    if (zeta.result && zeta.result.answer) {
      await conn.sendMessage(m.chat, { text: `${zeta.result.answer}` }, { quoted: m })
    } else {
      await conn.reply(m.chat, 'No se obtuvo una respuesta válida de la API.', m, rcanal)
    }
  } catch (e) {
    await conn.reply(m.chat, `Hubo un error al procesar tu solicitud. ${e}`, m, rcanal);
  }
}
handler.tags = ['ai']
handler.help = ['zeta <texto>']
handler.command = ['zeta']
export default handler