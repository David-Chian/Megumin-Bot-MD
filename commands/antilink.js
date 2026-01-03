const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i

const allowedLinks = [
  'https://whatsapp.com/channel/0029VbApwZ9ISTkEBb6ttS3F',
  'https://whatsapp.com/channel/0029Vb6IdnEGU3BTahqaLL2V',
  'https://chat.whatsapp.com/JL3lRO1Fx3sFVEfUDnMrul?mode=ems_copy_t'
]

const joinCommands = [
  '/invite', '#invite', '-invite',
  '!invite', '.invite', '+invite'
]

export async function before(m, { client }) {
  if (!m.isGroup || !m.text) return

  const groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return

  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin).map(p => p.phoneNumber || p.jid)
  const isAdmin = groupAdmins.includes(m.sender)
  const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupAdmins.includes(botId)

  const chat = globalThis?.db?.data?.chats?.[m.chat]
  const primaryBotId = chat?.primaryBot
  const isPrimary = !primaryBotId || primaryBotId === botId

  const isGroupLink = linkRegex.test(m.text)
  const hasAllowedLink = allowedLinks.some(link => m.text.includes(link))
  const command = m.text.trim().split(/\s+/)[0].toLowerCase()

  if (hasAllowedLink || !isGroupLink || !chat?.antilinks || isAdmin || !isBotAdmin || !isPrimary) return

  await client.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  })

  if (!joinCommands.includes(command)) {
  await client.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  })
    const userName = global.db.data.users[m.sender]?.name || 'Usuario'
    await client.reply(m.chat, `❖ *${userName}* eliminado por \`Anti-Link\``, null)
    await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
  }
};