import { ai } from 'cloudst'

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async ({ client, m, args }) => {
    const text = args.join(' ').trim()

    if (!text) {
      return m.reply(`💣 Escriba una *petición* para que *ChatGPT* le responda.`)
    }

    try {
      const txc = `⚠️ *ChatGPT* está procesando tu respuesta...`
      const { key } = await client.sendMessage(
        m.chat,
        { text: txc },
        { quoted: m },
      )

      const res = await ai.chat(text)

      if (!res || !res.result) {
        return client.reply(m.chat, 'No se pudo obtener una *respuesta* válida')
      }

      const response = `${res.result}`.trim()
      await client.sendMessage(m.chat, { text: response, edit: key })
    } catch (error) {
      console.error(error)
      await m.reply('🌱 Hubo un problema al procesar tu petición.')
    }
  },
}