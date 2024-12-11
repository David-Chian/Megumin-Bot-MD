let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    if (user.claimedChristmasReward) {
        return conn.reply(m.chat, '🎄 ¡Ya has reclamado tu recompensa navideña! 🎁', m)
    }

    let expGained = 1000;
    let chocolatesGained = 100;

    let message = `🎅 ¡Feliz Navidad! Has recibido las siguientes recompensas:

🪙 *Moras*: ${chocolatesGained}
✨️ *Experiencia*: ${expGained}`;

    user.exp += expGained;
    user.moras += chocolatesGained;
    user.claimedChristmasReward = true; 

    conn.reply(m.chat, message, m);
}

handler.help = ['navidad'];
handler.tags = ['christmas'];
handler.command = ['navidad', 'christmas', 'xmas']; 
//handler.register = true;

export default handler;