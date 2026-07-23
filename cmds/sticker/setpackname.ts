export default {
  command: ['setstickerpackname', 'setpackname', 'packname'],
  category: 'stickers',
  run: async ({sock, m, args, command, text, prefix}) => {
    try {
      if (!args.length) {
        return m.reply(`《✧》Especifica el nombre del paquete y el nuevo nombre.\n> Ejemplo: *${prefix + command} NombreActual | NuevoNombre*`)
      }
      const fullText = args.join(' ').trim()
      const parts = fullText.split(/\||•|\//)
      if (parts.length < 2) {
        return m.reply(`《✧》Especifica el nombre del paquete y el nuevo nombre.\n> Ejemplo: *${prefix + command} NombreActual | NuevoNombre*`)
      }
      const packName = parts[0].trim()
      const newName = parts[1].trim()
      if (!newName || newName.length === 0) {
        return m.reply('《✧》El nuevo nombre no puede estar vacío.')
      }
      if (newName.length < 4 || newName.length > 64) {
        return m.reply('《✧》El nuevo nombre debe tener entre 4 y 64 caracteres.')
      }
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return m.reply('《✧》No tienes paquetes creados.')
      }
      if (packs.find(p => p.name.toLowerCase() === newName.toLowerCase())) {
        return m.reply('《✧》Ya tienes un paquete con ese nombre.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return m.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      pack.name = newName
      pack.lastModified = Date.now().toString()
      await updateStickersPack(m.sender, 'packs', packs)
      m.reply(`❀ El paquete de stickers \`${packName}\` ahora se llama \`${newName}\`!`)
    } catch (e) {
      m.reply(msgglobal);
    }
  }
}
