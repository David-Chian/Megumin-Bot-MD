import GraphemeSplitter from 'grapheme-splitter'

export default {
  command: ['setbotprefix'],
  category: 'socket',
  run: async ({sock, m, args, command, text, prefix}) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = await getSettings(idBot)
    const owner = config.owner ? config.owner : '' || ''
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.mods.map(num => num + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2) return sock.reply(m.chat, mess.socket, m)

    const value = args.join(' ').trim()
    const defaultPrefix = ["#", "/"]

    if (!value) {
      const lista = config.prefijo === null 
        ? '`sin prefijos`' 
        : (Array.isArray(config.prefijo) ? config.prefijo : [config.prefijo || '/']).map(p => `\`${p}\``).join(', ')
      return m.reply(
        `✿ Por favor, elige cualquiera de los siguientes métodos de prefijos.\n\n` +
        `> *○ Multi-Prefix* :: ${prefix + command} *!/.+-#*\n` +
        `> *○ Reset* :: ${prefix + command} *reset*\n` +
        `> *○ No-Prefix* :: ${prefix + command} *noprefix*\n\n` +
        `✤ Actualmente se está usando: ${lista}`
      )
    }

    if (value.toLowerCase() === 'reset') {
      config.prefijo = defaultPrefix

   await updateSettings(idBot, 'prefijo', config.prefijo)
      return sock.reply(m.chat, `❖ Se han restaurado los prefijos predeterminados: *${defaultPrefix.join(' ')}*`, m)
    }

    if (value.toLowerCase() === 'noprefix') {
      config.prefijo = 1

   await updateSettings(idBot, 'prefijo', config.prefijo)
      return m.reply(`❖ Se cambió al modo sin prefijos para el Socket correctamente.`)
    }

    const splitter = new GraphemeSplitter()
    const graphemes = splitter.splitGraphemes(value)
    const lista = []

    for (const g of graphemes) {
      if (/^[a-zA-Z]+$/.test(g)) continue
      if (!lista.includes(g)) lista.push(g)
    }

    if (lista.length === 0) {
      return sock.reply(m.chat, '✿ No se detectaron prefijos válidos. Debes incluir al menos un símbolo o emoji.', m)
    }

    if (lista.length > 6) {
      return sock.reply(m.chat, '✿ Máximo 6 prefijos permitidos.', m)
    }

    config.prefijo = lista

   await updateSettings(idBot, 'prefijo', config.prefijo)
    return sock.reply(m.chat, `✤ Se cambió el prefijo del Socket a *${lista.join(' ')}* correctamente.`, m)
  },
}
