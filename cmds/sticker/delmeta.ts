export default {
  command: ['delmeta', 'delstickermeta'],
  category: 'stickers',
  run: async ({sock, m, args}) => {
    try {
      const userData = await getUser(m.sender);
      if ((!userData.metadatos || userData.metadatos === '') && (!userData.metadatos2 || userData.metadatos2 === '')) {
        return m.reply('《✧》No tienes metadatos asignados.');
      }
      await updateUser(m.sender, 'metadatos', '');
      await updateUser(m.sender, 'metadatos2', '');
      await sock.sendMessage(m.chat, { text: `✎ Los metadatos de tus stickers se han eliminado correctamente.` }, { quoted: m });
    } catch (e) {
      await m.reply(msgglobal);
    }
  },
};
