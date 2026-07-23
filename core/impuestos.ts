import { scheduleJob } from 'node-schedule'

const TIMEZONE    = 'America/Havana'
export const TASA          = 0.03
export const MINIMO_EXENTO = 5000
const DELAY_BASE  = 3000
const DELAY_MAX   = 10000

const jobsPorGrupo: Record<string, any> = {}
const colaEnvio: { sock: any; chatId: string; msg: string }[] = []
let procesandoCola = false

async function encolarMensaje(sock: any, chatId: string, msg: string) {
  colaEnvio.push({ sock, chatId, msg })
  if (!procesandoCola) procesarCola()
}

async function procesarCola() {
  if (procesandoCola) return
  procesandoCola = true

  let consecutivos = 0
  let delay = DELAY_BASE

  while (colaEnvio.length > 0) {
    const { sock, chatId, msg } = colaEnvio.shift()!
    try {
      await sock.sendMessage(chatId, { text: msg })
      consecutivos++
      if (consecutivos % 2 === 0) delay = Math.min(delay + 1500, DELAY_MAX)
    } catch (e: any) {
      console.error(`[IMPUESTOS] Error enviando a ${chatId}:`, e.message)
    }
    await new Promise(r => setTimeout(r, delay))
  }

  procesandoCola = false
  delay          = DELAY_BASE
  consecutivos   = 0
}

export async function iniciarImpuestos(sock: any) {
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const chats = getChat()
  const hoy   = new Date().toISOString().slice(0, 10)
  let total   = 0

  for (const chat of chats) {
    if (!chat.rpg || !chat.impuestosActivos) continue
    if (chat.primaryBot && chat.primaryBot !== botId) continue

    const impuestos = typeof chat.impuestos === 'string'
      ? JSON.parse(chat.impuestos || '{}')
      : (chat.impuestos || {})

    const hora = impuestos?.horaPersonalizada ?? 9

    const yaHoraDeHoy = new Date().getHours() >= hora
    if (impuestos?.ultimoCobro !== hoy && yaHoraDeHoy) {
      await ejecutarImpuestoGrupo(sock, botId, chat.id)
    }

    programarJobGrupo(sock, botId, chat.id, hora)
    total++
  }
}

export function programarJobGrupo(sock: any, botId: string, chatId: string, hora: number) {
  if (jobsPorGrupo[chatId]) {
    jobsPorGrupo[chatId].cancel()
    delete jobsPorGrupo[chatId]
  }

  jobsPorGrupo[chatId] = scheduleJob(
    { rule: `0 ${hora} * * *`, tz: TIMEZONE },
    () => ejecutarImpuestoGrupo(sock, botId, chatId)
  )
}

export function cancelarJobGrupo(chatId: string) {
  if (jobsPorGrupo[chatId]) {
    jobsPorGrupo[chatId].cancel()
    delete jobsPorGrupo[chatId]
  }
}

export async function ejecutarImpuestoGrupo(sock: any, botId: string, chatId: string) {
  try {
    const chat = getChat(chatId)
    if (!chat?.rpg || !chat?.impuestosActivos) return
    if (chat.primaryBot && chat.primaryBot !== botId) return

    const hoy       = new Date().toISOString().slice(0, 10)
    const impuestos = typeof chat.impuestos === 'string'
      ? JSON.parse(chat.impuestos || '{}')
      : (chat.impuestos || {})

    if (impuestos?.ultimoCobro === hoy) return

    const monedas      = getSettings(botId).currency || 'Diamantes 💎'
    let totalRecaudado = 0
    let afectados      = 0

    const usuarios = getChatUser(chatId)
    for (const row of usuarios) {
      const sender = row.user_id
      const user   = getChatUser(chatId, sender)

      const coins = user.coins || 0
      const bank  = user.bank  || 0
      const total = coins + bank
      if (total <= MINIMO_EXENTO) continue

      const impuesto   = Math.floor(total * TASA)
      const propCoins  = total > 0 ? coins / total : 0
      const desdeCoins = Math.floor(impuesto * propCoins)
      const desdeBank  = impuesto - desdeCoins

      updateChatUser(chatId, sender, 'coins', coins - desdeCoins)
      updateChatUser(chatId, sender, 'bank', Math.max(0, bank - desdeBank))

      totalRecaudado += impuesto
      afectados++
    }

    impuestos.ultimoCobro = hoy
    impuestos.banco       = (impuestos.banco || 0) + totalRecaudado
    updateChat(chatId, 'impuestos', impuestos)

    if (afectados === 0) return

    const msg =
      `🏛️ *RECAUDACIÓN DE IMPUESTOS*\n\n` +
      `Se cobró el *${TASA * 100}%* sobre el patrimonio total de *${afectados}* ciudadanos.\n` +
      `💸 Recaudado hoy: *${totalRecaudado.toLocaleString()} ${monedas}*\n` +
      `🏦 Banco del grupo: *${impuestos.banco.toLocaleString()} ${monedas}*\n\n` +
      `_El impuesto se distribuye proporcionalmente entre cartera y banco._`

    await encolarMensaje(sock, chatId, msg)
  } catch (e: any) {
    console.error(`[IMPUESTOS] Error en ejecutarImpuestoGrupo (${chatId}):`, e)
  }
}