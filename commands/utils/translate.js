import fetch from 'node-fetch';

export default {
  command: ['translate'],
  category: 'utils',
  run: async ({client, m, args}) => {
    const quoted = m.quoted ? m.quoted : m
    const txt = args.slice(1).join(' ')
    const text = txt || quoted.text?.split(' ').join(' ')
    const language = args[0] || 'es'

    if (!args[0] && !m.quoted)
      return m.reply(
        '《✧》 Ingresa el idioma seguido del texto que quieras traducir.'
      )

    const translateAPI = `https://delirius-apiofc.vercel.app/tools/translate?text=${encodeURIComponent(text)}&language=${language}`

    try {
      const res = await fetch(translateAPI)
      const json = await res.json()

      if (!json?.data) return m.reply('《✧》 No se pudo traducir el texto.')

      await client.sendMessage(m.chat, { text: json.data }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  },
};
