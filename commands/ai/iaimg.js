import fetch from 'node-fetch';

export default {
  command: ['iaimg', 'dalle'],
  category: 'ai',

  run: async ({ client, m, text, command }) => {
    if (!text) {
      return m.reply(
        `🎨 *Generador de Imágenes IA*\n\n` +
        `Uso:\n` +
        `/${command} descripción | resolución(opcional)\n\n` +
        `Ejemplos:\n` +
        `• /${command} una chica anime | 1\n` +
        `• /${command} dragón de fuego\n\n` +
        `Resoluciones:\n` +
        `1 = 1:1\n` +
        `2 = 16:9\n` +
        `3 = 9:16`
      )
    }

    let [prompt, resInput] = text.split('|').map(v => v.trim())

    const ratios = {
      '1': '1:1',
      '2': '16:9',
      '3': '9:16'
    }

    let ratio
    if (resInput && ratios[resInput]) {
      ratio = ratios[resInput]
    } else {
      const random = Object.values(ratios)
      ratio = random[Math.floor(Math.random() * random.length)]
    }

    await m.reply('🧠 Generando imagen con IA...\n⏳ Por favor espera')

    try {
      const apiUrl =
        `https://api.nekolabs.web.id/image-generation/illustrious/me-v6` +
        `?prompt=${encodeURIComponent(prompt)}` +
        `&ratio=${encodeURIComponent(ratio)}`

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json.success) throw 'API Error'

      await client.sendMessage(
        m.chat,
        {
          image: { url: json.result },
          caption:
            `✨ *Imagen generada con IA*\n` +
            `${dev}`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply('❌ No se pudo generar la imagen, intenta nuevamente')
    }
  }
}