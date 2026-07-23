export default {
  command: ['setpackprivate', 'setpackpriv', 'packprivate'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      if (!args.length) {
        return m.reply('《✧》Debes especificar el nombre del paquete de stickers.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return m.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return m.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      if (pack.spackpublic === 0) {
        return m.reply(`《✧》El paquete de stickers \`${pack.name}\` ya es privado.`)
      }
      pack.spackpublic = 0
      pack.lastModified = Date.now().toString()
      await updateStickersPack(m.sender, 'packs', packs)      
      m.reply(`❀ El paquete de stickers \`${pack.name}\` ha sido establecido como privado!`)
    } catch (e) {
      m.reply(msgglobal)
    }
  }
}
