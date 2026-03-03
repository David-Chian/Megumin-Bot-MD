import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

async function kitsuIA({ query, prompt, imageUrl = null }) {
  try {
    const fullPrompt = `${prompt}\n\nUsuario dice: ${query}`
    let url = `https://www.kitsulabs.xyz/api/v1/copilot?model=gpt-5&prompt=${encodeURIComponent(fullPrompt)}` 
 
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error en API: ${res.status}`)

    const json = await res.json()
    
    if (json.status && json.data && json.data.text) {
      return json.data.text.trim()
    } else {
      throw new Error('Estructura de respuesta inesperada')
    }
  } catch (e) {
    throw e
  }
}

export default {
  command: ['ia', 'megumin', 'chatgpt'],
  category: 'utils',

  run: async ({ client, m, usedPrefix, command, text }) => {
    const username = global.db?.data?.users[m.sender]?.name || 'aventurero'
    
    const basePrompt = `Eres Megumin-Bot. Hablas con entusiasmo y de forma teatral. 
Menciona a ${username} de forma natural. 
No uses prefijos de comandos. Lenguaje: español coloquial y divertido.`

    let imageUrl = null
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (/^image\//.test(mime)) {
      const media = await q.download()
      if (media) imageUrl = await uploadImage(media)
    }

    if (!text && !imageUrl) {
      return client.reply(
        m.chat,
        `💥 *¡Escribe un mensaje o pregunta algo!* 💥\n\nEjemplo:\n${usedPrefix + command} ¿Cuál es tu hechizo favorito?`,
        m
      )
    }

    const query = imageUrl 
      ? `[Imagen enviada] ${text || 'Describe esta imagen'}` 
      : text

    try {
      const { key } = await client.sendMessage(
        m.chat, 
        { text: '💣 Procesando respuesta...' }, 
        { quoted: m }
      )

      const response = await kitsuIA({
        query,
        prompt: basePrompt,
        imageUrl
      })

      await client.sendMessage(m.chat, { text: response, edit: key })

    } catch (err) {
      console.error(err)
      await client.reply(
        m.chat,
        '💥 *¡ERROR CRÍTICO!* Mis circuitos han explotado. Intenta de nuevo.',
        m
      )
    }
  }
}
