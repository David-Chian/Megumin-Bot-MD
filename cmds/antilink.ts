const linkRegex = /(https?:\/\/)?(www\.)?chat\.whatsapp\.com\/[^\s]+|(https?:\/\/)?(www\.)?whatsapp\.com\/channel\/[^\s]+/i

const joinCommands = ['/invite','#invite','-invite','!invite','.invite','+invite']

import { isJidAdminInGroup } from '../core/utils.ts'

export async function before(m, { client, sock }) {
  const _sock = sock || client
  if (!m.isGroup || !m.text) return

  const botId = _sock.user.id.split(':')[0] + '@s.whatsapp.net'

  const botSettings = await getSettings(botId)
  if (botSettings?.self) return
  if (m.isBot) return

  const chat = await getChat(m.chat)
  if (!chat?.antilinks) return

  const primaryBotId = chat?.primaryBot
  if (primaryBotId && primaryBotId !== botId) return

  const isGroupLink = linkRegex.test(m.text)
  if (!isGroupLink) return

  const isAdmin    = await isJidAdminInGroup(sock, m.chat, m.sender)
  const isBotAdmin = await isJidAdminInGroup(sock, m.chat, botId)

  if (isAdmin || !isBotAdmin) return

  await _sock.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  }).catch(() => {})

  const command = m.text.trim().split(/\s+/)[0].toLowerCase()
  if (joinCommands.includes(command)) return

  if (m.quoted?.key?.id) {
    await _sock.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.key.id,
        participant: m.quoted.key.participant
      }
    }).catch(() => {})
  }

  const userData = await getUser(m.sender)
  const userName = userData?.name || m.pushName || 'Usuario'

  setTimeout(async () => {
    await _sock.sendMessage(m.chat, {
      text: `❖ *${userName}* eliminado por \`Anti-Link\``
    }).catch(() => {})
    await _sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
  }, 500)
}