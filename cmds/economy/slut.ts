const msToTime = (duration: number) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (minutes === 0) return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`
}

function toM(a: string) {
  return '@' + a.split('@')[0]
}

function toNum(number: number) {
  if (number >= 1000000  || number <= -1000000)  return (number / 1000000).toFixed(1) + 'M'
  if (number >= 1000     || number <= -1000)      return (number / 1000).toFixed(1) + 'k'
  return number.toString()
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(list.length * Math.random())]
}

async function getGroupParticipants(sock: any, m: any, groupMetadata: any): Promise<any[]> {
  if (groupMetadata?.participants?.length) return groupMetadata.participants
  try {
    const meta = await sock.groupMetadata(m.chat)
    if (meta?.participants?.length) return meta.participants
  } catch {}
  if (m?.participants?.length) return m.participants
  return []
}

const aventurasExito = [
  'Pasaste una noche inolvidable con {cliente}',
  '{cliente} quedó fascinado con tu actuación',
  'La noche con {cliente} fue un éxito rotundo',
  'Fuiste la sensación para {cliente}, quien te recomendó a todos',
  '{cliente} te contrató para toda la noche y te pagó muy bien',
  '{cliente} quedó impresionado por tu carisma y te dio una propina generosa',
  'Organizaste un evento épico con {cliente} que todos recordarán',
  '{cliente} te pidió que volvieras porque fue una experiencia increíble',
  'Tu encanto deslumbró a {cliente}, quien no paró de alabarte',
  '{cliente} te premió con un cofre lleno de tesoros por tu talento',
  'Hiciste un trato perfecto con {cliente} y ambos salieron ganando',
  '{cliente} te nombró la estrella de la noche por tu gran desempeño',
  'Tu aventura con {cliente} fue tan buena que te ganaste su lealtad',
  '{cliente} quedó tan encantado que te pagó el doble por tus servicios',
  'Tuviste una noche salvaje con {cliente} y te llenó de billetes',
  '{cliente} no pudo resistirse a tu encanto y te dio una fortuna',
  'Hiciste un show inolvidable para {cliente} y te bañaron en {currency}',
  '{cliente} te pidió que volvieras mañana con una bolsa llena de XP',
  'Tu noche con {cliente} fue tan intensa que te dieron un bono extra',
  '{cliente} gritó tu nombre toda la noche y te dejó un montón de {currency}',
  'Lograste seducir a {cliente} y te llevaste todo su dinero',
]

const aventurasFracaso = [
  '{cliente} te miró, pero se fue sin pagar',
  '{cliente} se asustó y salió corriendo',
  'Pasaste horas esperando a {cliente}, pero no llegó',
  '{cliente} te confundió con otra persona y no te pagó',
  '{cliente} te hizo perder el tiempo y encima te robó {currency}',
  '{cliente} canceló el trato en el último momento y te dejó sin nada',
  'Intentaste impresionar a {cliente}, pero se rió y se fue',
  '{cliente} dijo que no estaba interesado y te dejó plantado',
  'Un malentendido con {cliente} hizo que perdieras tu oportunidad',
  '{cliente} te prometió una gran recompensa, pero era una estafa',
  'Tu plan con {cliente} salió mal y terminaste perdiendo recursos',
  'Intentaste negociar con {cliente}, pero no lograste convencerlo',
  '{cliente} te ignoró completamente y se fue con alguien más',
  '{cliente} te dejó plantado después de prometerte una noche inolvidable',
  'Intentaste conquistar a {cliente}, pero se rió en tu cara y se fue',
  '{cliente} te dio un billete falso y se escapó con tus {currency}',
  'Tu plan con {cliente} fue un desastre y te dejó sin un centavo',
  '{cliente} te rechazó diciendo que no eras su tipo y te robó XP',
  'Pasaste la noche con {cliente}, pero se fue sin dejar ni un dulce',
  '{cliente} te prometió una gran suma, pero te estafó y huyó',
  'Intentaste un movimiento atrevido con {cliente}, pero te dio un portazo',
]

export default {
  command: ['slut'],
  category: 'rpg',

  run: async ({ sock, m, groupMetadata }: any) => {
    if (!m.isGroup)
      return m.reply('❌ Este comando solo funciona en grupos.')

    const chatId  = m.chat
    const sender  = m.sender
    const botId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const chatData = getChat(chatId)
    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const botSettings = getSettings(botId)
    const currency    = botSettings?.currency || 'Monedas'

    const participants = await getGroupParticipants(sock, m, groupMetadata)
    if (!participants.length)
      return m.reply('⚠️ No pude obtener los participantes del grupo. Intenta de nuevo en unos segundos.')

    const user     = getChatUser(chatId, sender)
const userData = getUser(sender)
    const now       = Date.now()
    const cooldown  = 10 * 60 * 1000
    const remaining = (user.slutCooldown || 0) - now

    if (remaining > 0)
      return m.reply(`💋 Debes esperar ⏱️ *${msToTime(remaining)}* para volver a prostituirte.`)

    const posiblesClientes = participants
      .map((v: any) => v.id || v.jid)
      .filter((id: string) => id && id !== sender && id !== botId)

    if (posiblesClientes.length === 0)
      return m.reply('💔 No hay clientes disponibles ahora mismo...')

    const clienteId  = posiblesClientes[Math.floor(Math.random() * posiblesClientes.length)]
    const clienteTag = toM(clienteId)
    const exito      = Math.random() < 0.7

    updateChatUser(chatId, sender, 'slutCooldown', now + cooldown)

    if (!user.stats) user.stats = {}
    const stats = typeof user.stats === 'string' ? JSON.parse(user.stats) : user.stats
    if (typeof stats.prostituirse !== 'number') stats.prostituirse = 0

    if (exito) {
      const xpGanado      = Math.floor(Math.random() * (1000 - 500 + 1)) + 500
      const monedasGanadas = Math.floor(Math.random() * (5000 - 5 + 1)) + 5

      updateChatUser(chatId, sender, 'coins', (user.coins || 0) + monedasGanadas)
      updateUser(sender, 'exp', (userData.exp || 0) + xpGanado)
      stats.prostituirse++
      updateChatUser(chatId, sender, 'stats', stats)

      const texto = pickRandom(aventurasExito)
        .replace('{cliente}', clienteTag)
        .replace('{currency}', currency)

      return sock.sendMessage(chatId, {
        text: `💄 ${texto} y ganaste *${toNum(xpGanado)} XP* + *${monedasGanadas.toLocaleString()} ${currency}*.`,
        mentions: [clienteId]
      }, { quoted: m })

    } else {
      const xpPerdido      = Math.floor(Math.random() * (4000 - 200 + 1)) + 200
      const monedasPerdidas = Math.floor(Math.random() * (4000 - 2 + 1)) + 2

      const coins    = user.coins || 0
      const bank     = user.bank  || 0
      const total    = coins + bank

      if (total >= monedasPerdidas) {
        if (coins >= monedasPerdidas) {
          updateChatUser(chatId, sender, 'coins', coins - monedasPerdidas)
        } else {
          const resto = monedasPerdidas - coins
          updateChatUser(chatId, sender, 'coins', 0)
          updateChatUser(chatId, sender, 'bank',  Math.max(0, bank - resto))
        }
      } else {
        updateChatUser(chatId, sender, 'coins', 0)
        updateChatUser(chatId, sender, 'bank',  0)
      }
      updateUser(sender, 'exp', Math.max(0, (userData.exp || 0) - xpPerdido))
      const texto = pickRandom(aventurasFracaso)
        .replace('{cliente}', clienteTag)
        .replace('{currency}', currency)

      return sock.sendMessage(chatId, {
        text: `💔 ${texto} Perdiste *${toNum(xpPerdido)} XP* y *${monedasPerdidas.toLocaleString()} ${currency}*...`,
        mentions: [clienteId]
      }, { quoted: m })
    }
  }
}