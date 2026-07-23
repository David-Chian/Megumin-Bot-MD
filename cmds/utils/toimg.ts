export default {
  command: ['toimg', 'toimage'],
  category: 'utils',
  run: async ({sock, m}) => {
    if (!m.quoted) return sock.reply(m.chat, `✿ Debes citar un sticker para convertir a imagen.`, m)
   // await m.react('🕒')
    let xx = m.quoted
    let imgBuffer = await xx.download()
    if (!imgBuffer) {
      // await m.react('✖️')
      return sock.reply(m.chat, `✿ No se pudo descargar el sticker.`, m)
    }
    await sock.sendMessage(m.chat, { image: imgBuffer }, { quoted: m })
   // await m.react('✔️')
  }
}
