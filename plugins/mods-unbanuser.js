const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let user;
    let db = global.db.data.users;
    if (m.quoted) {
        user = m.quoted.sender;
    } else if (args.length >= 1) {
        user = args[0].replace('@', '') + '@s.whatsapp.net';
    } else {
        await conn.reply(m.chat, `🚩 Etiqueta o responde al mensaje del usuario que quieras Desbanear, Ejemplo:\n> → *${usedPrefix}unbanuser <@tag>*`, m);
        return;
    }
    if (db[user]) {
        db[user].banned = false;
        db[user].banRazon = '';
        const nametag = await conn.getName(user);
        const nn = conn.getName(m.sender);
        await conn.reply(m.chat, `✅️ El usuario *${nametag}* ha sido desbaneado.`, m, { mentionedJid: [user] });
       
    } else {
        await conn.reply(m.chat, `🚩 El usuario no está registrado.`, m);
    }
};
handler.help = ['unbanuser <@tag>'];
handler.command = ['unbanuser'];
handler.tags = ['mods'];
handler.rowner = true;
export default handler;