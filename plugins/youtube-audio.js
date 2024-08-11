import fg from 'api-dylux'
import yts from 'yt-search'
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
let limit = 350
let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command }) => {
if (!m.quoted) return conn.reply(m.chat, '🚩 *Etiqueta el mensaje que contenga el resultado de Play*', m, rcanal)
if (!m.quoted.text.includes("*乂  Y O U T U B E  -  P L A Y  乂*")) return conn.reply(m.chat, '🚩 *Etiqueta el mensaje que contenga el resultado de Play*', m, rcanal)
if (!m.quoted.isBaileys) return conn.reply(m.chat, '🚩 Etiqueta el mensaje mío del resultado Play', m, rcanal)
let urls = m.quoted.text.match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))
if (!urls) return m.reply('×')
if (urls.length < text) return conn.reply(m.chat, '🚩 *No se encontraron resultados*', rcanal)
let q = '128kbps'
try {
await m.react(rwait)
const yt = await fg.yta(urls[0], q)
let { title, dl_url, size } = yt 

if (size.split('MB')[0] >= limit) return conn.reply(m.chat, `🚩 El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, rcanal) 

conn.reply(m.chat, `🕒 *Descargando El Audio*`, m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
title: packname,
body: wm,
previewType: 0, thumbnail: icons,
sourceUrl: channel }}})

await conn.sendMessage(m.chat, { audio: { url: dl_url }, fileName: title + '.mp3', mimetype: 'audio/mp4' }, { quoted: fkontak })
await m.react(done)
} catch {
try {
let yt = await fg.ytmp3(urls[0], q)
let { title, size, dl_url } = yt

if (size.split('MB')[0] >= limit) return conn.reply(m.chat, `🚩 El archivo pesa mas de ${limit} MB, se canceló la Descarga.`, m, rcanal) 

await conn.sendMessage(m.chat, { audio: { url: dl_url }, fileName: title + '.mp3', mimetype: 'audio/mp4' }, { quoted: fkontak })
await m.react(done)
} catch {
await m.react(error)
await m.reply(`✘ *Ocurrío un error*`)
}}}
handler.help = ['Audio']
handler.tags = ['descargas']
handler.customPrefix = ['audio','Audio']
handler.command = new RegExp
handler.group = true;
handler.register = true
export default handler
