export default {
  command: ['restart'],
  category: 'owner',
  isOwner: true,
  run: async ({sock, m}) => {
    await sock.reply(m.chat, `✎ Reiniciando el Socket...\n> *Espere un momento...*`, m)
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  },
};
