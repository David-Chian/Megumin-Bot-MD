import ytSearch from "yt-search"
const handler = async (m, { conn, usedPrefix, args, command }) => {
try {
const text = args.length >= 1 ? args.slice(0).join(" ") : (m.quoted && m.quoted?.text || m.quoted?.caption || m.quoted?.description) || null
    
if (!text) return m.reply(`> Ejemplo: ${usedPrefix + command} hislerim`)
    
const { all: [bestItem, ...moreItems] } = await ytSearch(text)
const videoItems = moreItems.filter(item => item.type === 'video')
const formattedData = {
title: `\`YOUTUBE SEARCH\`\n\n> Lo más popular de: *${text}*\n*📀Título:* ${bestItem.title}\n*🔗URL:* ${bestItem.url}\n*🕒Duración:* ${bestItem.timestamp}\n\n\`Se muestran más resultados en Ver Lista...\``,
rows: [{
title: "YT",
highlight_label: "Popular",
rows: [{
header: bestItem.title,
id: `${usedPrefix}yta ${bestItem.url}`,
title: wait,
description: ""
}]
}, {
title: "Más",
rows: videoItems.map(({
title,
url,
description
}, index) => ({
header: `${index + 1}). ${title}`,
id: `.yta ${url}`,
title: description,
description: ""
}))
}]
}
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
[formattedData.title, packname, bestItem.image || logo, [
['video', usedPrefix + `ytv ${bestItem.url}`], ['Doc.mp3', usedPrefix + `ytadoc ${bestItem.url}`], ['Doc.mp4', usedPrefix + `ytdoc ${bestItem.url}`]
], null, [
['Ver Canal', cn]
],
[["Ver Lista", formattedData.rows]]
]], m)

} catch (error) {
console.error(error)
conn.reply(m.chat, `Ocurrió un error.${error}`, m)
}
}

handler.command = ['test3']
export default handler