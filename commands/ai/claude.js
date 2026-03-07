import axios from 'axios'

export default {
  command: ['claude'],
  category: 'ai',
  run: async (client, m, args, command, text, prefix) => {

    if (!text) {
        return m.reply(`🎋 Escriba una *petición* para que *Claude* le responda.`)
    }

    try {
      const apiUrl = `${api.url}/ai/claude?text=${encodeURIComponent(text)}&key=${api.key}`

     const txc = `🧩 *Claude* está procesando tu respuesta...`;
      const { key } = await client.sendMessage(
        m.chat,
        { text: txc },
        { quoted: m },
      )

      const res = await axios.get(apiUrl)

      if (!res.data?.status || !res.data?.answer) {
        throw new Error('Respuesta inválida del servidor: ' + JSON.stringify(res.data))
      }

      const replyText = res.data.answer
      await client.sendMessage(m.chat, { text: replyText, edit: key })

    } catch (e) {
      await m.reply(`NodeError :: [ ${e} ]`)
    }
  }
}