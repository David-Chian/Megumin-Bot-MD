export default {
  command: ['setmeta'],
  category: 'utils',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const userId = m.sender
    const user = db.users[userId]

    if (!args || args.length === 0)
      return m.reply(
        '《✧》 Por favor, ingresa los metadatos que deseas asignar a tus stickers.',
      )

    try {
      const fullArgs = args.join(' ')
      const [metadatos01, metadatos02] = fullArgs.split('|').map((meta) => meta.trim())

      user.metadatos = metadatos01 || ''
      user.metadatos2 = metadatos02 || ''

      await client.sendMessage(
        m.chat,
        {
          text: `✎ Los metadatos de tus stickers se han actualizado correctamente.`,
        },
        { quoted: m },
      )
    } catch (e) {
      await m.reply(msgglobal)
    }
  },
};
