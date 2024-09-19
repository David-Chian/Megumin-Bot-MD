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
let user6 = psmap.getRandom()
let user7 = psmap.getRandom()
let user8 = psmap.getRandom()
let user9 = psmap.getRandom()
let user10 = psmap.getRandom()
let user11 = psmap.getRandom()
let user12 = psmap.getRandom()
let user13 = psmap.getRandom()
let user14 = psmap.getRandom()

if (psmap == '') return conn.reply(m.chat, `😿 No se ha encontrado usuarios para crear la escuadra`, m, fake)

    // Verificar si se proporcionaron los argumentos necesarios
    if (args.length < 2) {
        conn.reply(m.chat, '🚩 Debes proporcionar la hora (HH:MM) y el color de ropa.', m, rcanal);
        return;
    }

    // Validar el formato de la hora
    const horaRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    if (!horaRegex.test(args[0])) {
        conn.reply(m.chat, '🚩 Formato de hora incorrecto. Debe ser HH:MM en formato de 24 horas.', m, rcanal);
        return;
    }

    const horaUsuario = args[0]; // Hora proporcionada por el usuario
    const colorRopa = args.slice(1).join(' '); // Color de ropa proporcionado por el usuario

    // Calcular la hora adelantada
    const horaUsuarioSplit = horaUsuario.split(':');
    let horaAdelantada = '';
    if (horaUsuarioSplit.length === 2) {
        const horaNumerica = parseInt(horaUsuarioSplit[0], 10);
        const minutoNumerico = parseInt(horaUsuarioSplit[1], 10);
        const horaAdelantadaNumerica = horaNumerica + 1; // Adelantar 1 hora
        horaAdelantada = `${horaAdelantadaNumerica.toString().padStart(2, '0')}:${minutoNumerico.toString().padStart(2, '0')}`;
    }

    const message = `
    12 Vs 12
    
    *HORARIO*
    🇲🇽 Mx : ${horaUsuario}
    🇨🇴 Co : ${horaAdelantada}
    Color de ropa: ${colorRopa}

    ¬ *JUGADORES PRESENTES*
    
          *Escuadra 1*
    
    👑 ┇ ${user(user0)}
    🥷🏻 ┇ ${user(user2)}
    🥷🏻 ┇ ${user(user3)}
    🥷🏻 ┇ ${user(user4)}
          
         *Escuadra 2*
    
    👑 ┇ ${user(user5)}
    🥷🏻 ┇ ${user(user6)}
    🥷🏻 ┇ ${user(user7)}
    🥷🏻 ┇ ${user(user8)}
    
         *Escuadra 3*
    
    👑 ┇ ${user(user9)}
    🥷🏻 ┇ ${user(user10)} 
    🥷🏻 ┇ ${user(user11)}
    🥷🏻 ┇ ${user(user12)}
    
    ㅤ *Suplente*
    🥷🏻 ┇ ${user(user13)}
    🥷🏻 ┇ ${user(user14)}
    `.trim();

m.reply(message, null, {mentions: [user0, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, user14]})   
};
handler.help = ['12vs12'];
handler.tags = ['ff'];
handler.command = ['12vs12', 'vs12'];
handler.register = true;
handler.group = true
export default handler;