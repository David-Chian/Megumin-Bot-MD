const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `🚩 *No Se Encontró Ningun Prefijo, Por Favor Escriba Un Prefijo. Ejemplo:* ${usedPrefix + command} !`;
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
 // await m.reply(`*✅️ Prefijo Actualizado Con Éxito, Prefijo Actual: ${text}*`);
  conn.fakeReply(m.chat, `✅️ *Prefijo Actualizado Con Éxito, Prefijo Actual: ${text}*`, '0@s.whatsapp.net', '🍟 PREFIJO NUEVO 🍟')
};
handler.help = ['prefix'].map((v) => v + ' [prefix]');
handler.tags = ['owner'];
handler.command = ['prefix'];
handler.rowner = true;
export default handler;