function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100)
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  return `${minutes} Minuto(s) ${seconds} Segundo(s)`
}

const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+[0-9]{1,3})?/i

async function getGroupName(sock, chatId) {
  try {
    const metadata = await sock.groupMetadata(chatId)
    return metadata.subject || 'Grupo desconocido'
  } catch {
    return 'Chat privado'
  }
}

export default {
  command: ['invite', 'invitar'],
  category: 'info',
  run: async ({sock, m, args}) => {
    const grupo = m.isGroup ? await getGroupName(sock, m.chat) : 'Chat privado'

    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = await getSettings(botId)
    const botname = botSettings.namebot2

    const link = args.join(' ')
    const match = link.match(linkRegex)
    if (!match || !match[1]) {
      return m.reply('《✤》 El enlace ingresado no es válido o está incompleto.')
    }

    if (!args || !args.length) {
      return m.reply('《✤》 Ingresa el enlace para invitar al bot a tu grupo.')
    }

    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botType = isOficialBot
      ? 'Owner'
          : 'Sub Bot'

    const sugg = `❀ 𝗦𝗢𝗟𝗜𝗖𝗜𝗧𝗨𝗗 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔

✩ *Usuario ›* ${m.pushName}
✿ *Enlace ›* ${args.join(' ')}
✿ *Chat ›* ${grupo}

➤ 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧
♡ *Socket ›* ${botType}
★ *Nombre ›* ${botname}
❐ *Versión ›* @latest`

    if (typeof sugg !== 'string' || !sugg.trim()) return

    for (const num of global.mods) {
      const jid = `${num}@s.whatsapp.net`
      try {
        await sock.sendMessage(jid, { text: sugg })
      } catch (e) {
        m.reply(`No se pudo enviar a ${jid}.`)
      }
    }

    await sock.reply(
      m.chat,
      '《✤》 Enlace de invitación enviado con éxito a los Desarrolladores.',
      m,
    )

  },
};
