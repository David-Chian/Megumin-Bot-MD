import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['pfp', 'getpic'],
  category: 'utils',
  run: async ({sock, m}) => {
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : false
    const who = await resolveLidToRealJid(who2, sock, m.chat);

    if (!who2)
      return m.reply(`✿ Etiqueta o menciona al usuario del que quieras ver su foto de perfil.`)

    try {
      const img = await sock.profilePictureUrl(who, 'image').catch(() => null)

      if (!img)
        return m.reply('✿ No se pudo obtener la foto de perfil.')

      await sock.sendMessage(m.chat, { image: { url: img }, caption: null }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  },
};
