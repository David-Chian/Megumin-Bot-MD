// Un refolcito pal corazonchito :3
// Y por pura paja tmb

const groupMetadataCache = new Map()
const lidCache = new Map()
const lidNegativeCache = new Map()
const metadataTTL = 5000
const negativeTTL = 30_000
function getCachedMetadata(groupChatId) {
  const cached = groupMetadataCache.get(groupChatId)
  if (!cached || Date.now() - cached.timestamp > metadataTTL) return null
  return cached.metadata
}

function normalizeToJid(raw) {
  if (!raw) return null
  let s = typeof raw === 'number' ? String(raw) : String(raw).trim()
  if (!s) return null
  if (s.endsWith('@lid')) return s
  if (s.endsWith('@g.us') || s.endsWith('@newsletter')) return s
  s = s.replace(/:\d+@/, '@')
  if (s.endsWith('@s.whatsapp.net')) return s
  const digits = s.replace(/\D/g, '')
  return digits && digits.length >= 4 && digits.length <= 15 ? `${digits}@s.whatsapp.net` : null
}

function hasLidStore(sock) {
  const lm = sock?.signalRepository?.lidMapping
  return typeof lm?.getPNForLID === 'function' || typeof lm?.getPNsForLIDs === 'function'
}

function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    let done = false
    const timer = setTimeout(() => { if (!done) { done = true; resolve(null) } }, ms)
    Promise.resolve(promise).then(
      (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v) } },
      () => { if (!done) { done = true; clearTimeout(timer); resolve(null) } },
    )
  })
}

async function resolveViaLidStore(lidJid, sock) {
  if (!lidJid?.endsWith('@lid') || !hasLidStore(sock)) return null
  const lm = sock.signalRepository.lidMapping
  try {
    if (typeof lm.getPNsForLIDs === 'function') {
      const pairs = await withTimeout(lm.getPNsForLIDs([lidJid]), 2000)
      const hit = Array.isArray(pairs) ? pairs.find((p) => p?.lid === lidJid) : null
      const resolved = normalizeToJid(hit?.pn)
      if (resolved && !resolved.endsWith('@lid')) return resolved
    } else if (typeof lm.getPNForLID === 'function') {
      const pn = await withTimeout(lm.getPNForLID(lidJid), 2000)
      const resolved = normalizeToJid(pn)
      if (resolved && !resolved.endsWith('@lid')) return resolved
    }
  } catch {}
  return null
}

function resolveViaGroupMetadata(lidJid, metadata) {
  if (!metadata?.participants) return null
  const lidBase = lidJid.split('@')[0]
  for (const p of metadata.participants) {
    const pLidBase = p?.lid?.split('@')[0]
    const pIdIsLid = p?.id?.endsWith('@lid')
    const pIdBase = pIdIsLid ? p.id.split('@')[0] : null
    if (pLidBase !== lidBase && pIdBase !== lidBase) continue
    const phone =
      normalizeToJid(p?.phoneNumber) ||
      (!pIdIsLid ? normalizeToJid(p?.id) : null) ||
      (!p?.jid?.endsWith('@lid') ? normalizeToJid(p?.jid) : null)
    if (phone) return phone
  }
  return null
}

export async function resolveLidToRealJid(lid, sock, groupChatId) {
  const input = normalizeToJid(lid?.toString().trim()) || lid?.toString().trim()
  if (!input) return input
  if (!input.endsWith('@lid')) return input

  if (lidCache.has(input)) return lidCache.get(input)

  const lastFail = lidNegativeCache.get(input)
  const skipStore = lastFail && Date.now() - lastFail < negativeTTL

  if (!skipStore) {
    const viaStore = await resolveViaLidStore(input, sock)
    if (viaStore) {
      lidCache.set(input, viaStore)
      lidNegativeCache.delete(input)
      return viaStore
    }
  }

  if (groupChatId?.endsWith('@g.us')) {
    let metadata = getCachedMetadata(groupChatId)
    if (!metadata) {
      try {
        metadata = await sock.groupMetadata(groupChatId)
        groupMetadataCache.set(groupChatId, { metadata, timestamp: Date.now() })
      } catch {
        metadata = null
      }
    }
    const viaMeta = resolveViaGroupMetadata(input, metadata)
    if (viaMeta) {
      lidCache.set(input, viaMeta)
      lidNegativeCache.delete(input)
      return viaMeta
    }
  } else {
    try {
      const results = await withTimeout(sock.onWhatsApp(input), 4000)
      const hit = Array.isArray(results) ? results.find((r) => r?.exists) || results[0] : null
      const resolved = hit?.jid ? normalizeToJid(hit.jid) : null
      if (resolved && !resolved.endsWith('@lid')) {
        lidCache.set(input, resolved)
        lidNegativeCache.delete(input)
        return resolved
      }
    } catch {}
  }

  lidNegativeCache.set(input, Date.now())
  return input
}

function cleanJid(jid) {
  if (!jid) return ''
  return String(jid).split(':')[0].trim()
}

function jidNumber(jid) {
  if (!jid) return ''
  return String(jid)
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '')
}

function isAdminParticipant(participant) {
  return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}

function getParticipantPossibleIds(participant) {
  return [
    participant?.id,
    participant?.jid,
    participant?.lid,
    participant?.phoneNumber,
  ]
    .filter(Boolean)
    .map((x) => String(x))
}

export async function getFreshGroupMetadata(sock, groupChatId, force = false) {
  if (!groupChatId?.endsWith('@g.us')) return null

  if (!force) {
    const cached = getCachedMetadata(groupChatId)
    if (cached) return cached
  }

  try {
    const metadata = await sock.groupMetadata(groupChatId)
    groupMetadataCache.set(groupChatId, { metadata, timestamp: Date.now() })
    return metadata
  } catch {
    return null
  }
}

export async function resolveAnyToRealJid(jid, sock, groupChatId) {
  const input = jid?.toString().trim()
  if (!input) return input

  if (!input.endsWith('@lid')) return input

  return await resolveLidToRealJid(input, sock, groupChatId)
}

export async function isJidAdminInGroup(sock, groupChatId, targetJid, forceRefresh = false) {
  if (!groupChatId?.endsWith('@g.us') || !targetJid) return false

  const metadata = await getFreshGroupMetadata(sock, groupChatId, forceRefresh)
  const participants = metadata?.participants || []

  const targetResolved = await resolveAnyToRealJid(targetJid, sock, groupChatId)
  const targetClean = cleanJid(targetResolved)
  const targetNumber = jidNumber(targetResolved)

  for (const participant of participants) {
    if (!isAdminParticipant(participant)) continue

    const ids = getParticipantPossibleIds(participant)

    for (const rawId of ids) {
      const rawClean = cleanJid(rawId)
      const rawNumber = jidNumber(rawId)

      if (rawClean && rawClean === targetClean) return true
      if (targetNumber && rawNumber && targetNumber === rawNumber) return true

      const resolved = await resolveAnyToRealJid(rawId, sock, groupChatId)
      const resolvedClean = cleanJid(resolved)
      const resolvedNumber = jidNumber(resolved)

      if (resolvedClean && resolvedClean === targetClean) return true
      if (targetNumber && resolvedNumber && targetNumber === resolvedNumber) return true
    }
  }

  return false
}
