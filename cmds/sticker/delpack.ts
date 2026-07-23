export default {
  command: ['delpack'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      if (!args.length) {
        return m.reply('《✧》Especifica el nombre del paquete de stickers.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return m.reply('《✧》No tienes paquetes creados.')
      }
      const packIndex = packs.findIndex(p => p.name.toLowerCase() === packName.toLowerCase())
      if (packIndex === -1) {
        return m.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      const deletedPack = packs[packIndex]
      packs.splice(packIndex, 1)
      await updateStickersPack(m.sender, 'packs', packs)      
      m.reply(`❀ El paquete de stickers \`${deletedPack.name}\` ha sido eliminado.`)
    } catch (e) {
      m.reply(msgglobal)
    }
  }
}
