var handler = async (m, { conn, text, usedPrefix, command }) => {

if (!text) return conn.reply(m.chat, `💥 *Ingrese un texto a preguntar*\n\n💣 Ejemplo: ${usedPrefix + command} ¿Hoy estallaremos algo?`, m, rcanal, )

await m.react('❔')
await delay(1000 * 1)
await m.react('❓')
await delay(1000 * 1)
await m.react('❔')
await delay(1000 * 1)

await conn.reply(m.chat, + dev + `\n\n•*Pregunta:* ` + text + `\n• *Respuesta:* ` + res, m, rcanal)

}
handler.help = ['pregunta']
handler.tags = ['fun']
handler.command = ['pregunta','preguntas']

handler.register = true

export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let res = ['Si','Tal vez sí','Posiblemente','Probablemente no','No','Imposible','Por que haces estas preguntas','Por eso te dejo','Para que quieres saber','No te dire la respuesta'].getRandom()