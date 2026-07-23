import chalk from 'chalk'

const limpiarPersonajesReservados = async () => {
  try {
    const chats = await getChat() 
    const now = Date.now()

    for (const chat of chats) {
      if (!chat.personajesReservados || !Array.isArray(chat.personajesReservados)) {
        continue
      }

      const nuevosPersonajesReservados = chat.personajesReservados.filter(personaje => {
        const expirado = personaje.expiresAt && now > personaje.expiresAt
        const yaReclamado = chat.users && Object.values(chat.users).some(u =>
          u.characters && u.characters.some(c => c.name === personaje.name)
        )
        return !expirado && !yaReclamado
      })

      if (chat.personajesReservados.length !== nuevosPersonajesReservados.length) {
        await updateChat(chat.id, 'personajesReservados', nuevosPersonajesReservados)
        // console.log(chalk.gray(`[ ✿ ] Personajes reservados limpiados en chat ${chat.id}`))
      }
    }
  } catch (e) {
    console.log(chalk.gray('Error limpiando personajesReservados'))
  }
}

setInterval(limpiarPersonajesReservados, 1800000) // cada 30 minutos
// limpiarPersonajesReservados()