import fs from 'fs'

const interacciones = JSON.parse(fs.readFileSync('./core/nsfw.json', 'utf-8'))

const captions: Record<string, (from: string, to: string) => string> = {
  anal:        (f, t) => f === t ? 'se la metió en el ano.'                               : 'se la metió en el ano a',
  cum:         (f, t) => f === t ? 'se vino dentro de... Omitiremos eso.'                 : 'se vino dentro de',
  undress:     (f, t) => f === t ? 'se está quitando la ropa.'                            : 'le está quitando la ropa a',
  fuck:        (f, t) => f === t ? 'se entrega al deseo.'                                 : 'se está cogiendo a',
  spank:       (f, t) => f === t ? 'está dando una nalgada.'                              : 'le está dando una nalgada a',
  lickpussy:   (f, t) => f === t ? 'está lamiendo un coño.'                               : 'le está lamiendo el coño a',
  fap:         (f, t) => f === t ? 'se está masturbando.'                                 : 'se está masturbando pensando en',
  grope:       (f, t) => f === t ? 'se lo está manoseando.'                               : 'se lo está manoseando a',
  sixnine:     (f, t) => f === t ? 'está haciendo un 69.'                                 : 'está haciendo un 69 con',
  suckboobs:   (f, t) => f === t ? 'está chupando unas ricas tetas.'                      : 'le está chupando las tetas a',
  grabboobs:   (f, t) => f === t ? 'está agarrando unas tetas.'                           : 'le está agarrando las tetas a',
  blowjob:     (f, t) => f === t ? 'está dando una rica mamada.'                          : 'le dio una mamada a',
  boobjob:     (f, t) => f === t ? 'está haciendo una rusa.'                              : 'le está haciendo una rusa a',
  footjob:     (f, t) => f === t ? 'está haciendo una paja con los pies.'                 : 'le está haciendo una paja con los pies a',
  yuri:        (f, t) => f === t ? 'está disfrutando sola de un momento lésbico.'         : 'está teniendo un momento yuri con',
  cummouth:    (f, t) => f === t ? 'recibió en la boca... qué desastre.'                  : 'le dio en la boca a',
  cumshot:     (f, t) => f === t ? 'recibió un cumshot de la nada.'                       : 'le hizo un cumshot a',
  lickdick:    (f, t) => f === t ? 'está lamiéndosela solo.'                              : 'le está lamiendo la pinga a',
  lickass:     (f, t) => f === t ? 'se está lamiendo el trasero por curiosidad.'          : 'le está lamiendo el trasero a',
  handjob:     (f, t) => f === t ? 'se está haciendo una paja.'                           : 'le está haciendo una paja a',
  fingering:   (f, t) => f === t ? 'se está metiendo los dedos.'                          : 'le está metiendo los dedos a',
  creampie:    (f, t) => f === t ? 'quedó bien relleno/a por dentro.'                     : 'le hizo una creampie a',
  facesitting: (f, t) => f === t ? 'se sentó en su propia cara... no preguntes cómo.'    : 'le está sentando la cara a',
  futanari:    (f, t) => f === t ? 'está disfrutando de sus... atributos especiales.'     : 'está haciendo cosas especiales con',
  pegging:     (f, t) => f === t ? 'se está pegueando a sí mismo/a.'                     : 'le está haciendo pegging a',
  bondage:     (f, t) => f === t ? 'se ató solo/a y ahora no puede salir.'               : 'ató con cuerdas a',
  deepthroat:  (f, t) => f === t ? 'se tragó algo muy hondo.'                             : 'le está haciendo deepthroat a',
  thighjob:    (f, t) => f === t ? 'se está frotando entre los muslos.'                   : 'le está haciendo un thighjob a',
  yaoi:        (f, t) => f === t ? 'está disfrutando de un momento yaoi solo.'            : 'está teniendo un momento yaoi con',
  bukkake:     (f, t) => f === t ? 'recibió un bukake de quién sabe quién.'               : 'le hizo un bukake a',
  orgy:        (f, t) => f === t ? 'se metió solo a una orgía... raro pero válido.'       : 'está en una orgía con',
  squirting:   (f, t) => f === t ? 'squirteó sin control.'                                : 'hizo squirt gracias a',
}

const commandAliases: Record<string, string> = {
  encuerar: 'undress',
  coger:    'fuck',
  nalgada:  'spank',
  paja:     'fap',
  '69':     'sixnine',
  bj:       'blowjob',
}

const symbols = [
  '(⁠◠⁠‿⁠◕⁠)', '˃͈◡˂͈', '૮(˶ᵔᵕᵔ˶)ა', '(づ｡◕‿‿◕｡)づ', '(✿◡‿◡)',
  '(꒪⌓꒪)', '(✿✪‿✪｡)', '(*≧ω≦)', '(✧ω◕)', '˃ 𖥦 ˂',
  '(⌒‿⌒)', '(¬‿¬)', '(✧ω✧)', '✿(◕ ‿◕)✿', 'ʕ•́ᴥ•̀ʔっ',
  '(ㅇㅅㅇ❀)', '(∩︵∩)', '(✪ω✪)', '(✯◕‿◕✯)', '(•̀ᴗ•́)و ̑̑',
]

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)]
}

function getRandomUrl(type: string): string | null {
  const list = interacciones[type]
  if (!list?.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

export default {
  command: [
    'anal', 'cum', 'undress', 'encuerar', 'fuck', 'coger',
    'spank', 'nalgada', 'lickpussy', 'fap', 'paja', 'grope',
    'sixnine', '69', 'suckboobs', 'grabboobs', 'blowjob', 'bj',
    'boobjob', 'footjob', 'yuri', 'cummouth', 'cumshot', 'lickdick',
    'lickass', 'handjob', 'fingering', 'creampie', 'facesitting',
    'futanari', 'pegging', 'bondage', 'deepthroat', 'thighjob',
    'yaoi', 'bukkake', 'orgy', 'squirting',
  ],
  category: 'nsfw',

  run: async ({ sock, m, command, usedPrefix }: any) => {
    const chat = getChat(m.chat)
    if (!chat.nsfw)
      return m.reply('✐ Los comandos de *NSFW* están desactivados en este Grupo.')

    const currentCommand = commandAliases[command] || command
    if (!captions[currentCommand]) return

    let who: string
    if (m.isGroup) {
      who = m.mentionedJid?.length > 0
        ? m.mentionedJid[0]
        : m.quoted?.sender ?? m.sender
    } else {
      who = m.quoted?.sender ?? m.sender
    }

    const fromUser = getUser(m.sender)
    const toUser   = getUser(who)
    const fromName = fromUser?.name || 'Alguien'
    const toName   = toUser?.name   || 'alguien'

    const captionText = captions[currentCommand](fromName, toName)
    const caption = who !== m.sender
      ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
      : `${fromName} ${captionText} ${getRandomSymbol()}.`

    const mediaUrl = getRandomUrl(currentCommand)
    if (!mediaUrl)
      return m.reply(`No hay videos disponibles para *${currentCommand}*.`)

    const isImage = /\.(jpe?g|png|webp)$/i.test(mediaUrl)

    try {
      if (isImage) {
        await sock.sendMessage(
          m.chat,
          { image: { url: mediaUrl }, caption, mentions: [who, m.sender] },
          { quoted: m }
        )
      } else {
        await sock.sendMessage(
          m.chat,
          { video: { url: mediaUrl }, gifPlayback: true, caption, mentions: [who, m.sender] },
          { quoted: m }
        )
      }
    } catch (e: any) {
      await m.reply(e.message)
    }
  },
}