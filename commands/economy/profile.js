import moment from 'moment-timezone';
import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['profile', 'perfil'],
  category: 'rpg',
  run: async ({client, m}) => {
    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    const userId = await resolveLidToRealJid(who2, client, m.chat);

    const chat = global.db.data.chats[m.chat] || {}
    const chatUsers = chat.users || {}
    const globalUsers = global.db.data.users || {}
   const userss = global.db.data.chats[m.chat].users[userId] || {}

    if (!userss) {
      return m.reply('✎ El usuario *mencionado* no está *registrado* en el bot')
    }

    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net' || ''
    const settings = global.db.data.settings[idBot] || {}
    const currency = settings.currency || ''

    const user = chatUsers[userId] || {}
    const user2 = globalUsers[userId] || {}

    const name = user2.name || ''
    const birth = user2.birth || 'Sin especificar'
    const genero = user2.genre || 'Oculto'
    const comandos = user2.usedcommands || '0'
    const pareja = user2.marry ? `${globalUsers[user2.marry].name}` : 'Nadie'
    const estadoCivil =
      genero === 'Mujer' ? 'Casada con' : genero === 'Hombre' ? 'Casado con' : 'Casadx con'
    const desc = user2.description ? `\n\n${user2.description}` : ''
    const pasatiempo = user2.pasatiempo ? `${user2.pasatiempo}` : 'No definido'
    const exp = user2.exp || 0
    const nivel = user2.level || 0
    const chocolates = user.coins || 0
    const banco = user.bank || 0
    const totalCoins = chocolates + banco
    const harem = user?.characters?.length || 0

    const perfil = await client
      .profilePictureUrl(userId, 'image')
      .catch((_) => 'https://cdn.stellarwa.xyz/files/1751246122292.jpg')

    const users = Object.entries(globalUsers).map(([key, value]) => ({ ...value, jid: key }))
    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    try {
    const rank = sortedLevel.findIndex((u) => u.jid === userId) + 1

    const profileText = `「✿」 *Perfil* ◢ ${name} ◤

♛ Cumpleaños › *${birth}*
♛ Pasatiempo › *${pasatiempo}*
♛ Género › *${genero}*
♡ ${estadoCivil} › *${pareja}*${desc}

✿ Nivel › *${nivel}*
❀ Experiencia › *${exp.toLocaleString()}*
☆ Puesto › *#${rank}*

ꕥ Harem › *${harem.toLocaleString()}*
✰ Dinero Total › *¥${totalCoins.toLocaleString()} ${currency}*
❒ Comandos ejecutados › *${comandos.toLocaleString()}*`

    await client.sendMessage(
      m.chat,
      {
        image: { url: perfil },
        caption: profileText,
      },
      { quoted: m },
    )
  } catch (e) {
  m.reply(msgglobal)
  }
  }
};
