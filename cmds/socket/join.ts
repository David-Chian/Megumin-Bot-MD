import db from "#db"
import { lang } from "#langs"
import { parseTime, scheduleGroupLeave, cancelGroupLeave } from '../../lib/groupScheduler.ts'

export default {
  command: ['join', 'unir'],
  isModeration: true,
  run: async ({ msg, sock, args, usedPrefix }) => {
    const t = await lang(msg.sender)
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await db.getSettings(idBot)
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.mods.map(num => num + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2) return msg.reply(t.socket.socketOwnerOnly())
    if (!args[0]) return msg.reply(t.socket.joinNoLink())

    const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
    const linkArg = args.find(a => linkRegex.test(a))
    const match = linkArg?.match(linkRegex)
    if (!match || !match[1]) return msg.reply(t.socket.joinInvalidLink())

    // El tiempo es opcional y puede ir antes o después del link: /join <link> 30d  o  /join 30d <link>
    const timeArg = args.find(a => a !== linkArg)
    let ms = 0
    if (timeArg) {
      ms = parseTime(timeArg)
      if (!ms) return msg.reply(`✎ Formato de tiempo inválido. Usa ej: 6h, 2d, 30d, 1mes`)
    }

    try {
      const inviteCode = match[1]
      const groupId = await sock.groupAcceptInvite(inviteCode)

      if (ms && groupId) {
        await scheduleGroupLeave(groupId, ms, sock)
        await sock.reply(msg.chat, `${t.socket.joinJoined(config.namebot)}\n\n✎ Estaré en ese grupo por *${timeArg}*.`, msg)
      } else {
        if (groupId) await cancelGroupLeave(groupId)
        await sock.reply(msg.chat, t.socket.joinJoined(config.namebot), msg)
      }
    } catch (e) {
      const errMsg = String(e.message || e)
      if (errMsg.includes('account_reachout_restricted')) await msg.reply(t.socket.joinRestricted())
      else if (errMsg.includes('not-authorized') || errMsg.includes('requires-admin')) await msg.reply(t.socket.joinRequiresAdmin())
      else if (errMsg.includes('not-in-group') || errMsg.includes('removed')) await msg.reply(t.socket.joinRemoved())
      else await msg.reply(t.socket.joinError())
    }
  },
}
