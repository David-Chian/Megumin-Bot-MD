import fs from 'fs';

const obtenerDatos = () => fs.existsSync('data.json') ? JSON.parse(fs.readFileSync('data.json', 'utf-8')) : { usuarios: {} };

const guardarDatos = (data) => fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [eleccion] = text.split(' ');
    if (!eleccion) return m.reply(`✐ Por favor, elige cara o cruz.\nEjemplo: *${usedPrefix + command} cara*`);

    eleccion = eleccion.toLowerCase();
    if (eleccion !== 'cara' && eleccion !== 'cruz') {
        return m.reply(`✐ Elección no válida. Por favor, elige cara o cruz.\nEjemplo: *${usedPrefix + command} cara*`);
    }

    let data = obtenerDatos();
    let userId = m.sender;
    if (!data.usuarios[userId]) data.usuarios[userId] = { chocolates: 100 };

    let user = data.usuarios[userId];
    let resultado = Math.random() < 0.5 ? 'cara' : 'cruz';

    let mensaje = `✐ Has elegido *${eleccion}*.\n`;
    if (resultado === eleccion) {
        user.chocolates += 60;
        mensaje += `¡Felicidades! Ha salido *${resultado}* y ganas 60 chocolates.\nTienes ahora *${user.chocolates} chocolates*.`;
    } else {
        user.chocolates -= 30;
        mensaje += `Lo siento. Ha salido *${resultado}* y pierdes 30 chocolates.\nTienes ahora *${user.chocolates} chocolates*.`;
    }

    data.usuarios[userId] = user;
    guardarDatos(data);

    await conn.reply(m.chat, mensaje, m);
};

handler.help = ['cf'];
handler.tags = ['fun'];
handler.command = ['cf', 'caracruz'];
handler.register = true;

export default handler;