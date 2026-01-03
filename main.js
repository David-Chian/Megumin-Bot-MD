import ws from 'ws'
import moment from 'moment'
import chalk from 'chalk'
import gradient from 'gradient-string'
import loadCommandsAndPlugins from './lib/system/commandLoader.js'
import initDB from './lib/system/initDB.js'
import { resolveLidToRealJid } from './lib/utils.js'

loadCommandsAndPlugins()

export default async (client, m) => {
    if (!m.message) return

if (global.middlewares?.before?.length) {
  for (const before of global.middlewares.before) {
    try {
      const stop = await before(m, { client })
      if (stop === true) return
    } catch (err) {
      console.error('Error en global middleware BEFORE:', err)
    }
  }
}
if (m.sender && m.chat?.endsWith('@g.us')) {
  const realSender = await resolveLidToRealJid(m.sender, client, m.chat)
  if (realSender) m.sender = realSender
}
if (m.key?.participant && m.chat?.endsWith('@g.us')) {
  const realParticipant = await resolveLidToRealJid(m.key.participant, client, m.chat)
  if (realParticipant) m.key.participant = realParticipant
}
if (Array.isArray(m.mentionedJid) && m.chat?.endsWith('@g.us')) {
  m.mentionedJid = await Promise.all(
    m.mentionedJid.map(jid => resolveLidToRealJid(jid, client, m.chat))
  )
}
    const sender = m.sender
    const pushname = m.pushName || 'Sin nombre'
    const from = m.key.remoteJid
global.db = global.db || { data: { chats: {} } }

const chatId = m.chat
global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}

const chat = global.db.data.chats[chatId]

chat.primaryBot = chat.primaryBot || null

const primaryBot = chat.primaryBot
const currentBot = client.user.id.split(':')[0] + '@s.whatsapp.net'

if (primaryBot && currentBot !== primaryBot) {
  return
}

const isGroup = m.isGroup

    let groupName = ''
    if (isGroup) {
        const metadata = await client.groupMetadata(from).catch(() => null)
        groupName = metadata?.subject || ''
    }

    const h = chalk.bold.blue('***********************************')
    const v = chalk.bold.white('│ ')
    console.log(
        `\n${h}\n${chalk.bold.yellow(`${v} Fecha: ${chalk.whiteBright(moment().format('DD/MM/YY HH:mm:ss'))}`)}\n${chalk.bold.blueBright(`${v} Usuario: ${chalk.whiteBright(pushname)}`)}\n${chalk.bold.magentaBright(`${v} Remitente: ${gradient('deepskyblue', 'darkorchid')(sender)}`)}\n${isGroup ? chalk.bold.cyanBright(`${v} Grupo: ${chalk.greenBright(groupName)}\n${v} ID: ${gradient('violet', 'midnightblue')(from)}\n`) : chalk.bold.greenBright(`${v} Chat privado\n`)}${h}`
    )

    let body =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        m.message.imageMessage?.caption ||
        m.message.videoMessage?.caption ||
        m.message.buttonsResponseMessage?.selectedButtonId ||
        m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
        m.message.templateButtonReplyMessage?.selectedId ||
        ""

    initDB(m, client)

    let usedPrefix = null

    for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (plugin && typeof plugin.all === "function") {
            try {
                await plugin.all.call(client, m, { client, usedPrefix })
            } catch (err) {
                console.error(`Error en plugin.all -> ${name}`, err)
            }
        }
    }

    const selfId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const rawPrefijo = global.db.data.settings[selfId].prefijo || ""
    const prefas = Array.isArray(rawPrefijo) ? rawPrefijo : rawPrefijo ? [rawPrefijo] : ['#', '/']

    const botname2 = global.db.data.settings[selfId].namebot2 || "Bot"

    const shortForms = [
        botname2.charAt(0),
        botname2.split(" ")[0],
        botname2.split(" ")[0].slice(0, 2),
        botname2.split(" ")[0].slice(0, 3)
    ].filter(Boolean)

    const prefixes = [botname2, ...shortForms]

    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const prefijosEscapados = prefas.map(escapeRegExp).join('')
    const nombresEscapados = prefixes.map(escapeRegExp).join('|')

    globalThis.prefix = new RegExp(`^(${nombresEscapados})?[${prefijosEscapados}]+`, "i")

    for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (typeof plugin.before === "function") {
            try {
                const stop = await plugin.before.call(client, m, { client, usedPrefix })
                if (stop) return
            } catch (err) {
                console.error(`Error en plugin.before -> ${name}`, err)
            }
        }
    }

    const prefixMatch = body.match(globalThis.prefix)
    if (!prefixMatch) return

    usedPrefix = prefixMatch[0]

    const noPrefix = body.slice(usedPrefix.length).trim()
    const args = noPrefix.split(/ +/)
    const command = args.shift()?.toLowerCase() || ""
    const text = args.join(" ")

    if (!global.comandos.has(command)) {
        return m.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
    }

    const cmdData = global.comandos.get(command)

    if (typeof cmdData.before === "function") {
        try {
            const stop = await cmdData.before.call(client, m, { client, command, args, text, usedPrefix })
            if (stop) return
        } catch (err) {
            console.error(`Error en BEFORE del comando ${command}:`, err)
        }
    }

    const isOwner = global.owner.map(x => x + "@s.whatsapp.net").includes(sender)

const metadata = isGroup ? await client.groupMetadata(from).catch(() => null) : null

const participants = metadata?.participants || []
const groupAdmins = []

for (const p of participants) {
  if (p.admin) {
    const realJid = await resolveLidToRealJid(p.id, client, from)
    if (realJid) groupAdmins.push(realJid)
  }
}

const senderJid = await resolveLidToRealJid(sender, client, from)
const botJid = await resolveLidToRealJid(selfId, client, from)

const isAdmin = isGroup ? groupAdmins.includes(senderJid) : false
const isBotAdmin = isGroup ? groupAdmins.includes(botJid) : false

const normalizeToJid = (phone) => {
  if (!phone) return null
  const base = typeof phone === 'number' ? phone.toString() : phone.replace(/\D/g, '')
  return base ? `${base}@s.whatsapp.net` : null
}

const modsJids = global.mods.map(num => normalizeToJid(num))
const isModeration = modsJids.includes(senderJid)

global.dfail = (type, m) => {
    const msg = {
        owner: `ꕥ El comando *${command}* solo puede ser ejecutado por mi Creador.`,
        moderation: `ꕥ El comando *${command}* solo puede ser ejecutado por los moderadores.`,
        admin: `ꕥ El comando *${command}* solo puede ser ejecutado por los Administradores del Grupo.`,
        botAdmin: `ꕥ El comando *${command}* solo puede ser ejecutado si el Bot es Administrador del Grupo.`
    }[type];
    if (msg) return m.reply(msg)
}

if (cmdData.isOwner && !isOwner) return global.dfail('owner', m)
if (cmdData.isModeration && !isModeration) return global.dfail('moderation', m)
if (cmdData.isAdmin && !isAdmin) return global.dfail('admin', m)
if (cmdData.botAdmin && !isBotAdmin) return global.dfail('botAdmin', m)
    try {
global.db.data.users = global.db.data.users || {}
const user2 = global.db.data.users[sender] ||= {}

user2.name = (pushname || 'Sin nombre').trim()
user2.usedcommands = (user2.usedcommands || 0) + 1
user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100)
user2.lastCommand = command
user2.lastSeen = new Date()
        await cmdData.run({
            client,
            m,
            args,
            command,
            text,
            usedPrefix,
            prefix: usedPrefix
        })
    } catch (err) {
        m.reply("❌ Error al ejecutar el comando:\n" + (err.message || err))
        console.error("Error ejecutando comando:", err)
    }
    for (const name in global.plugins) {
        const plugin = global.plugins[name]
        if (typeof plugin.after === "function") {
            try {
                await plugin.after.call(client, m, { client, usedPrefix })
            } catch (err) {
                console.error(`Error en plugin.after -> ${name}`, err)
            }
        }
    }

    if (typeof cmdData.after === "function") {
        try {
            await cmdData.after.call(client, m, { client, command, usedPrefix })
        } catch (err) {
            console.error(`Error en AFTER del comando ${command}:`, err)
        }
    }
if (global.middlewares?.after?.length) {
  for (const after of global.middlewares.after) {
    try {
      await after(m, { client })
    } catch (err) {
      console.error('Error en global middleware AFTER:', err)
    }
  }
}
}