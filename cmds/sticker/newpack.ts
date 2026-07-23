export default {
  command: ['newpack', 'newstickerpack'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      const settings = await getSettings(sock.user.id.split(':')[0] + '@s.whatsapp.net') || {}
      const userId = await getUser(m.sender)
      const dev = userId.name || m.pushName || 'Desconocido'
      const name = args.join(' ').trim()
      if (!name || name.length < 4 || name.length > 64) {
        return m.reply('《✧》El nombre del paquete de stickers debe tener entre 4 y 64 caracteres.')
      }
      const stickerPackData = await getStickersPack(m.sender)
      const packs = stickerPackData.packs || []
      if (packs.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        return m.reply('《✧》Ya tienes un paquete con ese nombre.')
      }
      const newPack = { id: Date.now().toString(), lastModified: Date.now().toString(), name, author: `♯𝐓꯭̱𝔥̱𝑒̱ . ㌦‥ꪱ꯭̱ꪆ꯭̱í̱α꯭̱ო꯭̱ꤩꤨօ꯭̱ղ꯭̱꤬ძ ̱  ──͟͞🄱̱ǿ̱𝔱…ꤩꤨ‧💎`, desc: `Paquete de stickers creado por ${dev}`, stickers: [], spackpublic: 0 }
      packs.push(newPack)
      await updateStickersPack(m.sender, 'packs', packs)
      m.reply(`《✧》El paquete de stickers \`${name}\` ha sido creado exitosamente!
> Puedes agregar stickers respondiendo a uno usando */addsticker ${name}*!`)
    } catch (e) {
      m.reply(msgglobal);
    }
  }
}
