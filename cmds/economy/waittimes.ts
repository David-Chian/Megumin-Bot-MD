import crypto from 'crypto'

const BAR_LEN = 12
const oneDay  = 24 * 60 * 60 * 1000

type CdDef = { key: string; label: string; total: number }

const CD_DEFS: CdDef[] = [
  { key: 'workCooldown',   label: 'Work',     total: 10  * 60000 },
  { key: 'carreraCooldown',   label: 'Carrera',     total: 15  * 60000 },
  { key: 'slutCooldown',   label: 'Slut',     total: 10  * 60000 },
  { key: 'crimeCooldown',  label: 'Crime',    total: 10  * 60000 },
  { key: 'roboCooldown',   label: 'Steal',    total: 30  * 60000 },
  { key: 'ritualCooldown', label: 'Ritual',   total: 15  * 60000 },
  { key: 'lastslot',       label: 'Slot',     total: 10  * 60000 },
  { key: 'lastfish',       label: 'Fish',     total: 8  * 60000 },
{ key: 'lastplant',       label: 'Plantar',     total: 8  * 60000 },
  { key: 'lasthunt',       label: 'Hunt',     total: 15  * 60000 },
  { key: 'lastdungeon',    label: 'Dungeon',  total: 17  * 60000 },
  { key: 'mineCooldown',   label: 'Mine',     total: 10  * 60000 },
  { key: 'rtCooldown',     label: 'Ruleta',   total: 10  * 60000 },
  { key: 'pptCooldown',    label: 'Ppt',      total: 10   * 60000 },
  { key: 'tttCooldown',    label: 'Ttt',      total: 5   * 60000 },
  { key: 'memoryCooldown', label: 'Memory',   total: 10   * 60000 },
  { key: 'plinkoCooldown', label: 'Plinko',   total: 30   * 60000 },
  { key: 'holCooldown',    label: 'Hol',      total: 30   * 60000 },
  { key: 'coinfCooldown',  label: 'Coinflip', total: 10   * 60000 },
  { key: 'dueloCooldown',  label: 'Duelo',    total: 5   * 60000 },
  { key: 'lastDaily',      label: 'Daily',    total: oneDay       },
  { key: 'lastWeekly',     label: 'Weekly',   total: 7  * oneDay  },
  { key: 'lastMonthly',    label: 'Monthly',  total: 30 * oneDay  },
  { key: 'c4Cooldown',       label: 'C4',        total: 10 * 60000 },
  { key: 'ahorcadoCooldown', label: 'Ahorcado',  total: 10 * 60000 },
  { key: 'lastLumbox',       label: 'Lumbox',    total: 15 * 60000 },
]

const TOKEN_PALETTE = ['KEYWORD', 'METHOD', 'NUMBER', 'STR', 'DEFAULT']

function formatTime(ms: number): string {
  if (ms <= 0) return '✔ Listo'
  const s   = Math.floor(ms / 1000)
  const d   = Math.floor(s / 86400)
  const h   = Math.floor((s % 86400) / 3600)
  const min = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts: string[] = []
  if (d)   parts.push(`${d}d`)
  if (h)   parts.push(`${h}h`)
  if (min) parts.push(`${min}m`)
  if (sec) parts.push(`${sec}s`)
  return parts.join(' ')
}

function buildBar(remaining: number, total: number): string {
  if (total <= 0 || remaining <= 0) return '■'.repeat(BAR_LEN)
  const elapsed = total - remaining
  const ratio   = Math.max(0, Math.min(1, elapsed / total))
  const filled  = Math.round(ratio * BAR_LEN)
  return '■'.repeat(filled) + '□'.repeat(BAR_LEN - filled)
}

function calcPct(remaining: number, total: number): number {
  if (total <= 0 || remaining <= 0) return 100
  const elapsed = total - remaining
  return Math.round(Math.max(0, Math.min(1, elapsed / total)) * 100)
}
function calcRemaining(raw: number, total: number, key: string, now: number): number {
  const endsAt = key.startsWith('last') ? raw + total : raw
  return Math.max(0, endsAt - now)
}

export default {
  command: ['waittimes', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'rpg',

  run: async ({ sock, m }: any) => {
    const botId       = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = getSettings(botId)
    const chatData    = getChat(m.chat)

    if (chatData.adminonly || !chatData.rpg)
      return m.reply(mess.comandooff)

    const user     = getChatUser(m.chat, m.sender)
    const now      = Date.now()
    const coins    = user.coins || 0
    const bank     = user.bank  || 0
    const currency = botSettings?.currency || 'Coins'
    const name     = m.pushName || m.sender.split('@')[0]

    const computed = CD_DEFS.map(def => {
      const raw       = user[def.key] || 0
      const remaining = calcRemaining(raw, def.total, def.key, now)
      return { ...def, remaining }
    })

    const sections = [
      {
        title: '— Economía / Trabajo —',
        keys: ['workCooldown','slutCooldown','crimeCooldown','roboCooldown',
               'ritualCooldown']
      },
      {
        title: '— Mini-juegos —',
        keys: ['lastslot','lastfish', 'lastplant','lasthunt','lastdungeon','mineCooldown',
               'rtCooldown','pptCooldown','tttCooldown','memoryCooldown',
               'plinkoCooldown','holCooldown','coinfCooldown','dueloCooldown', 'carreraCooldown','c4Cooldown','ahorcadoCooldown']
      },
      {
        title: '— Recompensas —',
        keys: ['lastDaily','lastWeekly','lastMonthly','lastLumbox']
      },
    ]

    const allTokens: { content: string; type: string }[] = []

    const push  = (text: string, type: string) => {
      allTokens.push({ content: text, type })
      allTokens.push({ content: '\n', type: 'DEFAULT' })
    }
    const blank = () => allTokens.push({ content: '\n', type: 'DEFAULT' })

    push(`ꕤ  ${name}  —  Cooldowns`, 'KEYWORD')
    blank()

    sections.forEach((sec, secIdx) => {
      const color = TOKEN_PALETTE[secIdx % TOKEN_PALETTE.length]
      push(sec.title, color)
      blank()

      for (const key of sec.keys) {
        const cd  = computed.find(c => c.key === key)!
        const bar = buildBar(cd.remaining, cd.total)
        const pct = calcPct(cd.remaining, cd.total)
        const time = formatTime(cd.remaining)
        push(`${cd.label.padEnd(10)}  ${time}`, color)
        push(`${bar}  ${pct}%`, color)
        blank()
      }
    })

    blank()
    push(`Coins  ¥${coins.toLocaleString()}  ${currency}`, 'NUMBER')
    push(`Banco  ¥${bank.toLocaleString()}   ${currency}`, 'NUMBER')

    const payload = {
      response_id: crypto.randomUUID(),
      sections: [
        {
          view_model: {
            primitive: {
              text: `ꕤ Cooldowns › ${name}`,
              __typename: 'GenAIMarkdownTextUXPrimitive'
            },
            __typename: 'GenAISingleLayoutViewModel'
          }
        },
        {
          view_model: {
            primitive: {
              language: 'javascript',
              code_blocks: allTokens,
              __typename: 'GenAICodeUXPrimitive'
            },
            __typename: 'GenAISingleLayoutViewModel'
          }
        }
      ]
    }

    const content = {
      messageContextInfo: {
        deviceListMetadataVersion: 2,
        messageSecret: crypto.randomBytes(32).toString('base64')
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            submessages: [],
            messageType: 1,
            unifiedResponse: {
              data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
            },
            contextInfo: {
              isForwarded: true,
              forwardedAiBotMessageInfo: { botJid: '259786046210223@bot' },
              forwardOrigin: 4,
              mentionedJid: [m.sender],
              participant: m.sender,
              remoteJid: m.chat,
              quotedMessage: m.message
            }
          }
        }
      }
    }

    await sock.relayMessage(m.chat, content, { quoted: m })
  }
}