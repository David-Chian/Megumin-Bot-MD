const handler = async (m, { conn, usedPrefix, args, groupMetadata, participants }) => {

let psmap = groupMetadata.participants.filter(v => v !== conn.user.jid)
psmap=psmap.filter(v => v.admin !=='superadmin')
psmap=psmap.filter(v => v.admin !=='admin')
psmap=psmap.map(v => v.id)
let user = a => '@' + a.split('@')[0]
let user0 = psmap.getRandom()
let user1 = psmap.getRandom()
let user2 = psmap.getRandom()
let user3 = psmap.getRandom()
let user4 = psmap.getRandom()
let user5 = psmap.getRandom()

if (psmap == '') return conn.reply(m.chat, `😿 No se ha encontrado usuarios para crear la escuadra`, m, fake)

    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];

    // Verificar si se proporcionaron los argumentos necesarios
    if (args.length < 2) {
         await  conn.reply(m.chat, `🚩 Debes proporcionar la hora (HH:MM) y el pais (CO, CL, AG, MX)\n\nEjemplo:\n» ${usedPrefix}4vs4 10:10 CO`, m, rcanal);
        return;
    }

    // Validar el formato de la hora
    const horaRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    if (!horaRegex.test(args[0])) {
         await  conn.reply(m.chat, `🚩 Debes proporcionar la hora (HH:MM) y el pais (CO, CL, AG, MX)\n\nEjemplo:\n» ${usedPrefix}4vs4 10:10 CO`, m, rcanal);
        return;
    }

    const horaUsuario = args[0]; // Hora proporcionada por el usuario
    const pais = args[1].toUpperCase(); // País proporcionado por el usuario

    // Definir la diferencia horaria de cada país con respecto a México
    const diferenciasHorarias = {
        MX: 0, // México tiene la misma hora
        CO: 1, // Colombia tiene una hora más
        CL: 2, // Chile tiene dos horas más
        AG: 3  // Argentina tiene tres horas más
    };

    if (!(pais in diferenciasHorarias)) {
        conn.reply(m.chat, '🚩 País no válido. Usa MX para México, CO para Colombia, CL para Chile o AG para Argentina.', m, rcanal);
        return;
    }

    // Obtener la diferencia horaria del país seleccionado
    const diferenciaHoraria = diferenciasHorarias[pais];

    // Calcular las cuatro horas consecutivas en cada país según la hora proporcionada y la diferencia horaria
    const hora = parseInt(horaUsuario.split(':')[0], 10);
    const minutos = parseInt(horaUsuario.split(':')[1], 10);

    const horasEnPais = [];
    for (let i = 0; i < 4; i++) {
        const horaActual = new Date();
        horaActual.setHours(hora + i);
        horaActual.setMinutes(minutos);
        horaActual.setSeconds(0);
        horaActual.setMilliseconds(0);

        const horaEnPais = new Date(horaActual.getTime() - (3600000 * diferenciaHoraria)); // Restar la diferencia horaria
        horasEnPais.push(horaEnPais);
    }

    // Formatear las horas según el formato de 24 horas y obtener solo la hora y minutos
    const formatTime = (date) => date.toLocaleTimeString('es', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const horaActual = formatTime(new Date()); // Obtener la hora actual sin modificación

    const message = `
*4 Vs 4*  

🇲🇽 Mx : ${formatTime(horasEnPais[0])}
🇨🇴 Co : ${formatTime(horasEnPais[1])}
🇨🇱 Cl : ${formatTime(horasEnPais[2])}
🇦🇷 Ag : ${formatTime(horasEnPais[3])}

《✧》 *ESCUADRA*

👑 ┇ ${user(user0)}
🥷🏻 ┇ ${user(user1)}
🥷🏻 ┇ ${user(user2)}
🥷🏻 ┇ ${user(user3)}


《✧》 *SUPLENTE*
🥷🏻 ┇ ${user(user4)}
🥷🏻 ┇ ${user(user5)}
`.trim();

/*m.reply(message, null, {
mentions: [m.sender]});*/
m.reply(message, null, {mentions: [user0, user1, user2, user3, user4, user5]})   
};
handler.help = ['4vs4'];
handler.tags = ['ff'];
handler.command = ['4vs4', 'vs4'];
handler.register = true;
handler.group = true
export default handler;