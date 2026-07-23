import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['warns'],
  category: 'group',
  isAdmin: true,
  run: async ({sock, m, args}) => {
    const chat = await getChat(m.chat)
    const mentioned = m.mentionedJid
    const who2 =
      mentioned.length > 0
        ? mentioned[0]
        : m.quoted
        ? m.quoted.sender
        : false
   const userId = await resolveLidToRealJid(who2, sock, m.chat);

    const user = await getChatUser(m.chat, userId)
    const nam = await getUser(userId)

    if (!who2 || !user) {
      return m.reply('《✤》 Menciona o responde a un usuario válido para ver sus advertencias.')
    }

    const total = user.warnings?.length || 0

    if (total === 0) {
      return sock.reply(m.chat, `✐ @${userId.split('@')[0]} no tiene advertencias registradas.`, m, {
        mentions: [userId],
      })
    }

    const name = (nam.name) || 'Usuario'
    const warningList = user.warnings
      .map((w, i) => {
        const index = total - i
        const author = w.by ? `\n> » Por: @${w.by.split('@')[0]}` : ''
        return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}${author}`
      })
      .join('\n')

    await sock.reply(m.chat,
      `✐ Advertencias de @${userId.split('@')[0]} (${name}):\n> ✧ Total de advertencias: \`${total}\`\n\n${warningList}`,
      m,
      { mentions: [userId, ...user.warnings.map(w => w.by).filter(Boolean)] }
    )
  },
};
