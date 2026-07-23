export default {
  command: ['addsticker', 'stickeradd'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      if (!args.length) {
        return m.reply('《✧》Especifica el nombre del paquete.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return m.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return m.reply('《✧》No se encontró un paquete con ese nombre.')
      }
      const quoted = m.quoted
      if (!quoted) {
        return m.reply('《✧》Responde a un sticker.')
      }
      const mime = quoted.mimetype || quoted.msg?.mimetype || ''
      if (!/webp/i.test(mime)) {
        return m.reply('《✧》Solo puedes agregar stickers.')
      }
      if (pack.stickers.length >= 30) {
        return m.reply('《✧》Un paquete no puede tener más de 30 stickers.')
      }
      let buffer = await quoted.download()
      if (!buffer) {
        return m.reply('《✧》No se pudo descargar el sticker.')
      }
      if (!Buffer.isBuffer(buffer)) {
        buffer = Buffer.from(buffer)
      }
      if (buffer.length === 0) {
        return m.reply('《✧》El sticker está vacío o corrupto.')
      }
      const base64Sticker = buffer.toString('base64')
      if (pack.stickers.includes(base64Sticker)) {
        return m.reply(`《✧》El sticker ya existe en el paquete de stickers \`${pack.name}\`.`)
      }
      pack.stickers.push(base64Sticker)
      pack.lastModified = Date.now().toString()
      await updateStickersPack(m.sender, 'packs', packs)
      m.reply(`《✧》Sticker agregado al pack \`${pack.name}\` correctamente!`)
    } catch (e) {
      m.reply(msgglobal)
    }
  }
}
