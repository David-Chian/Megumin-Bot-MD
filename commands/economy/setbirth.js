export default {
  command: ['setbirth'],
  category: 'profile',
  run: async ({client, m, args}) => {
    const user = global.db.data.users[m.sender]
    const currentYear = new Date().getFullYear()
    const input = args.join(' ')

    if (user.birth)
      return m.reply(
        `《✧》 Ya tienes una fecha establecida. Usa › *${prefa}delbirth* para eliminarla.`,
      )

    if (!input)
      return m.reply(
        '《✧》 Debes ingresar una fecha válida.\n\n`Ejemplo`' +
          `\n${prefa}setbirth *01/01/2000*\n${prefa}setbirth *01/01*`,
      )

    const birth = validarFechaNacimiento(input, currentYear, 'setbirth')
    if (!birth || birth.includes('El año no puede ser mayor'))
      return m.reply(birth || `《✧》 Fecha inválida. Usa › *${prefa}setbirth 01/01/2000*`)

    user.birth = birth
    return m.reply(`✎ Se ha establecido tu fecha de nacimiento como: *${user.birth}*`)
  },
};

function validarFechaNacimiento(text, currentYear, command) {
  const formatos = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{1,2}\/\d{1,2}$/,
    /^\d{1,2} \w+$/,
    /^\d{1,2} \w+ \d{4}$/,
  ]
  if (!formatos.some((r) => r.test(text))) return null

  let dia, mes, año
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
    ;[dia, mes, año] = text.split('/').map(Number)
  } else if (/^\d{1,2}\/\d{1,2}$/.test(text)) {
    ;[dia, mes] = text.split('/').map(Number)
    año = currentYear
  } else {
    const partes = text.split(' ')
    dia = parseInt(partes[0])
    mes = new Date(`${partes[1]} 1`).getMonth() + 1
    año = partes[2] ? parseInt(partes[2]) : currentYear
  }

  if (año > currentYear)
    return `✦ El año no puede ser mayor a ${currentYear}. Ejemplo: ${prefa}setbirth 01/12/${currentYear}`

  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const diasPorSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const diasPorMes = [
    31,
    (año % 4 === 0 && año % 100 !== 0) || año % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]

  while (dia > diasPorMes[mes - 1]) {
    dia -= diasPorMes[mes - 1]
    mes++
    if (mes > 12) {
      mes = 1
      año++
    }
  }

  const fecha = new Date(`${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`)
  const diaSemana = diasPorSemana[fecha.getUTCDay()]
  return `${diaSemana}, ${dia} de ${meses[mes - 1]}`
}
