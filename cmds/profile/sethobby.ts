export default {
  command: ['setpasatiempo', 'sethobby'],
  category: 'profile',
    run: async ({sock, m, args, command, text, prefix}) => {
    const user = await getUser(m.sender)
    const input = args.join(' ').trim()

    const pasatiemposDisponibles = [
      '📚 Leer', '✍️ Escribir', '🎤 Cantar', '💃 Bailar', '🎮 Jugar', 
      '🎨 Dibujar', '🍳 Cocinar', '✈️ Viajar', '🏊 Nadar', '📸 Fotografía',
      '🎧 Escuchar música', '🏀 Deportes', '🎬 Ver películas', '🌿 Jardinería',
      '🧵 Manualidades', '🎲 Juegos de mesa', '🏋️‍♂️ Gimnasio', '🚴 Ciclismo',
      '🎯 Tiro con arco', '🍵 Ceremonia del té', '🧘‍♂️ Meditación', '🎪 Malabares',
      '🛠️ Bricolaje', '🎹 Tocar instrumentos', '🐶 Cuidar mascotas', '🌌 Astronomía',
      '♟️ Ajedrez', '🍷 Catación de vinos', '🛍️ Compras', '🏕️ Acampar',
      '🎣 Pescar', '📱 Tecnología', '🎭 Teatro', '🍽️ Gastronomía', '🏺 Coleccionar',
      '✂️ Costura', '🧁 Repostería', '📝 Blogging', '🚗 Automóviles', '🧩 Rompecabezas',
      '🎳 Bolos', '🏄 Surf', '⛷️ Esquí', '🎿 Snowboard', '🤿 Buceo', '🏹 Tiro al blanco',
      '🧭 Orientación', '🏇 Equitación', '🎨 Pintura', '📊 Invertir', '🌡️ Meteorología',
      '🔍 Investigar', '💄 Maquillaje', '💇‍♂️ Peluquería', '🛌 Dormir', '🍺 Cervecería',
      '🪓 Carpintería', '🧪 Experimentos', '📻 Radioafición', '🗺️ Geografía', '💎 Joyería',
      'Otro 🌟'
    ]

    if (!input) {
      let lista = '🎯 *Elige un pasatiempo:*\n\n'
      pasatiemposDisponibles.forEach((pasatiempo, index) => {
        lista += `${index + 1}) ${pasatiempo}\n`
      })
      lista += `\n*Ejemplos:*\n${prefix + command} 1\n${prefix + command} Leer\n${prefix + command} "Otro 🌟"`

      return m.reply(lista)
    }

    let pasatiempoSeleccionado = ''

    if (/^\d+$/.test(input)) {
      const index = parseInt(input) - 1
      if (index >= 0 && index < pasatiemposDisponibles.length) {
        pasatiempoSeleccionado = pasatiemposDisponibles[index]
      } else {
        return m.reply(`《✧》 Número inválido. Selecciona un número entre 1 y ${pasatiemposDisponibles.length}`)
      }
    } 

    else {
      const inputLimpio = input.replace(/[^\w\s]/g, '').toLowerCase().trim()
      const encontrado = pasatiemposDisponibles.find(
        p => p.replace(/[^\w\s]/g, '').toLowerCase().includes(inputLimpio)
      )

      if (encontrado) {
        pasatiempoSeleccionado = encontrado
      } else {
        return m.reply('《✧》 Pasatiempo no encontrado. Usa el comando sin argumentos para ver la lista disponible.')
      }
    }

    if (user.pasatiempo === pasatiempoSeleccionado) {
      return m.reply(`《✧》 Ya tienes establecido este pasatiempo: *${user.pasatiempo}*`)
    }

    user.pasatiempo = pasatiempoSeleccionado

await updateUser(m.sender, 'pasatiempo', user.pasatiempo)

    return m.reply(`✐ Se ha establecido tu pasatiempo:\n> *${user.pasatiempo}*`)
  },
};
