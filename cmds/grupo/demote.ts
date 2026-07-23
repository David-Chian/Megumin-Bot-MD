export default {
  command: ['demote'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({sock, m}) => {
    const mentioned = await m.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? await m.quoted.sender : false

    if (!who) return m.reply('《✤》 Menciona al usuario que deseas degradar de administrador.')

    try {
      const groupMetadata = await sock.groupMetadata(m.chat)
      const participant = groupMetadata.participants.find(
        (p) =>
          p.phoneNumber === who ||
          p.id === who ||
          p.lid === who ||
          p.jid === who
      )

      if (!participant?.admin)
        return sock.reply(
          m.chat,
          `✎ *@${who.split('@')[0]}* no es administrador del grupo!`,
          m,
          { mentions: [who] }
        )

      if (who === groupMetadata.owner)
        return m.reply('✿ No puedes degradar al creador del grupo de administrador.')

      if (who === sock.user.jid)
        return m.reply('✿ No puedes degradar al bot de administrador.')

      await sock.groupParticipantsUpdate(m.chat, [who], 'demote')
      await sock.reply(
        m.chat,
        `✎ *@${who.split('@')[0]}* ha sido degradado de administrador del grupo!`,
        m,
        { mentions: [who] }
      )
    } catch {
      await m.reply(msgglobal)
    }
  },
}
