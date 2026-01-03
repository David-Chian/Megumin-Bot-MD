import { resolveLidToRealJid } from "../../lib/utils.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const getBotsFromFolder = (folderName) => {
  const basePath = path.join(dirname, '../../Sessions', folderName)
  if (!fs.existsSync(basePath)) return []
  return fs
    .readdirSync(basePath)
    .filter((dir) => fs.existsSync(path.join(basePath, dir, 'creds.json')))
    .map((id) => id.replace(/\D/g, '') + '@s.whatsapp.net')
}

const getAllowedBots = (mainBotJid) => {
  const subs = getBotsFromFolder('Subs')
  const mods = getBotsFromFolder('Mods')
  const prems = getBotsFromFolder('Prems')
  return [...new Set([...subs, ...mods, ...prems, mainBotJid])]
}

export default {
  command: ['setprimary'],
  category: 'grupo',
  isAdmin: true,

  run: async ({client, m, args}) => {
    try {
      const chat = global.db.data.chats[m.chat]
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted?.sender || false
     const who = await resolveLidToRealJid(who2, client, m.chat);
      if (!who2) {
        return client.reply(m.chat, `《✧》 Por favor menciona un bot para convertirlo en primario.`, m)
      }
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : ''
      const groupParticipants = groupMetadata?.participants?.map((p) => p.phoneNumber || p.jid || p.id || p.lid) || []

      const mainBotJid = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
      const allowedBots = getAllowedBots(mainBotJid)

      if (!allowedBots.includes(who)) {
        return client.reply(m.chat, `《✧》 El usuario mencionado no es una instancia de Sub-Bot.`, m)
      }

      if (!groupParticipants.includes(who)) {
        return client.reply(m.chat, `《✧》 El bot mencionado no está presente en este grupo.`, m)
      }

      if (chat.primaryBot === who) {
        return client.reply(m.chat, `「✿」 @${who.split('@')[0]} ya es el Bot principal del Grupo.`, m, {
          mentions: [who],
        })
      }

      chat.primaryBot = who
      await client.reply(
        m.chat,
        `ꕥ Se ha establecido a @${who.split('@')[0]} como bot primario de este grupo.\n> Ahora todos los comandos de este grupo serán ejecutados por @${who.split('@')[0]}.`,
        m,
        { mentions: [who] },
      )
    } catch (e) {
      console.error(e)
      await m.reply(`《✧》 Ocurrió un error al intentar establecer el bot primario.`)
    }
  },
};
