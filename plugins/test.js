import ytSearch from "yt-search"
const handler = async (m, { conn, usedPrefix, args, command }) => {
try {
const text = args.length >= 1 ? args.slice(0).join(" ") : (m.quoted && m.quoted?.text || m.quoted?.caption || m.quoted?.description) || null
    
if (!text) return m.reply(`> Ejemplo: ${usedPrefix + command} hislerim`)
    
const { all: [bestItem, ...moreItems] } = await ytSearch(text)
const videoItems = moreItems.filter(item => item.type === 'video')
const formattedData = {
      title: `╭ׅׄ̇─͓̗̗─ׅ̻ׄ╮۪̇߭⊹߭̇︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇⊹۪̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭︹ׅ̟ׄ̇︹ׅ۪ׄ̇߭̇⊹\n┟─⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪🅳🄴🅂🄲🄰🅁🄶🄰🅂໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪╮\n╭┄─🍂⬪࣪ꥈ𑁍⃪࣭۪ٜ݊݊݊݊݊໑ٜ࣪🅼🄴🄶🅄🄼🄸🄽໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪╯\n│\n├ ⚘݄𖠵⃕⁖𖥔. _*🅃𝕚𝕥𝕦𝕝𝕠*_\n├» ${bestItem.title}\n├╌╌╌╌╌╌╌╌╌╌╌╌┈\n├ ⚘݄𖠵⃕⁖𖥔. _*🄳𝕦𝕣𝕒𝕔𝕚𝕠𝕟*_\n├» ${bestItem.timestamp}\n├╌╌╌╌╌╌╌╌┈\n├ ⚘݄𖠵⃕⁖𖥔. _*🄴𝕟𝕝𝕒𝕔𝕖*_\n├» ${bestItem.url}\n╰ׁ̻۫─۪۬─۟─۪─۫─۪۬─۟─۪─۟─۪۬─۟─۪─۟─۪۬─۟─۪─۟┄۪۬┄۟┄۪┈۟┈۪`,
      rows: [
        { title: 'Opción 2: Audio', id: `${usedPrefix}play.1 ${yt_play[0].url}` },
        { title: 'Opción 3: Audio DOC', id: `${usedPrefix}ytmp3doc ${yt_play[0].url}` },
        { title: 'Opción 2: Video', id: `${usedPrefix}play.2 ${yt_play[0].url}` },
        { title: 'Opción 3: Video DOC', id: `${usedPrefix}ytmp4doc ${yt_play[0].url}` }
      ]
    };
const emojiMap = {
type: "🎥",
videoId: "🆔",
url: "🔗",
title: "📺",
description: "📝",
image: "🖼️",
thumbnail: "🖼️",
seconds: "⏱️",
timestamp: "⏰",
ago: "⌚",
views: "👀",
author: "👤"
}
    
const caption = Object.entries(bestItem).map(([key, value]) => {
const formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
const valueToDisplay = key === 'views' ? new Intl.NumberFormat('en', { notation: 'compact' }).format(value) : key === 'author' ? `Nombre: ${value.name || 'Desconocido'}\nURL: ${value.url || 'Desconocido'}` : value || 'Desconocido';
return ` ${emojiMap[key] || '🔹'} *${formattedKey}:* ${valueToDisplay}`}).join('\n')

await conn.sendButtonMessages(m.chat, [
[formattedData.title, nn, bestItem.image || logo, [
['video', usedPrefix + `ytv ${bestItem.url}`], ['Doc.mp3', usedPrefix + `ytadoc ${bestItem.url}`], ['Doc.mp4', usedPrefix + `ytdoc ${bestItem.url}`]
], null, [
['Ver Canal', canal]
],
[["Ver Lista", formattedData.rows]]
]], m)

} catch (error) {
console.error(error)
conn.reply(m.chat, `Ocurrió un error.`, m)
}
}
