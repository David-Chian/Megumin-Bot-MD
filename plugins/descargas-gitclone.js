import fetch from 'node-fetch'

let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
let handler = async (m, { args, usedPrefix, command }) => {
  //let img = 'https://telegra.ph/file/78d5468b09fa913567731.png'
  let textbot = '🚩 ¡Bot Multi Device!'
  if (!args[0]) {
    return conn.reply(m.chat, `🚩 Escribe la URL de un repositorio de GitHub que deseas descargar.`, m, rcanal)
  }
  if (!regex.test(args[0])) {
    return conn.reply(m.chat, `Verifica que la *URL* sea de GitHub`, m, rcanal).then(_ => m.react(error))
  }
  let [_, user, repo] = args[0].match(regex) || []
  let sanitizedRepo = repo.replace(/.git$/, '')
  let repoUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}`
  let zipUrl = `https://api.github.com/repos/${user}/${sanitizedRepo}/zipball`
  await m.react(rwait)
  try {
  conn.reply(m.chat, wait, m, {
  contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
  title: packname,
  body: wm,
  previewType: 0, thumbnail: icons,
  sourceUrl: channel }}})
    let [repoResponse, zipResponse] = await Promise.all([
      fetch(repoUrl),
      fetch(zipUrl),
    ])
    let repoData = await repoResponse.json()
    let filename = zipResponse.headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
    let type = zipResponse.headers.get('content-type')
    let img = 'https://i.ibb.co/tLKyhgM/file.png'
    let txt = `*乂  G I T H U B  -  D O W N L O A D*\n\n`
       txt += `✩  *Nombre* : ${sanitizedRepo}\n`
       txt += `✩  *Repositorio* : ${user}/${sanitizedRepo}\n`
       txt += `✩  *Creador* : ${repoData.owner.login}\n`
       txt += `✩  *Descripción* : ${repoData.description || 'Sin descripción disponible'}\n`
       txt += `✩  *Url* : ${args[0]}\n\n`
       txt += `⁖❤️꙰  *${textbot}*`

await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
await conn.sendFile(m.chat, await zipResponse.buffer(), filename, null, m)
await m.react(done)
  } catch {
await m.react(error)
  }
}
handler.help = ['gitclone *<url git>*']
handler.tags = ['descargas']
handler.command = ['gitclone']
handler.register = true 
//handler.star = 1
export default handler
