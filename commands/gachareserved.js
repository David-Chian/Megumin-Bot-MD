import chalk from 'chalk';

const limpiarPersonajesReservados = () => {
  try {
    // if (!global.db) global.db = {}
   // if (!global.db.data) global.db.data = {}
   // if (!global.db.data.chats) global.db.data.chats = {}

    const chats = global.db.data.chats

    for (const chatId of Object.keys(chats)) {
      const chat = chats[chatId]

      if (!Array.isArray(chat.personajesReservados)) {
        chat.personajesReservados = []
      } else {
        chat.personajesReservados.length = 0
      }
    }

  } catch (e) {
  //  console.log(chalk.gray('🍄  Chat No Definido')) 
  }
}

setInterval(limpiarPersonajesReservados, 1800000)
limpiarPersonajesReservados()