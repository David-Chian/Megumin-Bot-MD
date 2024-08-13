import fs from 'fs'
import acrcloud from 'acrcloud'
let acr = new acrcloud({
host: 'identify-eu-west-1.acrcloud.com',
access_key: 'c33c767d683f78bd17d4bd4991955d81',
access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})
let handler = async (m) => {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (/audio|video/.test(mime)) { if ((q.msg || q).seconds > 20) return m.reply('᥀·࣭࣪̇˖⚙️◗ 𝙀𝙡 𝙖𝙧𝙘𝙝𝙞𝙫𝙤 𝙚𝙨 𝙙𝙚𝙢𝙖𝙨𝙞𝙖𝙙𝙤 𝙜𝙧𝙖𝙣𝙙𝙚, 𝙧𝙚𝙘𝙤𝙧𝙩𝙚𝙡𝙤 𝙢𝙞𝙣𝙞𝙢𝙤 𝙙𝙚 10 𝙖 20 𝙨𝙚𝙜𝙪𝙣𝙙𝙤𝙨 𝙥𝙖𝙧𝙖 𝙗𝙪𝙨𝙘𝙖𝙧 𝙧𝙚𝙨𝙪𝙡𝙩𝙖𝙙𝙤𝙨.')
await conn.reply(m.chat, wait, m)
let media = await q.download()
let ext = mime.split('/')[1]
fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media)
let res = await acr.identify(fs.readFileSync(`./tmp/${m.sender}.${ext}`))
let { code, msg } = res.status
if (code !== 0) throw msg
let { title, artists, album, genres, release_date } = res.metadata.music[0]
let txt = `
𝐍𝐎𝐌𝐁𝐑𝐄: ${title}
𝐀𝐑𝐓𝐈𝐒𝐓𝐀: ${artists !== undefined ? artists.map(v => v.name).join(', ') : 'No encontrado'}
`.trim()
fs.unlinkSync(`./tmp/${m.sender}.${ext}`)
m.reply(txt)
} else throw '᥀·࣭࣪̇˖⛔◗ 𝙊𝙘𝙪𝙧𝙧𝙞𝙤 𝙪𝙣 𝙚𝙧𝙧𝙤𝙧 𝙞𝙣𝙚𝙨𝙥𝙚𝙧𝙖𝙙𝙤, 𝙞𝙣𝙩𝙚𝙣𝙩𝙖𝙡𝙤 𝙙𝙚 𝙣𝙪𝙚𝙫𝙤, 𝙧𝙚𝙨𝙥𝙤𝙣𝙙𝙖 𝙖 𝙪𝙣 𝙖𝙪𝙙𝙞𝙤 𝙤 𝙫𝙞𝙙𝙚𝙤.'
}
handler.tags = ['herramientas']
handler.command = ['quemusica','quemusicaes','whatmusic']
export default handler