import { programarJobGrupo } from '../../core/impuestos.ts'

export default {
  command: ['setimpuesto'],
  category: 'rpg',
  isAdmin: true,
  run: async ({ sock, m, args }: any) => {
    if (!m.isGroup)
      return m.reply(`❌ Este comando solo puede usarse en grupos.`)

    const botId    = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const chat     = getChat(m.chat)

    if (!chat.rpg)
      return m.reply(`✎ Los comandos RPG están desactivados en este grupo.`)
    if (!chat.impuestosActivos)
      return m.reply(`✎ El sistema de impuestos no está activo en este grupo.`)

    const hora = parseInt(args[0])
    if (isNaN(hora) || hora < 0 || hora > 23)
      return m.reply(
        `📋 *Uso:* \`setimpuesto [hora]\`\n\n` +
        `La hora debe ser un número entre *0 y 23*.\n` +
        `*Ejemplos:*\n` +
        `› \`setimpuesto 9\` → 09:00\n` +
        `› \`setimpuesto 20\` → 20:00`
      )

    const hoy       = new Date().toISOString().slice(0, 10)
    const impuestos = typeof chat.impuestos === 'string' ? JSON.parse(chat.impuestos || '{}') : (chat.impuestos || {})
    const yaSecobro = impuestos?.ultimoCobro === hoy

    impuestos.horaPersonalizada = hora
    updateChat(m.chat, 'impuestos', impuestos)

    programarJobGrupo(sock, botId, m.chat, hora)

    let msg = `✅ Horario de impuestos actualizado a *${hora}:00* para este grupo.\n`
    msg += yaSecobro
      ? `⚠️ Los impuestos ya fueron cobrados hoy, el nuevo horario aplicará *mañana*.`
      : `⏰ El próximo cobro será hoy a las *${hora}:00*.`

    return m.reply(msg)
  }
}