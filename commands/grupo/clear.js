function getLastActive(usedTime) {
  if (!usedTime) return 0
  if (typeof usedTime === 'number') return usedTime
  if (usedTime instanceof Date) return usedTime.getTime()
  return new Date(usedTime).getTime()
}

function msToTime(ms) {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  return `${day}d ${hour % 24}h ${min % 60}m ${sec % 60}s`
}

export default {
  command: ['clear'],
  category: 'grupo',
  run: async ({client, m, command, args}) => {
    const chat = global.db.data.chats[m.chat]
    if (!chat) return m.reply('ꕥ No se encontraron datos del grupo')

    const metadata = await client.groupMetadata(m.chat)
    const isAdmin = m.isGroup && metadata.participants.find(p => p.phoneNumber === m.sender || p.id === m.sender || p.jid === m.sender)?.admin
    const isDeleteMode = m.text.includes('delete')
    const isViewMode = m.text.includes('views')

    if (!isAdmin && !isViewMode) return m.reply('ꕥ Este comando solo puede ser usado por administradores')

    try {
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
      const now = Date.now()

      let userList = []
      let mentions = []
      let totalWaifus = 0
      let totalDinero = 0
      let count = 0

      for (const jid in chat.users) {
        const groupData = chat.users[jid]
        const lastActive = getLastActive(groupData?.usedTime)
        const inactiveTime = now - lastActive

        const isValidTime = typeof lastActive === 'number' && lastActive > 0
        const isInactive = isValidTime && inactiveTime > THIRTY_DAYS_MS

        if ((isViewMode && isValidTime) || isInactive) {
          const waifus = groupData?.characters?.length || 0
          const dinero = groupData?.coins || 0
          const displayName = global.db.data.users[jid]?.name || jid.split('@')[0]
          const formattedTime = msToTime(inactiveTime)

          userList.push(`*${displayName} [${waifus}] →* hace ${formattedTime}`)
          mentions.push(jid)
          totalWaifus += waifus
          totalDinero += dinero

          if (isDeleteMode && !isViewMode && isInactive) {
            delete chat.users[jid]
            delete global.db.data.users[jid]
            count++
          }
        }
      }

      if (userList.length === 0) return m.reply('ꕥ No hay usuarios inactivos en este grupo')

      const currency = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net'].currency
      let details = ''

      if (isDeleteMode) {
        details += '*✰ Delete Users Inactivos (●´ϖ`●)*\n'
        details += `> ✿ *Claims eliminadas ›* ${totalWaifus.toLocaleString()}\n`
        details += `> ⛁ *${currency} eliminados ›* ${totalDinero.toLocaleString()}\n`
        details += `> ✩ *Usuarios inactivos ›* ${count.toLocaleString()}\n`
        details += `> ❒ *Tiempo límite ›* 30 días\n\n`
      } else if (isViewMode) {
        details += '*✰ Users Info (●´ϖ`●)*\n'
        details += `> ✿ *Claims ›* ${totalWaifus.toLocaleString()}\n`
        details += `> ⛁ *${currency} ›* ${totalDinero.toLocaleString()}\n`
        details += `> ❒ *Usuarios encontrados ›* ${userList.length}\n\n`
      } else {
        details += '*✰ Users Inactivos (●´ϖ`●)*\n'
        details += `> ✿ *Claims ›* ${totalWaifus.toLocaleString()}\n`
        details += `> ⛁ *${currency} ›* ${totalDinero.toLocaleString()}\n`
        details += `> ❒ *Usuarios inactivos ›* ${userList.length}\n\n`
      }

      if (isViewMode) {
        userList = userList.map((line, i) => `${i + 1}. ${line}`)
      }

      details += userList.join('\n')
      client.reply(m.chat, details, m)
    } catch (e) {
      m.reply(msgglobal)
    }
  }
};
