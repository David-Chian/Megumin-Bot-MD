import fetch from 'node-fetch'

export default {
  command: ['nsfwaigen', 'aigensfw', 'pornogen'],
  category: 'ai',
  run: async ({client, m, text, usedPrefix, command}) => {
    
  if (!db.data.chats[m.chat].nsfw) {
    return m.reply('✧ Los comandos de *NSFW* están desactivados en este grupo.')
  }

  if (!text) {
    return m.reply(`✧ Ingresa un prompt para generar una imagen NSFW.\n\n📌 Ejemplo:\n${usedPrefix + command} Megumin tomando un baño`)
  }

  await client.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
  await client.reply(m.chat, '⊹ Generando tu imagen NSFW, espera un momento...', m)

  const fetchImage = async (version, prompt) => {
    const url = `https://api.nekolabs.web.id/image-generation/wai-nsfw-illustrous/v${version}?prompt=${encodeURIComponent(prompt)}&ratio=16%3A9`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
    const data = await res.json()
    if (!data?.success || !data?.result) throw new Error(`API v${version} no devolvió imagen`)
    return data.result
  }

  try {
    let imageUrl
    try {
      imageUrl = await fetchImage(12, text)
    } catch (e) {
      imageUrl = await fetchImage(11, text)
    }

    if (!imageUrl) throw new Error('No se pudo generar la imagen NSFW')

    await client.sendMessage(
      m.chat,
      { image: { url: imageUrl }, caption: `🔞 Imagen generada con IA (NSFW)` },
      { quoted: m }
    )
    await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    await client.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    m.reply(`❌ Error: ${e.message}`)
  }
}}