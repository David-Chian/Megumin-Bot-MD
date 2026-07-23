import { programarJobGrupo, cancelarJobGrupo } from '../../core/impuestos.ts'
export default {
  command: [
    'welcome', 'bienvenidas',
    'alerts', 'alertas', 'antistatus', 'antiestados', 'antinsfw', 'antiporno',
    'nsfw',
    'antilink', 'antienlaces', 'antilinks',
    'rpg', 'economy', 'bye', 'despedidas', 'economia',
    'gacha',
    'adminonly', 'goodbye', 'onlyadmin',
    'impuestosmode', 'modoimpuestos'
  ],
  category: 'grupo',
  isAdmin: 1,
  run: async ({sock, m, args, command, text, prefix}) => {
    const chatData = await getChat(m.chat)
    const stateArg = args[0]?.toLowerCase()
    const validStates = ['on', 'off', 'enable', 'disable']

    const mapTerms = {
      antilinks: 'antilinks',
      antienlaces: 'antilinks',
      antistatus: 'antistatus',
      antiestados: 'antistatus',
      antilink: 'antilinks',
      antinsfw: 'antinsfw',
      antiporno: 'antinsfw',
      welcome: 'welcome',
      goodbye: 'goodbye',
      despedidas: 'goodbye',
      bye: 'goodbye',
      bienvenidas: 'welcome',
      alerts: 'alerts',
      alertas: 'alerts',
      economy: 'rpg',
      rpg: 'rpg',
      economia: 'rpg',
      adminonly: 'adminonly',
      onlyadmin: 'adminonly',
      nsfw: 'nsfw',
      gacha: 'gacha',
      impuestosmode: 'impuestosActivos',
      modoimpuestos: 'impuestosActivos'
    }

    const featureNames = {
      antilinks: 'el *AntiEnlace*',
      antistatus: 'el *AntiEstado*',
      welcome: 'el mensaje de *Bienvenida*',
      goodbye: 'el mensaje de *Despedida*',
      antinsfw: 'el *AntiNsfw*',
      alerts: 'las *Alertas*',
      rpg: 'los comandos de *Economía*',
      gacha: 'los comandos de *Gacha*',
      adminonly: 'el modo *Solo Admin*',
      nsfw: 'los comandos *NSFW*',
      impuestosActivos: 'el sistema de *Impuestos*'
    }

    const featureTitles = {
      antilinks: 'AntiEnlace',
      antistatus: 'AntiEstado',
      antinsfw: 'AntiNsfw',
      welcome: 'Bienvenida',
      goodbye: 'Despedida',
      alerts: 'Alertas',
      rpg: 'Economía',
      gacha: 'Gacha',
      adminonly: 'AdminOnly',
      nsfw: 'NSFW',
      impuestosActivos: 'Impuestos'
    }

    const normalizedKey = mapTerms[command] || command
    const current = chatData[normalizedKey] === 1
    const estado = current ? '✓ Activado' : '✗ Desactivado'
    const nombreBonito = featureNames[normalizedKey] || `la función *${normalizedKey}*`
    const titulo = featureTitles[normalizedKey] || normalizedKey

    if (!stateArg) {
      return sock.reply(
        m.chat,
        `*✩ ${titulo} (✿❛◡❛)*\n` +
        `❒ *Estado ›* ${estado}\n\n` +
        `ꕥ Un administrador puede activar o desactivar ${nombreBonito} utilizando:\n\n` +
        `> ● _Habilitar ›_ *${prefix + normalizedKey} enable*\n` +
        `> ● _Deshabilitar ›_ *${prefix + normalizedKey} disable*\n\n${dev}`,
        m
      )
    }

    if (!validStates.includes(stateArg)) {
      return m.reply(
        `《✤》 Estado no válido. Usa *on*, *off*, *enable* o *disable*\n\nEjemplo:\n${prefix}${normalizedKey} enable`
      )
    }

    const enabled = ['on', 'enable'].includes(stateArg)

    if (chatData[normalizedKey] === (enabled ? 1 : 0)) {
      return m.reply(`《✤》 *${titulo}* ya estaba *${enabled ? 'activado' : 'desactivado'}*.`)
    }

      if (normalizedKey === 'impuestosActivos') {
      if (!chatData.rpg) {
        return m.reply(`✎ Activa primero la *Economía* con *${prefix}rpg enable* para poder usar impuestos.`)
      }

      if (enabled) {
        if (!chatData.impuestos) updateChat(m.chat, 'impuestos', {})
        const hora = chatData.impuestos?.horaPersonalizada ?? 9
const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
programarJobGrupo(sock, botId, m.chat, hora)
        updateChat(m.chat, 'impuestosActivos', 1)
        return m.reply(
          `✎ Has *activado* ${nombreBonito}.\n\n` +
          `⏰ El cobro se realizará diariamente a las *${hora}:00*.\n` +
          `💡 Puedes cambiar el horario con *${prefix}setimpuesto [0-23]*\n` +
          `📊 Consulta tu situación fiscal con *${prefix}impuestos*`
        )
      } else {
        cancelarJobGrupo(m.chat)
        updateChat(m.chat, 'impuestosActivos', 0)
        return m.reply(`✎ Has *desactivado* ${nombreBonito}.`)
      }
    }

    updateChat(m.chat, normalizedKey, enabled ? 1 : 0)
    if (normalizedKey === 'nsfw' && enabled) {
      chatData['antinsfw'] = 0;
      await updateChat(m.chat, 'antinsfw', 0);
    } else if (normalizedKey === 'antinsfw' && enabled) {
      chatData['nsfw'] = 0;
      await updateChat(m.chat, 'nsfw', 0);
    }
    return m.reply(`✎ Has *${enabled ? 'activado' : 'desactivado'}* ${nombreBonito}.`)
  }
};
