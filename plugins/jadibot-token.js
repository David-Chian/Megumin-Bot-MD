import fs from "fs"
async function handler(m, {usedPrefix}) {
    const user = m.sender.split("@")[0]
    if (fs.existsSync(`./${jadi}/` + user + "/creds.json")) {
        let token = Buffer.from(fs.readFileSync(`./${jadi}/` + user + "/creds.json"), "utf-8").toString("base64")
        await conn.reply(m.chat, `El token te permite iniciar sesion en otros bots, recomendamos no compartirlo con nadie.\n\n*Tu token es:*`, m, rcanal)
        await conn.reply(m.chat, token, m, rcanal)
    } else {
        await conn.reply(m.chat, `🚩 No tienes token, crea tu token usando: ${usedPrefix}serbot.`, m, rcanal)
    }
  }
  handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
  handler.tags = ['jadibot'];
  handler.register = true
  handler.private = true
  export default handler;
