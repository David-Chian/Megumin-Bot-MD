import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  run: async ({sock, m, args, command}) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const text = args.join(' ').toLowerCase()
    if (!text) {
      return m.reply(`✎ Escriba una *petición* para que *ChatGPT* le responda.`)
    }

    const apiUrl = `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`

    try {
      const { key } = await sock.sendMessage(
        m.chat,
        { text: '✎ *ChatGPT* está procesando tu respuesta...' },
        { quoted: m },
      )

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json || !json.result) {
        return sock.reply(m.chat, '✎ No se pudo obtener una *respuesta* válida')
      }

      const response = `${json.result}`.trim()

      const userAskedCode = /(codigo|code|programa|script|actualiza|edita)/i.test(text)

      const looksLikeCode = /function|class|const|let|var|=>|\{|\}|console\.log/i.test(response)

      if (userAskedCode || looksLikeCode) {
        let language = 'javascript'
        if (/typescript/i.test(text) || /typescript/i.test(response)) language = 'typescript'
        else if (/python/i.test(text) || /def |import |print\(/i.test(response)) language = 'python'
        else if (/html/i.test(text) || /<html>|<div>|<span>/i.test(response)) language = 'html'
        else if (/css/i.test(text) || /\{.*\}/i.test(response) && /color|margin|padding|font/i.test(response)) language = 'css'

        await sock.sendCodeMessage(
          m.chat,
          dev,
          language,
          response,
          m
        )
      } else {
        await sock.sendMessage(m.chat, { text: response, edit: key })
      }
    } catch (error) {
      console.error(error)
      await m.reply(msgglobal)
    }
  },
};