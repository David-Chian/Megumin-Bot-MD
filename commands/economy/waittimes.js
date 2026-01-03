export default {
  command: ['waittimes', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'rpg',
  run: async ({client, m}) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ Estos comandos están desactivados en este grupo.`)

    const user = chatData.users[m.sender]
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const cooldowns = {
      crime: Math.max(0, (user.crimeCooldown || 0) - now),
      mine: Math.max(0, (user.mineCooldown || 0) - now),
      ritual: Math.max(0, (user.ritualCooldown || 0) - now),
      work: Math.max(0, (user.workCooldown || 0) - now),
      rt: Math.max(0, (user.rtCooldown || 0) - now),
      slut: Math.max(0, (user.lastProsti || 0) + (10 * 60 * 1000) - now),
      steal: Math.max(0, (user.roboCooldown || 0) - now),
      ppt: Math.max(0, (user.pptCooldown || 0) - now),
      daily: Math.max(0, (user.lastDaily || 0) + oneDay - now),
      weekly: Math.max(0, (user.lastWeekly || 0) + 7 * oneDay - now),
      monthly: Math.max(0, (user.lastMonthly || 0) + 30 * oneDay - now)
    }

    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000)
      const days = Math.floor(totalSeconds / 86400)
      const hours = Math.floor((totalSeconds % 86400) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const parts = []
      if (days > 0) parts.push(`${days} d`)
      if (hours > 0) parts.push(`${hours} h`)
      if (minutes > 0) parts.push(`${minutes} m`)
      if (seconds > 0) parts.push(`${seconds} s`)
      return parts.length ? parts.join(', ') : 'Ahora.'
    }

    const coins = user.coins || 0
    const name = db.users[m.sender]?.name || m.sender.split('@')[0]
    const mensaje = `✿ Usuario \`<${name}>\`

ⴵ Work » *${formatTime(cooldowns.work)}*
ⴵ Crime » *${formatTime(cooldowns.crime)}*
ⴵ Daily » *${formatTime(cooldowns.daily)}*
ⴵ Mine » *${formatTime(cooldowns.mine)}*
ⴵ Ritual » *${formatTime(cooldowns.ritual)}*
ⴵ Ruleta » *${formatTime(cooldowns.rt)}*
ⴵ Slut » *${formatTime(cooldowns.slut)}*
ⴵ Steal » *${formatTime(cooldowns.steal)}*
ⴵ Ppt » *${formatTime(cooldowns.ppt)}*
ⴵ Weekly » *${formatTime(cooldowns.weekly)}*
ⴵ Monthly » *${formatTime(cooldowns.monthly)}*

⛁ Coins totales » ¥${coins.toLocaleString()} ${global.db.data.settings[botId].currency}`

    await client.sendMessage(chatId, {
      text: mensaje
    }, { quoted: m })
  }
};