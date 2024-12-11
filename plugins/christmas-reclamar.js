let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    if (user.claimedChristmasReward) {
        return conn.reply(m.chat, '🎄 ¡Ya has reclamado tu recompensa navideña! 🎁', m)
    }

    let expGained = ["1", "1000", "3050", "3500", "2500", "1300", "1900", "5000", "500", "60", "100", "200", "400", "300"].getRandom();
    let galletasGained = ["1", "1000", "3050", "3500", "2500", "1300", "1900", "5000", "500", "60", "100", "200", "400", "300"].getRandom();

    let message = `🎅 ¡Feliz Navidad! Has recibido las siguientes recompensas:

🍪 *Galletas*: ${galletasGained}
✨️ *Experiencia*: ${expGained}`;

    user.exp += expGained;
    user.galletas += galletasGained;
    user.claimedChristmasReward = true; 

    conn.reply(m.chat, message, m);
}

handler.help = ['navidad'];
handler.tags = ['christmas'];
handler.command = ['navidad', 'christmas', 'xmas']; 
handler.register = true;
handler.group = true;

export default handler;