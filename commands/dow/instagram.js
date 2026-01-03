import fetch from 'node-fetch';

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: async (client, m, args, command) => {

    const url = args[0]

    if (!url) {
      return m.reply('💣 Ingrese un enlace de *Instagram*.')
    }

    if (!url.match(/instagram\.com\/(p|reel|share|tv)\//)) {
      return m.reply('💣 El enlace no parece *válido*. Asegúrate de que sea de *Instagram*')
    }

    try {
      const res = await fetch(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
      const json = await res.json()

      if (!json.status || !json.data || !json.data.dl) {
        return client.reply(m.chat, '💣 No se pudo *obtener* el contenido', m)
      }

      const { title, like, comment, type, dl } = json.data
      const caption = `ೀ܀⊹˙┆✽ " *Iᘜ ᗪ᥆ᥕᥒᥣ᥆ᥲძ* 𝜗𝜚┆˙⊹܀ೀ

⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Titulo* › ${title}
⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Likes* › ${like}
⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Comentarios* › ${comment}
⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Tipo* › ${type}
⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Enlace* › ${url}
`.trim()

      await client.sendMessage(
        m.chat,
        {
          [type]: { url: dl },
          caption
        },
        { quoted: m }
      )

    } catch (e) {
     // console.error(e)
      await client.reply(m.chat, msgglobal, m)
    }
  }
};