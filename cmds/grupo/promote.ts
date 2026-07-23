export default {
  command: ['promote'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({sock, m}) => {
    const mentioned = await m.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? await m.quoted.sender : false

    if (!who) return m.reply('《✤》 Menciona al usuario que deseas promover a administrador.')

    try {
      const groupMetadata = await sock.groupMetadata(m.chat)
      const participant = groupMetadata.participants.find(
        (p) =>
          p.phoneNumber === who ||
          p.id === who ||
          p.lid === who ||
          p.jid === who
      )

      if (participant?.admin)
        return sock.reply(
          m.chat,
          `✎ *@${who.split('@')[0]}* ya es administrador del grupo!`,
          m,
          { mentions: [who] }
        )

      await sock.groupParticipantsUpdate(m.chat, [who], 'promote')
      await sock.reply(
        m.chat,
        `✐ *@${who.split('@')[0]}* ha sido promovido a administrador del grupo!`,
        m,
        { mentions: [who] }
      )
    } catch {
      await m.reply(msgglobal)
    }
  },
}
