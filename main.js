import ws from 'ws'
import moment from 'moment'
import chalk from 'chalk'
import gradient from 'gradient-string'
import loadCommandsAndPlugins from './lib/system/commandLoader.js'
import initDB from './lib/system/initDB.js'
import { resolveLidToRealJid } from './lib/utils.js'
import antiStatus from './commands/antiestados.js'

const groupMetaCache = new Map()
const lidCache = new Map()

setInterval(() => {
    const now = Date.now()
    for (const [jid, entry] of groupMetaCache) {
        if (now - entry.ts > 15 * 60 * 1000) groupMetaCache.delete(jid)
    }
    for (const [key, entry] of lidCache) {
        if (now - entry.ts > 10 * 60 * 1000) lidCache.delete(key)
    }
}, 15 * 60 * 1000)

async function getCachedGroupMeta(client, jid) {
    if (!jid?.endsWith('@g.us')) return null
    const now = Date.now()
    const cached = groupMetaCache.get(jid)
    if (cached && (now - cached.ts) < 5 * 60 * 1000) return cached.data
    const meta = await client.groupMetadata(jid).catch(() => null)
    if (meta) groupMetaCache.set(jid, { data: meta, ts: now })
    return meta
}

async function cachedResolveLid(jid, client, chat) {
    if (!jid) return jid
    const key = `${jid}:${chat}`
    const now = Date.now()
    const cached = lidCache.get(key)
    if (cached && (now - cached.ts) < 10 * 60 * 1000) return cached.data
    const resolved = await resolveLidToRealJid(jid, client, chat)
    lidCache.set(key, { data: resolved, ts: now })
    return resolved
}

loadCommandsAndPlugins()

export default async (client, m) => {
    if (!m.message) return

    await antiStatus(client, m)

    if (m.message.viewOnceMessageV2) {
        m.message = m.message.viewOnceMessageV2.message
    }
    if (m.message.viewOnceMessage) {
        m.message = m.message.viewOnceMessage.message
    }

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
        const realSender = await cachedResolveLid(m.sender, client, m.chat)
        if (realSender) m.sender = realSender
    }
    if (m.key?.participant && m.chat?.endsWith('@g.us')) {
        const realParticipant = await cachedResolveLid(m.key.participant, client, m.chat)
        if (realParticipant) m.key.participant = realParticipant
    }
    if (Array.isArray(m.mentionedJid) && m.chat?.endsWith('@g.us')) {
        m.mentionedJid = await Promise.all(
            m.mentionedJid.map(jid => cachedResolveLid(jid, client, m.chat))
        )
    }

    const sender = m.sender
    const pushname = m.pushName || 'Sin nombre'
    const from = m.key.remoteJid
    const isGroup = m.isGroup

    global.db = global.db || { data: { chats: {} } }
    const chatId = m.chat
    global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}
    const chat = global.db.data.chats[chatId]

    const selfId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const isOwner = global.owner.map(x => x + "@s.whatsapp.net").includes(m.sender)

    const metadata = isGroup ? await getCachedGroupMeta(client, from) : null
    const groupName = metadata?.subject || ''
    const participants = metadata?.participants || []

    if (isGroup && chat.bannedGrupo) {
        const groupAdminsBanned = participants
            .filter(p => p.admin)
            .map(p => p.id)
        const isAdminBanned = groupAdminsBanned.includes(m.sender)
        if (!isAdminBanned && !isOwner) return
    }

    chat.primaryBot = chat.primaryBot || null
    const primaryBot = chat.primaryBot
    const currentBot = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (primaryBot && currentBot !== primaryBot) {
        const primaryUserId = primaryBot.split('@')[0]
        const mainBotId = global.client?.user?.id?.split(':')[0]
        const isPrimaryMainBot = primaryUserId === mainBotId

        const isPrimaryActive = isPrimaryMainBot
            ? (global.client?.user != null)
            : global.conns?.some((c) => c.userId === primaryUserId && c.isInit === true)

        if (!isPrimaryActive) {
            console.log(`[ ⚠️ ] Bot primario ${primaryBot} inactivo en grupo ${from}. Limpiando primaryBot.`)
            chat.primaryBot = null
        } else {
            return
        }
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
        (m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson &&
            JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id) ||
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

    const settingsBot = global.db.data.settings[selfId] || {}
    if (settingsBot.self && !isOwner && sender !== selfId) return

    if (m.chat && !m.chat.endsWith('@g.us')) {
        const allowedInPrivateForUsers = [
            'report', 'reporte', 'sug', 'read', 'eval', 'r', 'confesar', 'responder',
            'suggest', 'invite', 'invitar', 'setname', 'setbotname', 'setbanner',
            'setmenubanner', 'setusername', 'setpfp', 'setimage', 'setbotcurrency',
            'setbotprefix', 'setstatus', 'setbotowner', 'reload', 'codemod', 'qrmod',
            'codepremium', 'qrpremium'
        ]
        const allowedInPrivateForSelf = ['s', 'suno']
        const settings = global.db.data.settings[selfId]
        const isSelf = settings?.self === true

        if (
            !isOwner &&
            !allowedInPrivateForUsers.includes(command) &&
            !(isSelf && allowedInPrivateForSelf.includes(command))
        ) return
    }

    const groupAdmins = []
    for (const p of participants) {
        if (p.admin) {
            const realJid = await cachedResolveLid(p.id, client, from)
            if (realJid) groupAdmins.push(realJid)
        }
    }

    const senderJid = await cachedResolveLid(sender, client, from)
    const botJid = await cachedResolveLid(selfId, client, from)

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
        }[type]
        if (msg) return m.reply(msg)
    }

    if (cmdData.isOwner && !isOwner) return global.dfail('owner', m)
    if (cmdData.isModeration && !isModeration) return global.dfail('moderation', m)
    if (cmdData.isAdmin && !isAdmin) return global.dfail('admin', m)
    if (cmdData.botAdmin && !isBotAdmin) return global.dfail('botAdmin', m)

    if (command) {
        await client.sendPresenceUpdate('composing', m.chat)
    }

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