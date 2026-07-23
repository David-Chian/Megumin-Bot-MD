function parseTime(str) {
  const match = str.match(/^(\d+)(min|h|d|mes)$/i)
  if (!match) return null
  const num = parseInt(match[1])
  const unit = match[2].toLowerCase()
  switch (unit) {
    case 'min': return num * 60 * 1000
    case 'h': return num * 60 * 60 * 1000
    case 'd': return num * 24 * 60 * 60 * 1000
    case 'mes': return num * 30 * 24 * 60 * 60 * 1000
    default: return null
  }
}

async function ejecutarAccion(sock, chatId, action) {
  if (action === 'close') {
    await sock.groupSettingUpdate(chatId, 'announcement')
    await sock.reply(chatId, `✎ El grupo ha sido cerrado automáticamente.`)
  }
  const chat = await getChat(chatId)
  let acciones = typeof chat.scheduledActions === 'string'
    ? JSON.parse(chat.scheduledActions)
    : chat.scheduledActions || []
  acciones = acciones.filter(t => !(t.action === action && t.expiresAt <= Date.now()))
  await updateChat(chatId, 'scheduledActions', acciones)
}

async function scheduleGroupAction(chatId, action, ms, sock) {
  const expiresAt = Date.now() + ms
  const task = { action, expiresAt }
  const chat = await getChat(chatId)
  const tasks = typeof chat.scheduledActions === 'string'
    ? JSON.parse(chat.scheduledActions)
    : chat.scheduledActions || []
  tasks.push(task)
  await updateChat(chatId, 'scheduledActions', tasks)
  setTimeout(() => ejecutarAccion(sock, chatId, action), ms)
}

export default {
  command: ['open'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({sock, m, args}) => {
    const groupMetadata = await sock.groupMetadata(m.chat)
    const groupAnnouncement = groupMetadata.announce
    if (!args.length) {
      await updateChat(m.chat, 'scheduledActions', [])
      if (groupAnnouncement === true) {
        await sock.groupSettingUpdate(m.chat, 'not_announcement')
        return sock.reply(m.chat, `✎ El grupo ha sido abierto correctamente.`, m)
      } else {
        return sock.reply(m.chat, `《✤》 El grupo ya está abierto.`, m)
      }
    }
    const ms = parseTime(args[0])
    if (!ms) return sock.reply(m.chat, `✎ Formato inválido. Usa ej: 1min, 6h, 2d, 1mes`, m)
    await sock.groupSettingUpdate(m.chat, 'not_announcement')
    await sock.reply(m.chat, `✎ El grupo estará abierto por ${args[0]}.`, m)
    await scheduleGroupAction(m.chat, 'close', ms, sock)
  }
}
