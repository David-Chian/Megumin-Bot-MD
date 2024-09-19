const handler = async (m, { conn, args }) => {
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
    
    👑 ┇ 
    🥷🏻 ┇  
    🥷🏻 ┇ 
    🥷🏻 ┇ 
          
         *Escuadra 2*
    
    👑 ┇ 
    🥷🏻 ┇ 
    🥷🏻 ┇ 
    🥷🏻 ┇ 
    
         *Escuadra 3*
    
    👑 ┇ 
    🥷🏻 ┇ 
    🥷🏻 ┇ 
    🥷🏻 ┇ 
    
    ㅤ *Suplente*
    🥷🏻 ┇ 
    🥷🏻 ┇
    `.trim();
    
    conn.sendMessage(m.chat, {text: message}, {quoted: m});
};
handler.help = ['12vs12'];
handler.tags = ['ff'];
handler.command = ['12vs12', 'vs12'];
handler.register = true;
export default handler;