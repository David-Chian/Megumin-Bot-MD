import { TASA, MINIMO_EXENTO } from '../../core/impuestos.ts'

export default {
  command: ['impuestos'],
  category: 'rpg',
  run: async ({ sock, m }: any) => {
    if (!m.isGroup)
      return m.reply(`❌ Este comando solo puede usarse en grupos.`)

    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const monedas = getSettings(botId).currency || 'Diamantes 💎'
    const chat    = getChat(m.chat)

    if (!chat.rpg)
      return m.reply(`✎ Los comandos RPG están desactivados en este grupo.`)
    if (!chat.impuestosActivos)
      return m.reply(`✎ El sistema de impuestos no está activo en este grupo.`)

    const user = getChatUser(m.chat, m.sender)
    if (!user) return m.reply(`❌ No estás registrado en el bot.`)

    const coins  = user.coins || 0
    const bank   = user.bank  || 0
    const total  = coins + bank
    const exento = total <= MINIMO_EXENTO

    const impuesto   = exento ? 0 : Math.floor(total * TASA)
    const propCoins  = total > 0 ? coins / total : 0
    const desdeCoins = exento ? 0 : Math.floor(impuesto * propCoins)
    const desdeBank  = exento ? 0 : impuesto - desdeCoins

    const impuestos   = typeof chat.impuestos === 'string' ? JSON.parse(chat.impuestos || '{}') : (chat.impuestos || {})
    const horaActual  = impuestos?.horaPersonalizada ?? 9
    const hoy         = new Date().toISOString().slice(0, 10)
    const yaSecobro   = impuestos?.ultimoCobro === hoy
    const bancoComunal = impuestos?.banco || 0

    let msg = `🏛️ *INFORMACIÓN FISCAL*\n\n`
    msg += `👤 *Tu patrimonio*\n`
    msg += `💵 Cartera: *${coins.toLocaleString()} ${monedas}*\n`
    msg += `🏦 Banco: *${bank.toLocaleString()} ${monedas}*\n`
    msg += `⛁ Total: *${total.toLocaleString()} ${monedas}*\n\n`

    if (exento) {
      msg += `✅ Estás *exento* de impuestos.\n`
      msg += `_(Mínimo exento: ${MINIMO_EXENTO.toLocaleString()} ${monedas})_\n\n`
    } else {
      msg += `📊 *Cálculo del impuesto (${TASA * 100}%)*\n`
      msg += `💸 A pagar: *${impuesto.toLocaleString()} ${monedas}*\n`
      msg += `  › Desde cartera: *${desdeCoins.toLocaleString()} ${monedas}* (${Math.round(propCoins * 100)}%)\n`
      msg += `  › Desde banco: *${desdeBank.toLocaleString()} ${monedas}* (${Math.round((1 - propCoins) * 100)}%)\n\n`
    }

    msg += `⏰ Horario de cobro: *${horaActual}:00*\n`
    msg += `📅 Estado hoy: ${yaSecobro ? '✅ Ya se cobró' : '⏳ Pendiente'}\n`
    msg += `🏛️ Banco comunal: *${bancoComunal.toLocaleString()} ${monedas}*`

    return m.reply(msg)
  }
}