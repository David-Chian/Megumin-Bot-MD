import fs from 'fs/promises'

function normalizeText(text: any) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function safeJson(value: any, fallback: any) {
  if (value == null) return fallback
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function buildStoredKey(character: any) {
  const nameKey = normalizeText(character?.name)
  const sourceKey = normalizeText(character?.source)

  if (!nameKey) return null
  return sourceKey ? `${nameKey}::${sourceKey}` : nameKey
}

const obtenerPersonajes = async () => {
  try {
    const data = await fs.readFile('./core/characters.json', 'utf-8')
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error al leer characters.json:', error)
    return []
  }
}

export default {
  command: ['syncimagenes', 'syncp'],
  category: 'owner',
  isOwner: true,

  run: async ({ m }: any) => {
    const personajesBase = await obtenerPersonajes()

    if (!personajesBase.length) {
      return m.reply('❌ No se pudo cargar la base de personajes.')
    }

    const mapaPorNombreYSource = new Map()
    const mapaPorNombre = new Map()

    for (const p of personajesBase) {
      const nameKey = normalizeText(p?.name)
      const sourceKey = normalizeText(p?.source)

      if (!nameKey) continue

      if (sourceKey) {
        mapaPorNombreYSource.set(`${nameKey}::${sourceKey}`, p)
      }

      if (!mapaPorNombre.has(nameKey)) {
        mapaPorNombre.set(nameKey, [])
      }

      mapaPorNombre.get(nameKey).push(p)
    }

    const todosLosChatUsers = getChatUser()

    if (!Array.isArray(todosLosChatUsers) || !todosLosChatUsers.length) {
      return m.reply('⚠️ No hay registros en chat_users.')
    }

    const chatIds = new Set<string>()

    let totalChats = 0
    let totalUsuarios = 0
    let totalRevisados = 0
    let totalActualizados = 0
    let totalNoEncontrados = 0
    let totalNoEncontradosEliminados = 0
    let totalAmbiguos = 0
    let totalDuplicadosEliminados = 0

    let urlsActualizadas = 0
    let valuesActualizados = 0
    let gendersActualizados = 0
    let sourcesActualizados = 0
    let keywordsActualizados = 0

    const ejemplosNoEncontrados = new Set<string>()
    const ejemplosAmbiguos = new Set<string>()
    const ejemplosDuplicados = new Set<string>()

    for (const cu of todosLosChatUsers) {
      if (cu?.chat_id) chatIds.add(cu.chat_id)

      const characters = safeJson(cu?.characters, [])

      if (!Array.isArray(characters) || characters.length === 0) continue

      totalUsuarios++

      let modificado = false
      const nuevosCharacters = []

      for (const personaje of characters) {
        totalRevisados++

        const nameKey = normalizeText(personaje?.name)
        const sourceKey = normalizeText(personaje?.source)

        if (!nameKey) {
          nuevosCharacters.push(personaje)
          continue
        }

        let personajeOficial: any = null
        let ambiguo = false

        if (sourceKey) {
          personajeOficial = mapaPorNombreYSource.get(`${nameKey}::${sourceKey}`) || null
        }

        if (!personajeOficial) {
          const candidatos = mapaPorNombre.get(nameKey) || []

          if (candidatos.length === 1) {
            personajeOficial = candidatos[0]
          } else if (candidatos.length > 1) {
            ambiguo = true
          }
        }

        if (ambiguo) {
          totalAmbiguos++
          ejemplosAmbiguos.add(
            `${personaje?.name || 'Sin nombre'} | ${personaje?.source || 'Sin source'}`
          )
          nuevosCharacters.push(personaje)
          continue
        }

        if (!personajeOficial) {
          totalNoEncontrados++
          totalNoEncontradosEliminados++
          modificado = true
          ejemplosNoEncontrados.add(
            `${personaje?.name || 'Sin nombre'} | ${personaje?.source || 'Sin source'}`
          )
          continue
        }

        const actualizado = { ...personaje }

        const officialUrl = typeof personajeOficial.url === 'string' ? personajeOficial.url.trim() : ''
        const currentUrl = typeof actualizado.url === 'string' ? actualizado.url.trim() : ''

        if (officialUrl && currentUrl !== officialUrl) {
          actualizado.url = officialUrl
          totalActualizados++
          urlsActualizadas++
          modificado = true
        }

        const officialValue = Number(personajeOficial.value ?? 0)
        const currentValue = Number(actualizado.value ?? 0)

        if (!Number.isNaN(officialValue) && currentValue !== officialValue) {
          actualizado.value = officialValue
          totalActualizados++
          valuesActualizados++
          modificado = true
        }

        const officialGender = personajeOficial.gender
        if (officialGender && actualizado.gender !== officialGender) {
          actualizado.gender = officialGender
          totalActualizados++
          gendersActualizados++
          modificado = true
        }

        const officialSource = personajeOficial.source
        if (officialSource && actualizado.source !== officialSource) {
          actualizado.source = officialSource
          totalActualizados++
          sourcesActualizados++
          modificado = true
        }

        if (personajeOficial.keyword && actualizado.keyword !== personajeOficial.keyword) {
          actualizado.keyword = personajeOficial.keyword
          totalActualizados++
          keywordsActualizados++
          modificado = true
        }

        nuevosCharacters.push(actualizado)
      }

      const sinDuplicados = []
      const seen = new Set<string>()

      for (const character of nuevosCharacters) {
        const key = buildStoredKey(character)

        if (!key) {
          sinDuplicados.push(character)
          continue
        }

        if (seen.has(key)) {
          totalDuplicadosEliminados++
          modificado = true
          ejemplosDuplicados.add(
            `${character?.name || 'Sin nombre'} | ${character?.source || 'Sin source'}`
          )
          continue
        }

        seen.add(key)
        sinDuplicados.push(character)
      }

      if (modificado) {
        await updateChatUser(cu.chat_id, cu.user_id, 'characters', sinDuplicados)
      }
    }

    totalChats = chatIds.size

    let respuesta =
      `✅ SINCRONIZACIÓN GLOBAL COMPLETADA\n\n` +
      `💬 Chats revisados: ${totalChats}\n` +
      `👥 Usuarios revisados: ${totalUsuarios}\n` +
      `🔎 Personajes revisados: ${totalRevisados}\n` +
      `♻️ Cambios aplicados: ${totalActualizados}\n` +
      `🖼️ URLs actualizadas: ${urlsActualizadas}\n` +
      `💰 Values actualizados: ${valuesActualizados}\n` +
      `🧬 Géneros actualizados: ${gendersActualizados}\n` +
      `📚 Sources actualizados: ${sourcesActualizados}\n` +
      `🏷️ Keywords actualizados: ${keywordsActualizados}\n` +
      `🧹 Duplicados eliminados: ${totalDuplicadosEliminados}\n` +
      `🗑️ No encontrados eliminados: ${totalNoEncontradosEliminados}\n` +
      `❓ Ambiguos: ${totalAmbiguos}\n` +
      `⚠️ No encontrados en base: ${totalNoEncontrados}`

    if (ejemplosAmbiguos.size > 0) {
      respuesta += `\n\nAmbiguos:\n${[...ejemplosAmbiguos].slice(0, 10).join('\n')}`
    }

    if (ejemplosNoEncontrados.size > 0) {
      respuesta += `\n\nNo encontrados eliminados:\n${[...ejemplosNoEncontrados].slice(0, 10).join('\n')}`
    }

    if (ejemplosDuplicados.size > 0) {
      respuesta += `\n\nDuplicados eliminados:\n${[...ejemplosDuplicados].slice(0, 10).join('\n')}`
    }

    return m.reply(respuesta)
  }
}