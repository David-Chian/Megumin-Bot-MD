//Codígo creado por David Chian wa.me/5351524614

import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const obtenerDatos = () => {
    if (fs.existsSync('data.json')) {
        return JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    } else {
        return { usuarios: {}, personajesReservados: [] };
    }
};

const guardarDatos = (data) => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
};

let handler = async (m, { conn }) => {
    if (!m.quoted) return;

    let userId = m.sender;
    let userName = await conn.getName(userId);
    let characterId = m.quoted.text.match(/<id:(.*)>/)?.[1];
    console.log("User ID:", userId);
    console.log("Character ID:", characterId);
    console.log("User Name:", userName);
    let data = obtenerDatos();

    if (!characterId) {
        return;
    }

    let reservedCharacter = data.personajesReservados.find(p => p.id === characterId);
    if (!reservedCharacter) {
        conn.reply(m.chat, `¡Lo siento, este personaje no está disponible en este momento!`, m, { mentions: [userId] });
        return;
    }
const verifi = () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
        if (packageJson.name !== 'Megumin-Bot-MD') return false;
        if (packageJson.repository.url !== 'git+https://github.com/David-Chian/Megumin-Bot-MD.git') return false;
        if (SECRET_KEY !== '49rof384foerAlkkO4KF4Tdfoflw') return false;
        return true;       
    } catch (error) {
        console.error('Error al leer package.json:', error);
        return false;
    }
};
if (!verifi()) {
        await conn.reply(m.chat, 'Este comando solo está disponible para Megumin Bot.\n 🔥 https://github.com/David-Chian/Megumin-Bot-MD', m, rcanal)
        return
    }
    let characterReservedByOthers = data.usuarios[reservedCharacter.userId] && data.usuarios[reservedCharacter.userId].characters.includes(reservedCharacter.name);
    if (characterReservedByOthers) {
        let otherUserId = reservedCharacter.userId;
        let otherUserName = await conn.getName(otherUserId);
        conn.reply(m.chat, `¡Oh no! Tu personaje ${reservedCharacter.name} ha sido robado por @${otherUserName}`, m, { mentions: [userId, otherUserId] });
        conn.sendMessage(otherUserId, { image: { url: reservedCharacter.url }, caption: `Felicitaciones, este personaje ${reservedCharacter.name} es tuyo` }, { quoted: m });
        return;
    }

    if (!data.usuarios[userId]) {
        data.usuarios[userId] = {
            characterCount: 0,
            totalRwcoins: 0,
            lastUsedTime: 0,
            characters: []
        };
    }

    let userData = data.usuarios[userId];
    userData.characters.push(reservedCharacter.name);
    userData.characterCount++;
    userData.totalRwcoins += reservedCharacter.value;
    data.usuarios[userId] = userData;

    data.personajesReservados = data.personajesReservados.filter(p => p.id !== characterId);
    guardarDatos(data);

    if (reservedCharacter.userId === userId) {
        conn.reply(m.chat, `¡Felicidades @${userName}, obtuviste a ${reservedCharacter.name}!`, m, { mentions: [userId] });
    } else {
        let reservedUserName = await conn.getName(reservedCharacter.userId);
        conn.reply(m.chat, `¡Felicidades @${userName}, has robado a ${reservedCharacter.name} de @${reservedUserName}!`, m, { mentions: [userId, reservedCharacter.userId] });
    }
};

handler.help = ['confirmar'];
handler.tags = ['fun'];
handler.command = ['c','confirmar'];
handler.register = true;
handler.group = true;

export default handler;