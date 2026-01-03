const groupMetadataCache = new Map()
const lidCache = new Map()
const metadataTTL = 5000 // 5 segundos de frescura máxima

function getCachedMetadata(groupChatId) {
  const cached = groupMetadataCache.get(groupChatId)
  if (!cached || Date.now() - cached.timestamp > metadataTTL) return null
  return cached.metadata
}

function normalizeToJid(phone) {
  if (!phone) return null
  const base = typeof phone === 'number' ? phone.toString() : phone.replace(/\D/g, '')
  return base ? `${base}@s.whatsapp.net` : null
}

export async function resolveLidToRealJid(lid, client, groupChatId) {
  const input = lid?.toString().trim()
  if (!input || !groupChatId?.endsWith('@g.us')) return input

  if (input.endsWith('@s.whatsapp.net')) return input

  if (lidCache.has(input)) return lidCache.get(input)

  const lidBase = input.split('@')[0]
  let metadata = getCachedMetadata(groupChatId)

  if (!metadata) {
    try {
      metadata = await client.groupMetadata(groupChatId)
      groupMetadataCache.set(groupChatId, { metadata, timestamp: Date.now() })
    } catch {
      return lidCache.set(input, input), input
    }
  }

  for (const p of metadata.participants || []) {
    const idBase = p?.id?.split('@')[0]?.trim()
    const phoneRaw = p?.phoneNumber
    const phone = normalizeToJid(phoneRaw)
    if (!idBase || !phone) continue
    if (idBase === lidBase) return lidCache.set(input, phone), phone
  }

  return lidCache.set(input, input), input
}