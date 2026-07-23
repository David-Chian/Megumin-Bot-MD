export default {
  command: ['setstickerpackdesc', 'setpackdesc', 'packdesc'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      if (!args.length) {
        return m.reply('《✧》Especifica el nombre del paquete y la nueva descripción.')
      }
      const fullText = args.join(' ').trim()
      const parts = fullText.split(/\||•|\//)
      if (parts.length < 2) {
        return m.reply('《✧》Especifica el nombre del paquete y la nueva descripción.\n> Ejemplo: */packdesc NombreDelPaquete | Nueva Descripción*')
      }
      const packName = parts[0].trim()
      const desc = parts[1].trim()
      if (!desc || desc.length === 0) {
        return m.reply('《✧》La descripción no puede estar vacía.')
      }
      if (desc.length > 60) {
        return m.reply('《✧》La descripción no puede tener más de 60 caracteres.')
      }
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return m.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return m.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      pack.desc = desc
      pack.lastModified = Date.now().toString()
      await updateStickersPack(m.sender, 'packs', packs)      
      m.reply(`❀ La descripción del paquete de stickers \`${pack.name}\` ha sido actualizada!`)
    } catch (e) {
      m.reply(msgglobal)
    }
  }
}
