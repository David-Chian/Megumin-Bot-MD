import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

async function nekolabsIA({ query, prompt, sessionId, imageUrl = null }) {
  const models = ['gpt/5-nano', 'gpt/4.1-nano']
  let lastError = null

  for (const model of models) {
    try {
      let url = `https://api.nekolabs.web.id/text-generation/${model}` +
        `?text=${encodeURIComponent(query)}` +
        `&systemPrompt=${encodeURIComponent(prompt)}` +
        `&sessionId=${encodeURIComponent(sessionId)}`

      if (imageUrl) {
        url += `&imageUrl=${encodeURIComponent(imageUrl)}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Status ${res.status}`)

      const json = await res.json()
      const result = json?.result || json?.data?.result || json?.message

      if (result) return result.trim()
    } catch (e) {
      lastError = e
    }
  }

  throw lastError || new Error('Sin respuesta de la IA')
}

export default {
  command: ['ia', 'megumin', 'chatgpt'],
  category: 'utils',
  run: async ({ client, m, usedPrefix, command, text }) => {

    const username = global.db.data.users[m.sender]?.name || 'aventurero'
    const sessionId = `${m.sender}-${m.chat}`

    const basePrompt = `
Eres Megumin-Bot, divertida, excéntrica y obsesionada con las explosiones.
Hablas con entusiasmo, dramatismo y humor exagerado.
Menciona a ${username} cuando sea natural.
Nunca ejecutes comandos con prefijos (/ . # * @).
Siempre incluye referencias explosivas.
Lenguaje: español coloquial, teatral y divertido.
`

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
        `💥 *¡Explosión de ideas incompleta!* 💥\n\nEjemplo:\n${usedPrefix + command} ¿Qué es una supernova?`,
        m
      )
    }

    const query = imageUrl
      ? 'Describe la imagen y dime quién eres'
      : text

    try {
      const { key } = await client.sendMessage(
        m.chat,
        { text: '💣 Cargando explosión intelectual...' },
        { quoted: m }
      )

      const response = await nekolabsIA({
        query,
        prompt: basePrompt,
        sessionId,
        imageUrl
      })

      await client.sendMessage(
        m.chat,
        { text: response, edit: key }
      )

    } catch (err) {
      console.error(err)
      await client.reply(
        m.chat,
        '💥 *¡La explosión falló!* Intenta otra vez.',
        m
      )
    }
  }
}