export default {
  command: ['join', 'unir'],
  isModeration: true,
  run: async ({sock, m, args}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.mods.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return m.reply(mess.socket)
    if (!args[0]) return m.reply('《✧》 Ingresa el enlace del grupo para unir el bot.')
    const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
    const match = args[0].match(linkRegex)
    if (!match || !match[1]) {
      return m.reply('《✧》 El enlace ingresado no es válido o está incompleto.')
    }
    try {
      const inviteCode = match[1]
      await sock.groupAcceptInvite(inviteCode)
      await sock.reply(m.chat, `❀ ${config.namebot} se ha unido exitosamente al grupo.`, m)
    } catch (e) {
      const errMsg = String(e.message || e)
      if (errMsg.includes('not-authorized') || errMsg.includes('requires-admin')) {
        await m.reply('《✧》 La unión requiere aprobación de administrador. Espera a que acepten tu solicitud.')
      } else if (errMsg.includes('not-in-group') || errMsg.includes('removed')) {
        await m.reply('《✧》 No se pudo unir al grupo porque el bot fue eliminado recientemente.')
      } else {
        await m.reply('《✧》 No se pudo unir al grupo, verifica el enlace o los permisos.')
      }
    }
  },
}
