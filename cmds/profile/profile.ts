import moment from 'moment-timezone';
import { resolveLidToRealJid } from "../../core/utils.ts"

function safeJson(value: any, fallback: any) {
  if (value == null) return fallback
  if (typeof value === 'object') return value
  try { return JSON.parse(value) } catch { return fallback }
}

export default {
  command: ['profile', 'perfil'],
  category: 'profile',
  run: async ({ sock, m }) => {
    const texto = m.mentionedJid
    const who2  = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    const userId = await resolveLidToRealJid(who2, sock, m.chat)

    const chat        = await getChat(m.chat)
    const chatUsers   = await getChatUser(m.chat, userId)
    const globalUsers = await getUser(userId)

    if (!chatUsers) {
      return m.reply('✐ El usuario *mencionado* no está *registrado* en el bot')
    }

    const idBot    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = await getSettings(idBot)
    const currency  = settings.currency || ''

    const user  = chatUsers  || {}
    const user2 = globalUsers || {}

    const globalUsers2 = await getUser(user2.marry)
    const globalUsers3 = await getUser()

    const name       = user2.name         || ''
    const birth      = user2.birth        || 'Sin especificar'
    const genero     = user2.genre        || 'Oculto'
    const comandos   = user2.usedcommands || '0'
    const desc       = user2.description  ? `\n\n${user2.description}` : ''
    const pasatiempo = user2.pasatiempo   || 'No definido'
    const exp        = user2.exp          || 0
    const nivel      = user2.level        || 0
    const chocolates = user.coins         || 0
    const banco      = user.bank          || 0
    const totalCoins = chocolates + banco
    const harem      = user?.characters?.length || 0

    const parejaReal  = user2.marry ? (globalUsers2?.name || null) : null

    const marriages   = safeJson(chat.marriages, {})
    const marriageEntry = Object.entries(marriages).find(([, data]: any) => data?.partnerId === userId)
    const parejaGacha = marriageEntry ? marriageEntry[0] : null

    let parejaFinal = 'Nadie'
    if (parejaReal && parejaGacha) parejaFinal = `${parejaReal} & ${parejaGacha}`
    else if (parejaReal)           parejaFinal = parejaReal
    else if (parejaGacha)          parejaFinal = parejaGacha

    const estadoCivil =
      genero === 'Mujer'  ? 'Casada con'  :
      genero === 'Hombre' ? 'Casado con'  : 'Casadx con'

    const perfil = await sock
      .profilePictureUrl(userId, 'image')
      .catch(() => 'https://cdn.sockywa.xyz/files/1751246122292.jpg')

    const users = (globalUsers3 || []).map(u => ({ ...u, jid: u.id }))
    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))

    try {
      const rank = sortedLevel.findIndex(u => u.jid === userId) + 1

      const profileText =
        `- ׄ　ꕤ　ׅ ໌　۟　𝖯𝖾𝗋𝖿𝗂𝗅　ׅ　팅화　ׄ\n\n` +
        `𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ Cumpleaños › *${birth}*\n` +
        `𖣣ֶㅤ֯⌗ ❀ ׄ ⬭ Pasatiempo › *${pasatiempo}*\n` +
        `𖣣ֶㅤ֯⌗ ⚥ ׄ ⬭ Género › *${genero}*\n` +
        `𖣣ֶㅤ֯⌗ ✿ ׄ ⬭ ${estadoCivil} › *${parejaFinal}*${desc}\n\n` +
        `𖣣ֶㅤ֯⌗ ✧ ׄ ⬭ Nivel › *${nivel}*\n` +
        `𖣣ֶㅤ֯⌗ ✤ ׄ ⬭ Experiencia › *${exp.toLocaleString()}*\n` +
        `𖣣ֶㅤ֯⌗ ❒ ׄ ⬭ Puesto › *#${rank}*\n\n` +
        `𖣣ֶㅤ֯⌗ ꕥ ׄ ⬭ Harem › *${harem.toLocaleString()}*\n` +
        `𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Dinero Total › *¥${totalCoins.toLocaleString()} ${currency}*\n` +
        `𖣣ֶㅤ֯⌗ ☄︎  ׄ ⬭ Comandos ejecutados › *${comandos.toLocaleString()}*`

      await sock.sendMessage(
        m.chat,
        {
          image:   { url: perfil },
          caption: profileText,
        },
        { quoted: m },
      )
    } catch (e) {
      m.reply(msgglobal)
    }
  }
}