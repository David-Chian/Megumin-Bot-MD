import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['delwarn'],
  category: 'group',
  isAdmin: true,
  run: async ({client, m, args}) => {
    const chat = global.db.data.chats[m.chat]
    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)

    if (!who2) return m.reply('《✧》 Debes mencionar o responder al usuario cuya advertencia deseas eliminar.')

    const targetId = await resolveLidToRealJid(who2, client, m.chat)
    const user = chat.users[targetId]
    if (!user) return m.reply('《✧》 No se encontró al usuario en la base de datos.')

    const total = user?.warnings?.length || 0
    if (total === 0) {
      return client.reply(
        m.chat,
        `《✧》 El usuario @${targetId.split('@')[0]} no tiene advertencias registradas.`,
        m,
        { mentions: [targetId] }
      )
    }

    const name = global.db.data.users[targetId]?.name || 'Usuario'

    const rawIndex = mentioned.length > 0 ? args[1] : args[0]

    if (rawIndex?.toLowerCase() === 'all') {
      user.warnings = []
      return client.reply(
        m.chat,
        `✐ Se han eliminado todas las advertencias del usuario @${targetId.split('@')[0]} (${name}).`,
        m,
        { mentions: [targetId] }
      )
    }

    const index = parseInt(rawIndex)
    if (isNaN(index)) {
      return m.reply('《✧》 Debes especificar el índice de la advertencia que deseas eliminar o usar all para borrar todas.')
    }

    if (index < 1 || index > total) {
      return m.reply(`ꕥ El índice debe ser un número entre 1 y ${total}.`)
    }

    const realIndex = total - index
    user.warnings.splice(realIndex, 1)

    await client.reply(
      m.chat,
      `ꕥ Se ha eliminado la advertencia #${index} del usuario @${targetId.split('@')[0]} (${name}).`,
      m,
      { mentions: [targetId] }
    )
  },
}
