import axios from 'axios'

export default {
  command: ['text2vid', 't2v'],
  category: 'ai',
  run: async ({ sock, m, args, usedPrefix, command }) => {
    const text = args.join(' ')

    if (!text) {
      return sock.reply(
        m.chat,
        `Ejemplo:\n${usedPrefix}${command} cewe cantik sedang masak`,
        m,
        m.rcanal
      )
    }

    try {
      await sock.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

      const { data } = await axios.get(
        'https://api.theresav.biz.id/ai/text2vid',
        {
          params: {
            prompt: text,
            apikey: 'ZvQkB'
          }
        }
      )

      if (!data?.status || !data?.result?.video_url) {
        throw new Error('Video gagal dibuat')
      }

      const caption = [
        '🎬 Text To Video',
        '',
        `📝 Prompt: ${data.result.prompt}`,
        `🔞 Safe: ${data.result.safe ? 'Yes' : 'No'}`
      ].join('\n')

      await sock.sendMessage(
        m.chat,
        {
          video: { url: data.result.video_url },
          caption
        },
        { quoted: m }
      )

      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.log(JSON.stringify(e?.response?.data || e))

      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await sock.reply(
        m.chat,
        e?.response?.data?.message || e?.message || 'Ocurrió un error',
        m,
        m.rcanal
      )
    }
  }
}