import fs from 'fs'

interface Character {
  name: string
  gender: string
  source: string
  value: number
  url: string
  votes: number
}

interface CardStats {
  hp: number
  maxHp: number
  atk: number
  critChance: number
  critMult: number
  missChance: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
}

interface BattleCard {
  character: Character
  stats: CardStats
  owner: string
  index: number
  uid: string
}

interface BossCard {
  name: string
  stats: CardStats
  emoji: string
}

type BattlePhase = 'picking' | 'fighting' | 'done'

interface AdventureBattle {
  mode: 'adventure'
  phase: BattlePhase
  playerId: string
  chatId: string
  playerCards: BattleCard[]
  bosses: BossCard[]
  currentTurn: number
  log: string[]
  difficulty: number
  startedAt: number
}

interface PvpBattle {
  mode: 'pvp'
  phase: BattlePhase
  player1: string
  player2: string
  chatId: string
  cards1: BattleCard[]
  cards2: BattleCard[]
  pickingDone1: boolean
  pickingDone2: boolean
  currentTurn: 'p1' | 'p2'
  log: string[]
  startedAt: number
  awaitingAttack?: { attackerIdx: number; targetIdx: number } | null
  awaitingChoice?: string
}

const adventureSessions = new Map<string, AdventureBattle>()
const pvpSessions       = new Map<string, PvpBattle>()
const pvpChallenges     = new Map<string, { challenger: string; expires: number }>()

const ADVENTURE_COOLDOWN_MS = 1 * 60 * 60 * 1000 
const PICK_TIMEOUT_MS       = 60_000
const BATTLE_TIMEOUT_MS     = 3 * 60_000
const CARD_COOLDOWN_MS      = 24 * 60 * 60 * 1000 // cooldown de 24h por carta usada (PvP y Aventura)

const MIN_CARD_VALUE   = 1000
const CARD_LIST_PAGE_SIZE = 30
const PVP_WIN_REWARD   = 50_000
const PVP_ABANDON_EXP_PENALTY = 5000

const RARITY_THRESHOLDS: [number, CardStats['rarity']][] = [
  [200,  'mythic'],
  [120,  'legendary'],
  [70,   'epic'],
  [30,   'rare'],
  [0,    'common'],
]

const RARITY_EMOJI: Record<CardStats['rarity'], string> = {
  common:    '⚪',
  rare:      '🔵',
  epic:      '🟣',
  legendary: '🟡',
  mythic:    '🔴',
}

function getRarity(value: number): CardStats['rarity'] {
  for (const [threshold, rarity] of RARITY_THRESHOLDS) {
    if (value >= threshold) return rarity
  }
  return 'common'
}

function deriveStats(character: Character): CardStats {
  const rarity = getRarity(character.value)
  const v      = character.value

  const hp = Math.round(v * 0.5)
  const atk = Math.round(v * 0.1)
  const critChance = 0.30
  const critMult = 1.5
  const missChance = 0.30

  return { hp, maxHp: hp, atk, critChance, critMult, missChance, rarity }
}

function deriveBossStats(difficulty: number, isSingle: boolean): CardStats {
  const base = {
    1: { hp: 1500, atk: 150 },
    2: { hp: 2500, atk: 250 },
    3: { hp: 3500, atk: 350 },
    4: { hp: 5000, atk: 500 },
    5: { hp: 15000, atk: 750 },
  }[difficulty]!
  const mult = 1
  const critChanceTable = {
    1: 0.05,
    2: 0.10,
    3: 0.15,
    4: 0.20,
    5: 0.30,
  }
  return {
    hp: Math.round(base.hp * mult),
    maxHp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * mult),
    critChance: critChanceTable[difficulty],
    critMult: 1.5,
    missChance: 0.20,
    rarity: 'mythic',
  }
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function hpBar(current: number, max: number, len = 12): string {
  const ratio   = Math.max(0, current / max)
  const filled  = Math.round(ratio * len)
  const empty   = len - filled
  const bar     = '█'.repeat(filled) + '░'.repeat(empty)
  const pct     = Math.round(ratio * 100)
  return `${bar}  ${pct}%  (${Math.max(0, current).toLocaleString()}/${max.toLocaleString()})`
}

function atkRoll(attacker: CardStats): { dmg: number; type: 'normal' | 'critical' | 'miss' } {
  const r = Math.random()
  if (r < attacker.missChance)  return { dmg: 0,                                     type: 'miss'     }
  if (r < attacker.missChance + attacker.critChance) {
    return { dmg: Math.round(attacker.atk * attacker.critMult), type: 'critical' }
  }
  const variance = 0.85 + Math.random() * 0.30
  return { dmg: Math.round(attacker.atk * variance), type: 'normal' }
}

function aliveCards(cards: BattleCard[]): BattleCard[] { return cards.filter(c => c.stats.hp > 0) }
function aliveBosses(bosses: BossCard[]):  BossCard[]  { return bosses.filter(b => b.stats.hp > 0) }

function cardLine(card: BattleCard): string {
  const r = RARITY_EMOJI[card.stats.rarity]
  return `${r} *${card.character.name}*\n     ❤️ ${hpBar(card.stats.hp, card.stats.maxHp)}`
}

function bossLine(boss: BossCard): string {
  return `${boss.emoji} *${boss.name}*\n     ❤️ ${hpBar(boss.stats.hp, boss.stats.maxHp)}`
}

const BOSS_NAMES: Record<number, string[]> = {
  1: ['Goblin Jefe', 'Lobo Salvaje', 'Bandido Mayor'],
  2: ['Caballero Oscuro', 'Gólem de Piedra', 'Señor del Pantano'],
  3: ['Dragón Menor', 'Espectro Antiguo', 'Titán de Hielo'],
  4: ['Señor de las Sombras', 'Bestia Primordial', 'Lich Supremo'],
  5: ['DIOS DE LA DESTRUCCIÓN', 'EL DEVORADOR', 'ABISMO ETERNO'],
}

const BOSS_EMOJIS: Record<number, string[]> = {
  1: ['👺', '🐺', '🗡️'],
  2: ['🛡️', '🪨', '🌿'],
  3: ['🐉', '👻', '❄️'],
  4: ['🌑', '💀', '⚡'],
  5: ['☠️', '🌀', '🔱'],
}

function generateBosses(difficulty: number): BossCard[] {
  const isSingle = difficulty === 5
  const count = isSingle ? 1 : 3
  return Array.from({ length: count }, (_, i) => {
    const names  = BOSS_NAMES[difficulty]
    const emojis = BOSS_EMOJIS[difficulty]
    return {
      name:  names[i % names.length],
      emoji: emojis[i % emojis.length],
      stats: deriveBossStats(difficulty, isSingle),
    }
  })
}

function adventureRewards(difficulty: number, characters: Character[]): { coins: number; card?: Character; materialMsg: string } {
  let coins = 50000

switch (difficulty) {
  case 1:
    coins = Math.floor(Math.random() * 20001) + 30000
    break
  case 2:
    coins = Math.floor(Math.random() * 25001) + 50000
    break
  case 3:
    coins = Math.floor(Math.random() * 25001) + 75000 
    break
  case 4:
    coins = Math.floor(Math.random() * 25001) + 100000 
    break
  case 5:
    coins = 150000
    break
}
  const card= undefined
  const materialMsg= undefined
  return { coins, card, materialMsg }
}

function generateCardUid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Asegura que cada carta (entrada en chatUser.characters) tenga un `uid` propio y estable.
 * Esto es necesario porque el ÍNDICE de una carta en el array puede cambiar cuando se
 * gana/pierde otra carta (el array se reordena al hacer splice/filter/push), mientras que
 * el cooldown debe pertenecer a la carta en sí, no a la posición que ocupa en ese momento.
 * Si alguna carta no tiene uid (cartas ya existentes de antes de este cambio), se le asigna
 * uno nuevo y se persiste una sola vez.
 */
function ensureCardUids(chatId: string, userId: string, chatUser: any): any[] {
  const chars = Array.isArray(chatUser?.characters) ? chatUser.characters : []
  let changed = false
  const withUids = chars.map((entry: any) => {
    if (entry && typeof entry === 'object' && !entry.uid) {
      changed = true
      return { ...entry, uid: generateCardUid() }
    }
    return entry
  })
  if (changed) {
    updateChatUser(chatId, userId, 'characters', withUids)
  }
  return withUids
}

async function getUserCards(chatId: string, userId: string, characters: Character[]): Promise<{ card: BattleCard; idx: number }[]> {
  const chatUser = getChatUser(chatId, userId) as any
  const chars = ensureCardUids(chatId, userId, chatUser)
  if (!chars || chars.length === 0) return []

  return chars.map((entry: any, idx: number) => {
    if (!entry || typeof entry !== 'object' || !entry.name) return null
    const character: Character = {
      name:   entry.name,
      gender: entry.gender,
      source: entry.source,
      value:  entry.value ?? 0,
      url:    entry.url,
      votes:  entry.votes ?? 0,
    }
    const stats = deriveStats(character)
    return { card: { character, stats, owner: userId, index: idx, uid: entry.uid }, idx }
  }).filter(Boolean)
}

function isCardSelectable(character: Character): boolean {
  return (character.value ?? 0) >= MIN_CARD_VALUE
}

function cardPower(card: BattleCard): number {
  return card.stats.maxHp + card.stats.atk
}

function sortCardsByPower(cards: { card: BattleCard; idx: number }[]): { card: BattleCard; idx: number }[] {
  return [...cards].sort((a, b) => cardPower(b.card) - cardPower(a.card))
}

/**
 * Mapa de cooldowns { uid_de_carta: timestamp_de_uso }, guardado en la columna existente
 * `usedCardsToday` (no se crean columnas nuevas en la DB). El cooldown es POR CARTA (por uid),
 * nunca por jugador ni por combate.
 */
function getCardCooldownMap(chatUser: any): Record<string, number> {
  const raw = chatUser?.usedCardsToday
  if (raw && !Array.isArray(raw) && typeof raw === 'object') return raw as Record<string, number>
  return {}
}

function cooldownRemainingMs(cooldowns: Record<string, number>, uid: string): number {
  const ts = cooldowns[uid]
  if (!ts) return 0
  return Math.max(0, CARD_COOLDOWN_MS - (Date.now() - ts))
}

function isCardOnCooldown(cooldowns: Record<string, number>, uid: string): boolean {
  return cooldownRemainingMs(cooldowns, uid) > 0
}

function formatCooldownDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h`
  return `${minutes}min`
}

/**
 * Bloquea las cartas indicadas (por uid) durante 24 horas. Debe llamarse en el instante
 * exacto en que el jugador confirma qué cartas usará para un combate (Aventura o PvP),
 * ANTES de resolver el combate, para que el cooldown se aplique sin importar si luego
 * gana, pierde, empata, el combate se cancela o ocurre un error durante la resolución.
 */
function applyCardCooldown(chatId: string, userId: string, chatUser: any, uids: string[]) {
  const now = Date.now()
  const cooldowns: Record<string, number> = { ...getCardCooldownMap(chatUser) }
  for (const uid of uids) {
    if (uid) cooldowns[uid] = now
  }
  updateChatUser(chatId, userId, 'usedCardsToday', cooldowns)
}

async function buildCardPools(chatId: string, userId: string, characters: Character[]) {
  const chatUser  = getChatUser(chatId, userId) as any
  const cooldowns = getCardCooldownMap(chatUser)
  const allCards  = await getUserCards(chatId, userId, characters)
  const available  = allCards.filter(({ card }) => !isCardOnCooldown(cooldowns, card.uid))
  const onCooldown = allCards.filter(({ card }) => isCardOnCooldown(cooldowns, card.uid))
  const selectable = sortCardsByPower(available.filter(({ card }) => isCardSelectable(card.character)))
  return { chatUser, cooldowns, allCards, available, onCooldown, selectable }
}

function formatCardList(cards: { card: BattleCard; idx: number }[]): string {
  const shown = cards.slice(0, CARD_LIST_PAGE_SIZE)
  let str = shown.map(({ card }, i) => {
    const r = RARITY_EMOJI[card.stats.rarity]
    return `  ${i + 1}. ${r} ${card.character.name} (${card.character.source}) — ⚔️${card.stats.atk} ❤️${card.stats.maxHp}`
  }).join('\n')

  if (cards.length === 0) {
    return '  _No tienes cartas que cumplan el valor mínimo requerido._'
  }

  if (cards.length > CARD_LIST_PAGE_SIZE) {
    const restantes = cards.length - CARD_LIST_PAGE_SIZE
    str += `\n\n_...y ${restantes} carta(s) más. Escribe el *nombre* exacto o aproximado de la carta para elegirla aunque no aparezca en esta lista._`
  }

  return str
}

function resolveCardSelection(
  tokens: string[],
  selectablePage: { card: BattleCard; idx: number }[],
  available: { card: BattleCard; idx: number }[],
  onCooldown: { card: BattleCard; idx: number }[] = [],
  cooldowns: Record<string, number> = {},
): { cards?: BattleCard[]; error?: string } {
  if (tokens.length !== 3) {
    return { error: '❌ Elige 3 cartas (por número o por nombre aproximado). Ej: `1,3,7` o `Naruto,Luffy,Goku`' }
  }

  const findByName = (pool: { card: BattleCard; idx: number }[], lower: string) =>
    pool.find(({ card }) => card.character.name.toLowerCase().trim() === lower) ??
    pool.find(({ card }) => card.character.name.toLowerCase().trim().split(/\s+/).includes(lower)) ??
    pool.find(({ card }) => card.character.name.toLowerCase().includes(lower))

  const chosenEntries: { card: BattleCard; idx: number }[] = []

  for (const raw of tokens) {
    const token = raw.trim()
    if (!token) return { error: '❌ Selección inválida. Verifica los valores enviados.' }

    const asNumber = /^\d+$/.test(token) ? parseInt(token) : NaN

    let entry: { card: BattleCard; idx: number } | undefined

    if (!isNaN(asNumber)) {
      entry = selectablePage[asNumber - 1]
      if (!entry) {
        return { error: `❌ Carta #${asNumber} no válida. Usa un número de la lista mostrada o escribe el nombre aproximado de la carta.` }
      }
    } else {
      const lower = token.toLowerCase().trim()

      const byName = findByName(available, lower)
      if (!byName) {
        // Si no está disponible, revisamos si es porque está en cooldown para dar un mensaje claro.
        const cooling = findByName(onCooldown, lower)
        if (cooling) {
          const remaining = cooldownRemainingMs(cooldowns, cooling.card.uid)
          return { error: `⏳ *${cooling.card.character.name}* está en cooldown (24h por uso). Vuelve a estar disponible en *${formatCooldownDuration(remaining)}*.` }
        }
        return { error: `❌ No se encontró la carta "*${token}*" entre tus cartas disponibles.` }
      }
      if (!isCardSelectable(byName.card.character)) {
        return { error: `❌ *${byName.card.character.name}* no cumple con el valor mínimo requerido (${MIN_CARD_VALUE.toLocaleString()}) para ser seleccionada.` }
      }
      entry = byName
    }

    chosenEntries.push(entry)
  }

  return { cards: chosenEntries.map(({ card }) => ({ ...card, stats: { ...card.stats } })) }
}

async function startAdventure(sock: any, m: any, characters: Character[]) {
  const chatId = m.chat as string
  const userId = m.sender as string
  const key    = `${chatId}:${userId}`

  const { chatUser, selectable, onCooldown } = await buildCardPools(chatId, userId, characters)
  const lastRun  = chatUser?.lastAdventure ?? 0
  const elapsed  = Date.now() - lastRun
  if (elapsed < ADVENTURE_COOLDOWN_MS) {
    const remaining = Math.ceil((ADVENTURE_COOLDOWN_MS - elapsed) / 60_000)
    //return sock.reply(m.chat, `⏳ Tus cartas están descansando. Podrás jugar en *${remaining} min*.`, m, m.rcanal)
  }

  if (adventureSessions.has(key)) {
    return sock.reply(m.chat, '⚔️ Ya tienes una aventura en curso.', m, m.rcanal)
  }

  if (selectable.length < 3) {
    return sock.reply(m.chat, `🃏 Necesitas al menos *3 cartas disponibles* (sin reposo y con valor ≥ ${MIN_CARD_VALUE.toLocaleString()}) para jugar.\nTienes ${selectable.length} carta(s) que cumplen el requisito hoy.${onCooldown.length > 0 ? `\n⏳ ${onCooldown.length} carta(s) están en cooldown de 24h.` : ''}`, m, m.rcanal)
  }

  const cardListStr = formatCardList(selectable)
  const cooldownNote = onCooldown.length > 0 ? `\n\n⏳ _${onCooldown.length} carta(s) en cooldown de 24h (no se pueden usar aún). Escribe el nombre exacto de una de ellas para ver cuánto falta._` : ''
  const session: AdventureBattle = {
    mode: 'adventure',
    phase: 'picking',
    playerId: userId,
    chatId,
    playerCards: [],
    bosses: [],
    currentTurn: 0,
    log: [],
    difficulty: 0,
    startedAt: Date.now(),
  }
  adventureSessions.set(key, session)

  await sock.reply(m.chat,
    `🗺️ *MODO AVENTURA*\n\nElige *3 cartas* para la batalla.\nResponde con los números separados por coma (ej: \`1,5,9\`) o con los nombres aproximados(ej: \`Naruto,Luffy,Goku\`).\n\n*Tus cartas disponibles:*\n${cardListStr}${cooldownNote}\n\n_Tienes 60 segundos para elegir._`,
    m, m.rcanal,
  )

  setTimeout(() => {
    const s = adventureSessions.get(key)
    if (s?.phase === 'picking') {
      adventureSessions.delete(key)
      sock.reply(m.chat, '⌛ Tiempo agotado. La aventura fue cancelada.', m, m.rcanal)
    }
  }, PICK_TIMEOUT_MS)
}

async function handleAdventurePick(sock: any, m: any, session: AdventureBattle, characters: Character[], input: string) {
  const chatId = m.chat as string
  const userId = m.sender as string
  const key    = `${chatId}:${userId}`

  const { chatUser, available, onCooldown, cooldowns, selectable } = await buildCardPools(chatId, userId, characters)
  const selectablePage = selectable.slice(0, CARD_LIST_PAGE_SIZE)

  const tokens = input.split(',').map(s => s.trim())
  const result = resolveCardSelection(tokens, selectablePage, available, onCooldown, cooldowns)
  if (result.error) {
    return sock.reply(m.chat, result.error, m, m.rcanal)
  }
  const selected = result.cards!

  // Se registra el uso (cooldown de 24h por carta) EN CUANTO se confirma la selección,
  // antes de generar jefes, iniciar el combate o enviar ningún mensaje. Así el cooldown
  // queda aplicado sin importar lo que pase después (victoria, derrota, cancelación o error).
  applyCardCooldown(chatId, userId, chatUser, selected.map(c => c.uid))
  updateChatUser(chatId, userId, 'lastAdventure', Date.now())

  const difficulty = Math.ceil(Math.random() * 5)
  const bosses     = generateBosses(difficulty)

  session.playerCards  = selected
  session.bosses       = bosses
  session.difficulty   = difficulty
  session.phase        = 'fighting'

  adventureSessions.set(key, session)

  const teamStr = selected.map(c => `${RARITY_EMOJI[c.stats.rarity]} ${c.character.name}`).join(' | ')
  const bossStr = bosses.map(b => `${b.emoji} ${b.name} (❤️${b.stats.maxHp})`).join('\n  ')

  await sock.reply(m.chat,
    `⚔️ *¡AVENTURA INICIADA!*\n\n👥 *Tu equipo:* ${teamStr}\n\n🔥 *Dificultad ${difficulty}/5*\n\n*Enemigos:*\n  ${bossStr}\n\n_El combate comenzará automáticamente…_`,
    m, m.rcanal,
  )

  await runAdventureCombat(sock, m, session, key, characters)
}

async function getCurrencyName(sock: any): Promise<string> {
  const botId = sock?.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : ''
  const botSettings = await getSettings(botId)
  return botSettings?.currency ?? 'monedas'
}

async function runAdventureCombat(sock: any, m: any, session: AdventureBattle, key: string, characters: Character[]) {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  const chatId = session.chatId
  const monedas = await getCurrencyName(sock)
  const combatMsg = await sock.sendMessage(m.chat, { text: '⚔️ *Preparando combate...*' }, { quoted: m })
  const combatKey = combatMsg.key


  let roundNum = 0

  while (aliveCards(session.playerCards).length > 0 && aliveBosses(session.bosses).length > 0) {
    roundNum++
    const lines: string[] = []
    lines.push('┏━━━━━━━━━━━━━━━━━━━┓')
    lines.push(`┃   🔸 *RONDA ${roundNum}* 🔸`)
    lines.push('┗━━━━━━━━━━━━━━━━━━━┛')
    lines.push('')
    lines.push('👥 *Tu equipo ataca:*')

    for (const pCard of aliveCards(session.playerCards)) {
      const targets = aliveBosses(session.bosses)
      if (!targets.length) break
      const target = pick(targets)
      const { dmg, type } = atkRoll(pCard.stats)

      target.stats.hp = Math.max(0, target.stats.hp - dmg)

      lines.push('')
      if (type === 'miss')          lines.push(`  🌬️ *${pCard.character.name}* atacó a ${target.emoji} ${target.name}… ¡Falló!`)
      else if (type === 'critical') lines.push(`  💥 *${pCard.character.name}* ➜ ${target.emoji} ${target.name}\n     ¡CRÍTICO! ⚡ *${dmg.toLocaleString()} de daño*`)
      else                          lines.push(`  ⚔️ *${pCard.character.name}* ➜ ${target.emoji} ${target.name}\n     💢 ${dmg.toLocaleString()} de daño`)

      lines.push(`     ${bossLine(target)}`)
      if (target.stats.hp === 0) lines.push(`     ☠️ ¡${target.name} ha caído!`)
    }

    lines.push('')
    lines.push('➖➖➖➖➖➖➖➖➖➖➖➖')
    lines.push('👹 *Los enemigos contraatacan:*')

    for (const boss of aliveBosses(session.bosses)) {
      const targets = aliveCards(session.playerCards)
      if (!targets.length) break
      const target = pick(targets)
      const { dmg, type } = atkRoll(boss.stats)

      target.stats.hp = Math.max(0, target.stats.hp - dmg)

      lines.push('')
      if (type === 'miss')          lines.push(`  🌬️ ${boss.emoji} *${boss.name}* atacó a ${target.character.name}… ¡Falló!`)
      else if (type === 'critical') lines.push(`  💢 ${boss.emoji} *${boss.name}* ➜ ${target.character.name}\n     ¡CRÍTICO! ⚡ *${dmg.toLocaleString()} de daño*`)
      else                          lines.push(`  🗡️ ${boss.emoji} *${boss.name}* ➜ ${target.character.name}\n     💢 ${dmg.toLocaleString()} de daño`)

      lines.push(`     ${cardLine(target)}`)
      if (target.stats.hp === 0) lines.push(`     💀 ¡${target.character.name} fue derrotado!`)
    }

await sock.sendMessage(m.chat, { text: lines.join('\n'), edit: combatKey })
    await sleep(2200)
  }

  const playerWon = aliveCards(session.playerCards).length > 0
  session.phase = 'done'
  adventureSessions.delete(key)

  if (playerWon) {
    const chatUser = getChatUser(session.chatId, session.playerId) as any
    const { coins, card, materialMsg } = adventureRewards(session.difficulty, characters)
    const currentCoins = (chatUser?.coins ?? 0) + coins
    updateChatUser(session.chatId, session.playerId, 'coins', currentCoins)

let cardMsg = ''
if (card) {
  const chars = (chatUser?.characters ?? []) as any[]
  chars.push({
    name:   card.name,
    value:  card.value,
    gender: card.gender,
    source: card.source,
    url:    card.url,
    claim:  new Date(Date.now()).toLocaleDateString('es-ES'),
    user:   session.playerId,
    uid:    generateCardUid(),
  })
  updateChatUser(session.chatId, session.playerId, 'characters', chars)
  cardMsg = `\n🃏 *Carta obtenida:* ${RARITY_EMOJI[getRarity(card.value)]} *${card.name}* (${card.source})`
}

    await sock.reply(m.chat,
      `🏆 ✨ *¡VICTORIA!* ✨\n\n➖➖➖➖➖➖➖➖➖➖\n\n*Recompensas:*\n\n💰 +${coins.toLocaleString()} ${monedas}\n${materialMsg}${cardMsg}\n\n➖➖➖➖➖➖➖➖➖➖\n\n⏳ Próxima aventura disponible en *3 horas*.`,
      m, m.rcanal,
    )
  } else {
    const lostCard = pick(session.playerCards)
    const chatUser  = getChatUser(session.chatId, session.playerId) as any
    const remainingChars = (chatUser?.characters ?? []).filter((c: any) => c?.uid !== lostCard.uid)
    updateChatUser(session.chatId, session.playerId, 'characters', remainingChars)

    await sock.reply(m.chat,
      `💀 *DERROTA*\n\n➖➖➖➖➖➖➖➖➖➖\n\nTu equipo fue eliminado. Entrena más y vuelve con cartas más poderosas.\n\n📉 *Carta perdida:* ${RARITY_EMOJI[lostCard.stats.rarity]} *${lostCard.character.name}*\n\n➖➖➖➖➖➖➖➖➖➖\n\n⏳ Próxima aventura en *3 horas*.`,
      m, m.rcanal,
    )
  }
}

async function startPvp(sock: any, m: any, characters: Character[], usedPrefix) {
  const chatId     = m.chat as string
  const challenger = m.sender as string
  const mentioned  = m.mentionedJid as string[] | undefined
  const target     = mentioned?.[0]

  if (!target || target === challenger) {
    return sock.reply(m.chat, '⚔️ Menciona a un jugador para desafiar. Ej: `/battlecard @usuario`', m, m.rcanal)
  }

  if (pvpSessions.has(chatId)) {
    return sock.reply(m.chat, '⚔️ Ya hay un duelo en curso en este grupo.', m, m.rcanal)
  }

  pvpChallenges.set(`${chatId}:${target}`, { challenger, expires: Date.now() + 60_000 })

  await sock.sendMessage(m.chat, { text:`⚔️ *DESAFÍO PvP*\n@${target.split('@')[0]} ha sido retado por @${challenger.split('@')[0]}.\n\nResponde \`${usedPrefix}aceptarbattle\` en los próximos 60 segundos para aceptar el duelo.`, mentions: [m.sender, target],
        buttons: [{
          buttonId: `${usedPrefix}aceptarbattle`,
          buttonText: { displayText: 'Aceptar Reto' },
          type: 1
        }]
      }, { quoted: m })

  setTimeout(() => {
    pvpChallenges.delete(`${chatId}:${target}`)
  }, 60_000)
}

async function acceptPvp(sock: any, m: any, characters: Character[]) {
  const chatId  = m.chat as string
  const userId  = m.sender as string
  const cKey    = `${chatId}:${userId}`
  const challenge = pvpChallenges.get(cKey)

  if (!challenge) return sock.reply(m.chat, '❌ No tienes ningún desafío pendiente.', m, m.rcanal)
  if (Date.now() > challenge.expires) {
    pvpChallenges.delete(cKey)
    return sock.reply(m.chat, '⌛ El desafío expiró.', m, m.rcanal)
  }

  pvpChallenges.delete(cKey)

  const session: PvpBattle = {
    mode: 'pvp',
    phase: 'picking',
    player1: challenge.challenger,
    player2: userId,
    chatId,
    cards1: [], cards2: [],
    pickingDone1: false,
    pickingDone2: false,
    currentTurn: 'p1',
    log: [],
    startedAt: Date.now(),
  }
  pvpSessions.set(chatId, session)

  await sendPvpCardPick(sock, m, session, characters)
}

async function sendPvpCardPick(sock: any, m: any, session: PvpBattle, characters: Character[]) {
  const chatId = session.chatId
  const both   = [session.player1, session.player2]

  for (const playerId of both) {
    const { selectable, onCooldown } = await buildCardPools(chatId, playerId, characters)
    const cardListStr = formatCardList(selectable)
    const cooldownNote = onCooldown.length > 0 ? `\n\n⏳ _${onCooldown.length} carta(s) en cooldown de 24h (no disponibles). Escribe el nombre exacto de una de ellas para ver cuánto falta._` : ''
    const tag = playerId.split('@')[0]
await sock.sendMessage(m.chat, { text: `⚔️ *DUELO PvP — @${tag}*\nElige tus *3 cartas* con \`select\` (ej: \`select 1,3,5\` o \`select Naruto,Luffy,Goku\`)\n\n*Tus cartas disponibles:*\n${cardListStr}${cooldownNote}\n\n_Tienes 60 segundos._`, mentions: [m.sender, tag] }, { quoted: m })
  }

  setTimeout(() => {
    const s = pvpSessions.get(chatId)
    if (s?.phase === 'picking') {
      pvpSessions.delete(chatId)
      sock.reply(m.chat, '⌛ El duelo fue cancelado por inactividad.', m, m.rcanal)
    }
  }, PICK_TIMEOUT_MS)
}

async function handlePvpPick(sock: any, m: any, session: PvpBattle, characters: Character[], input: string) {
  const chatId = m.chat as string
  const userId = m.sender as string

  const isP1 = userId === session.player1
  const isP2 = userId === session.player2
  if (!isP1 && !isP2) return

  const alreadyDone = (isP1 && session.pickingDone1) || (isP2 && session.pickingDone2)
  if (alreadyDone) return sock.reply(m.chat, '✅ Ya elegiste tus cartas, espera a tu oponente.', m, m.rcanal)

  const { chatUser, available, onCooldown, cooldowns, selectable } = await buildCardPools(chatId, userId, characters)
  const selectablePage = selectable.slice(0, CARD_LIST_PAGE_SIZE)

  const tokens = input.split(',').map(s => s.trim())
  const result = resolveCardSelection(tokens, selectablePage, available, onCooldown, cooldowns)
  if (result.error) {
    return sock.reply(m.chat, result.error, m, m.rcanal)
  }
  const selected = result.cards!

  // Cooldown de 24h por carta, aplicado en el instante en que el jugador confirma su
  // selección para el duelo, antes de que el combate empiece o se resuelva de cualquier forma.
  applyCardCooldown(chatId, userId, chatUser, selected.map(c => c.uid))

  if (isP1) { session.cards1 = selected; session.pickingDone1 = true }
  else       { session.cards2 = selected; session.pickingDone2 = true }

  pvpSessions.set(chatId, session)
  await sock.sendMessage(m.chat, { text: `✅ @${userId.split('@')[0]} eligió sus cartas. Esperando al oponente…`, mentions: userId }, { quoted: m })

  if (session.pickingDone1 && session.pickingDone2) {
    session.phase = 'fighting'
    pvpSessions.set(chatId, session)
    await beginPvpBattle(sock, m, session, characters)
  }
}

async function beginPvpBattle(sock: any, m: any, session: PvpBattle, characters: Character[]) {
  const p1Tag = session.player1.split('@')[0]
  const p2Tag = session.player2.split('@')[0]

  const teamStr = (cards: BattleCard[]) => cards.map(c => `${RARITY_EMOJI[c.stats.rarity]} ${c.character.name}`).join(' | ')

  await sock.sendMessage(m.chat, { text: `⚔️ *¡DUELO PvP COMENZANDO!*\n\n➖➖➖➖➖➖➖➖➖➖\n\n👤 @${p1Tag}\n   ${teamStr(session.cards1)}\n\n👤 @${p2Tag}\n   ${teamStr(session.cards2)}\n\n➖➖➖➖➖➖➖➖➖➖\n\n_@${p1Tag} ataca primero._\n\nUsa \`/atacar [tu carta] [carta enemiga]\`\nEj: \`.atacar 1 2\``, mentions: [p1Tag, p2Tag] }, { quoted: m })
}

async function handlePvpAttack(sock: any, m: any, session: PvpBattle, rawArgs: string[]) {
  const chatId = m.chat as string
  const userId = m.sender as string

  const isP1 = userId === session.player1
  const isP2 = userId === session.player2
  if (!isP1 && !isP2) return

  const whoseTurn = session.currentTurn === 'p1' ? session.player1 : session.player2
  if (userId !== whoseTurn) {
    return sock.reply(m.chat, '⏳ No es tu turno.', m, m.rcanal)
  }

  const myCards    = isP1 ? session.cards1 : session.cards2
  const enemyCards = isP1 ? session.cards2 : session.cards1
  const myAlive    = aliveCards(myCards)
  const enemyAlive = aliveCards(enemyCards)

  const atkIdx = parseInt(rawArgs[0]) - 1
  const defIdx = parseInt(rawArgs[1]) - 1

  if (isNaN(atkIdx) || isNaN(defIdx)) {
    return sock.reply(m.chat, '❌ Formato: `/atacar [tu carta] [carta enemiga]`\nEj: `.atacar 1 2`', m, m.rcanal)
  }

  const attacker = myAlive[atkIdx]
  const defender = enemyAlive[defIdx]

  if (!attacker) return sock.reply(m.chat, `❌ Tu carta #${atkIdx + 1} no existe o está eliminada.`, m, m.rcanal)
  if (!defender) return sock.reply(m.chat, `❌ La carta enemiga #${defIdx + 1} no existe o está eliminada.`, m, m.rcanal)

  const { dmg, type } = atkRoll(attacker.stats)
  defender.stats.hp = Math.max(0, defender.stats.hp - dmg)

  const atkTag = userId.split('@')[0]
  const msgLines: string[] = []
  msgLines.push('┏━━━━━━━━━━━━━━━━━━━┓')
  msgLines.push('┃   ⚔️ *TURNO DE ATAQUE*')
  msgLines.push('┗━━━━━━━━━━━━━━━━━━━┛')
  msgLines.push('')
  if (type === 'miss')          msgLines.push(`🌬️ *${attacker.character.name}* atacó a *${defender.character.name}*… ¡Falló!`)
  else if (type === 'critical') msgLines.push(`💥 *${attacker.character.name}* ➜ *${defender.character.name}*\n   ¡CRÍTICO! ⚡ *${dmg.toLocaleString()} de daño*`)
  else                          msgLines.push(`⚔️ *${attacker.character.name}* ➜ *${defender.character.name}*\n   💢 ${dmg.toLocaleString()} de daño`)

  msgLines.push('')
  msgLines.push(`   ${cardLine(defender)}`)
  if (defender.stats.hp === 0) msgLines.push(`\n   💀 ¡${defender.character.name} fue eliminado!`)

  const statusP1 = session.cards1.map(c => `${RARITY_EMOJI[c.stats.rarity]} *${c.character.name}*\n   ❤️ ${hpBar(c.stats.hp, c.stats.maxHp)}`).join('\n\n')
  const statusP2 = session.cards2.map(c => `${RARITY_EMOJI[c.stats.rarity]} *${c.character.name}*\n   ❤️ ${hpBar(c.stats.hp, c.stats.maxHp)}`).join('\n\n')

  msgLines.push('')
  msgLines.push('➖➖➖➖➖➖➖➖➖➖➖➖')
  msgLines.push('')
  msgLines.push(`👤 *@${session.player1.split('@')[0]}*`)
  msgLines.push(statusP1)
  msgLines.push('')
  msgLines.push(`👤 *@${session.player2.split('@')[0]}*`)
  msgLines.push(statusP2)

  session.currentTurn = session.currentTurn === 'p1' ? 'p2' : 'p1'

  const alive1 = aliveCards(session.cards1).length
  const alive2 = aliveCards(session.cards2).length

  pvpSessions.set(chatId, session)

  if (alive1 === 0 || alive2 === 0) {
    const winnerId  = alive1 > 0 ? session.player1 : session.player2
    const loserId   = alive1 > 0 ? session.player2 : session.player1
    const loserCards = alive1 > 0 ? session.cards2 : session.cards1
    pvpSessions.delete(chatId)
    session.phase = 'done'

const stolenCard = pick(loserCards)
const winnerCU   = getChatUser(chatId, winnerId) as any
const loserCU    = getChatUser(chatId, loserId)  as any

const winnerChars: any[] = [...(winnerCU?.characters ?? []), {
  name:   stolenCard.character.name,
  value:  stolenCard.character.value,
  gender: stolenCard.character.gender,
  source: stolenCard.character.source,
  url:    stolenCard.character.url,
  claim:  new Date().toLocaleDateString('es-ES'),
  user:   winnerId,
  uid:    generateCardUid(),
}]

const loserChars: any[] = (loserCU?.characters ?? []).filter((c: any) => c?.uid !== stolenCard.uid)

updateChatUser(chatId, winnerId, 'characters', winnerChars)
updateChatUser(chatId, loserId,  'characters', loserChars)

// Recompensa fija en monedas para el ganador del duelo PvP.
const monedas = await getCurrencyName(sock)
const winnerCoinsBefore = (winnerCU?.coins ?? 0)
updateChatUser(chatId, winnerId, 'coins', winnerCoinsBefore + PVP_WIN_REWARD)

    msgLines.push('')
    msgLines.push('┏━━━━━━━━━━━━━━━━━━━┓')
    msgLines.push('┃   🏆 *FIN DEL DUELO*')
    msgLines.push('┗━━━━━━━━━━━━━━━━━━━┛')
    msgLines.push('')
    msgLines.push(`🏆 *¡@${winnerId.split('@')[0]} GANA EL DUELO!*`)
    msgLines.push(`💰 *Recompensa:* +${PVP_WIN_REWARD.toLocaleString()} ${monedas}`)
    msgLines.push('')
    msgLines.push(`💀 *@${loserId.split('@')[0]} pierde la carta:* ${RARITY_EMOJI[stolenCard.stats.rarity]} *${stolenCard.character.name}*`)
    msgLines.push(`📦 ¡Carta transferida al inventario del ganador!`)

    await sock.sendMessage(m.chat, { text: msgLines.join('\n'), mentions: [winnerId, loserId] }, { quoted: m })
  } else {
    const nextTag = (session.currentTurn === 'p1' ? session.player1 : session.player2).split('@')[0]
    const myAliveNew    = (session.currentTurn === 'p1' ? session.cards1 : session.cards2).filter(c => c.stats.hp > 0)
    const enemyAliveNew = (session.currentTurn === 'p1' ? session.cards2 : session.cards1).filter(c => c.stats.hp > 0)

    msgLines.push('')
    msgLines.push('➖➖➖➖➖➖➖➖➖➖➖➖')
    msgLines.push('')
    msgLines.push(`🎯 *Turno de @${nextTag}*`)
    msgLines.push(`Tu equipo vivo: ${myAliveNew.map((c, i) => `${i + 1}. ${c.character.name}`).join(', ')}`)
    msgLines.push(`Enemigos vivos: ${enemyAliveNew.map((c, i) => `${i + 1}. ${c.character.name}`).join(', ')}`)
    msgLines.push(`Usa \`.atacar [tu carta] [carta enemiga]\``)

    await sock.sendMessage(m.chat, { text: msgLines.join('\n'), mentions: nextTag }, { quoted: m })
  }
}


/**
 * Aplica el castigo por abandono de un duelo PvP:
 * - El que cancela pierde una de las cartas que había elegido para ese combate (si ya había elegido alguna).
 * - El que cancela pierde PVP_ABANDON_EXP_PENALTY puntos de EXP.
 * - El rival es tratado como ganador (recibe la recompensa normal de victoria) y no recibe ninguna penalización.
 * - Libera la sesión de PvP para que ambos jugadores puedan iniciar/participar en otros duelos sin quedar bloqueados.
 */
async function applyPvpAbandonPenalty(sock: any, m: any, session: PvpBattle) {
  const chatId      = session.chatId
  const cancellerId = m.sender as string
  const isP1        = cancellerId === session.player1
  const winnerId    = isP1 ? session.player2 : session.player1
  const loserId     = cancellerId
  const loserCards  = isP1 ? session.cards1 : session.cards2

  // Liberar el estado del combate para ambos jugadores antes de aplicar recompensas/castigos.
  session.phase = 'done'
  pvpSessions.delete(chatId)

  const monedas = await getCurrencyName(sock)

  // Castigo de EXP para quien cancela.
  const loserUser = getUser(loserId) as any
  const currentExp = loserUser?.exp ?? 0
  updateUser(loserId, 'exp', Math.max(0, currentExp - PVP_ABANDON_EXP_PENALTY))

  // Castigo de carta (solo si el jugador ya había elegido cartas para el combate).
  let cardMsg = '_No había elegido cartas todavía, así que no pierde ninguna._'
  if (loserCards && loserCards.length > 0) {
    const stolenCard = pick(loserCards)
    const winnerCU = getChatUser(chatId, winnerId) as any
    const loserCU  = getChatUser(chatId, loserId)  as any

    const winnerChars: any[] = [...(winnerCU?.characters ?? []), {
      name:   stolenCard.character.name,
      value:  stolenCard.character.value,
      gender: stolenCard.character.gender,
      source: stolenCard.character.source,
      url:    stolenCard.character.url,
      claim:  new Date().toLocaleDateString('es-ES'),
      user:   winnerId,
      uid:    generateCardUid(),
    }]
    const loserChars: any[] = (loserCU?.characters ?? []).filter((c: any) => c?.uid !== stolenCard.uid)

    updateChatUser(chatId, winnerId, 'characters', winnerChars)
    updateChatUser(chatId, loserId,  'characters', loserChars)

    cardMsg = `💀 Pierde la carta: ${RARITY_EMOJI[stolenCard.stats.rarity]} *${stolenCard.character.name}*\n📦 ¡Carta transferida al inventario del ganador!`
  }

  // Recompensa normal de victoria para el rival (no recibe ninguna penalización).
  const winnerCU2 = getChatUser(chatId, winnerId) as any
  const winnerCoinsBefore = winnerCU2?.coins ?? 0
  updateChatUser(chatId, winnerId, 'coins', winnerCoinsBefore + PVP_WIN_REWARD)

  const msgLines = [
    '┏━━━━━━━━━━━━━━━━━━━┓',
    '┃   🚫 *DUELO CANCELADO*',
    '┗━━━━━━━━━━━━━━━━━━━┛',
    '',
    `🏳️ *@${loserId.split('@')[0]}* abandonó el combate.`,
    `🏆 *¡@${winnerId.split('@')[0]} GANA POR ABANDONO!*`,
    `💰 *Recompensa:* +${PVP_WIN_REWARD.toLocaleString()} ${monedas}`,
    '',
    `📉 *Penalización a @${loserId.split('@')[0]}:*`,
    `   • -${PVP_ABANDON_EXP_PENALTY.toLocaleString()} EXP`,
    `   • ${cardMsg}`,
  ]

  await sock.sendMessage(m.chat, { text: msgLines.join('\n'), mentions: [winnerId, loserId] }, { quoted: m })
}


export default {
  command: ['avencard', 'battlecard', 'aceptarbattle', 'select', 'atacar', 'cancelbattle', 'cancelbatle'],
  category: 'juegos',

  run: async ({ sock, m, args, usedPrefix, command }: any) => {
    const characters: Character[] = JSON.parse(
      fs.readFileSync('./core/characters.json', 'utf-8'),
    )
    const chatId = m.chat as string
    const userId = m.sender as string
    const key    = `${chatId}:${userId}`
    const cmd    = command.toLowerCase()

if (cmd === 'avencard') {
  let session = adventureSessions.get(key)

  if (session?.phase === 'picking') {
    if (args.length > 0) {
      return await handleAdventurePick(sock, m, session, characters, args.join(','))
    }
    return sock.reply(m.chat, '🃏 Estás en modo selección de cartas. Envía los números o nombres: `1,3,7`', m, m.rcanal)
  }

  if (session?.phase === 'fighting') {
    return sock.reply(m.chat, '⚔️ Ya tienes una aventura en curso.', m, m.rcanal)
  }

  await startAdventure(sock, m, characters)
  if (args.length > 0) {
    session = adventureSessions.get(key)
    if (session?.phase === 'picking') {
      return await handleAdventurePick(sock, m, session, characters, args.join(','))
    }
  }
  return
}

    if (cmd === 'battlecard') {
      return await startPvp(sock, m, characters, usedPrefix)
    }

if (cmd === 'aceptarbattle') {
  return await acceptPvp(sock, m, characters)
}
if (cmd === 'select') {
  const pvpSession = pvpSessions.get(chatId)
  if (!pvpSession || pvpSession.phase !== 'picking') {
    return sock.reply(m.chat, '❌ No tienes ninguna selección de cartas pendiente.', m, m.rcanal)
  }
  const input = args.join(',').trim()
  if (!input) {
    return sock.reply(m.chat, `❌ Usa \`${usedPrefix}select 1,3,5\` para elegir tus 3 cartas.`, m, m.rcanal)
  }
  return await handlePvpPick(sock, m, pvpSession, characters, input)
}

    if (cmd === 'atacar') {
      const pvpSession = pvpSessions.get(chatId)
      if (!pvpSession || pvpSession.phase !== 'fighting') {
        return sock.reply(m.chat, '❌ No hay ningún duelo activo.', m, m.rcanal)
      }
      return await handlePvpAttack(sock, m, pvpSession, args)
    }

    if (cmd === 'cancelbattle' || cmd === 'cancelbatle') {
      const pvpSession = pvpSessions.get(chatId)
      if (pvpSession) {
        const isParticipant = userId === pvpSession.player1 || userId === pvpSession.player2
        if (!isParticipant) {
          return sock.reply(m.chat, '❌ No formas parte de este duelo.', m, m.rcanal)
        }
        return await applyPvpAbandonPenalty(sock, m, pvpSession)
      }

      const adventureSession = adventureSessions.get(key)
      if (adventureSession) {
        adventureSessions.delete(key)
        return sock.reply(m.chat, '🚫 Aventura cancelada.', m, m.rcanal)
      }

      return sock.reply(m.chat, '❌ No tienes ninguna partida activa.', m, m.rcanal)
    }

    const advSession = adventureSessions.get(key)
    if (advSession?.phase === 'picking') {
      return sock.reply(m.chat, '🃏 Estás en modo selección de cartas. Envía los números o nombres: `1,3,7`', m, m.rcanal)
    }
  },
}