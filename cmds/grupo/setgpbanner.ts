export default {
  command: ['setgpbanner', 'setgpbaner'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({sock, m}) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime))
      return m.reply('《✤》 Te faltó la imagen para cambiar el perfil del grupo.')

    const img = await q.download()
    if (!img) return m.reply('✎ No se pudo descargar la imagen.')

    try {
      await sock.updateProfilePicture(m.chat, img)
      m.reply('✐ La imagen del grupo se actualizó con éxito.')
    } catch {
      m.reply(msgglobal)
    }
  },
};
