let handler = async (m, { conn }) => {
  const usuario = m.pushName || 'Usuario';
  const videoUrl = 'https://telegra.ph/file/330a7838421e8f555b7be.mp4';

  const texto = `Hola @${m.sender.split('@')[0]} aquí está el tutorial para registrarte en Megumin-Bot.`;

  const options = {
    quoted: m,
    caption: texto,
    mentions: [m.sender]
  };

  await conn.sendMessage(m.chat, { video: { url: videoUrl }, ...options });
};

handler.command = ['tutorialreg']

export default handler;