const xpperestrellas = 350;
const handler = async (m, {conn, command, args}) => {
  try {
    let count = command.replace(/^rentar/i, '');
    count = count ? /all/i.test(count) ? Math.floor(global.db.data.users[m.sender].exp / xpperestrellas) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
    count = Math.max(1, count);

    if (global.db.data.users[m.sender].exp >= xpperestrellas * count) {
      global.db.data.users[m.sender].exp -= xpperestrellas * count;

      let db = global.db.data.groupRents || {};
      
      if (db[m.chat]) {
        return conn.reply(m.chat, '⚠️ Ya hay una renta activa en este grupo.', m);
      }

      let groupData = {
        groupId: m.chat,
        tokenCount: count,
        startTime: Date.now(),
        duration: 24 * 60 * 60 * 1000 * count, // 24 horas 
      };

      db[m.chat] = groupData;
      global.db.data.groupRents = db;

      conn.reply(m.chat, `
┌─『 𝑅𝑒𝑛𝑡𝑎𝑟 𝑎 𝑀𝑒𝑔𝑢𝑚𝑖𝑛 』*
│╭──────────────┄
││ *Compra Nominal* : + ${count}🌟
││ *Gastado* : -${xpperestrellas * count} XP
││ *Utiliza* : .rentar2 + el link
│╰──────────────┄
└──────────────`, m);
    } else {
      conn.reply(m.chat, `😔 Lo siento, no tienes suficiente *XP* para comprar *${count}* Estrellas 🌟`, m);
    }
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❌ Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.', m);
  }
};

handler.help = ['rentar'];
handler.tags = ['grupo'];
handler.register = true;
handler.command = ['rentar'];

handler.disabled = false;

export default handler;