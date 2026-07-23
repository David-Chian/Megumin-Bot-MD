import fs from 'fs'

const interacciones = JSON.parse(fs.readFileSync('./core/anime.json', 'utf-8'))

type CaptionFn = (from: string, to: string, genero?: string) => string

const g = (genero: string | undefined, m: string, f: string, x = 'x') =>
  genero === 'Hombre' ? m : genero === 'Mujer' ? f : x

const captions: Record<string, CaptionFn> = {
  peek:       (f, t) => f === t ? 'está espiando detrás de una puerta por diversión.'          : 'está espiando a',
  comfort:    (f, t) => f === t ? 'se está consolando a sí mismo.'                             : 'está consolando a',
  thinkhard:  (f, t) => f === t ? 'se quedó pensando muy intensamente.'                        : 'está pensando profundamente en',
  curious:    (f, t) => f === t ? 'se muestra curioso por todo.'                               : 'está curioso por lo que hace',
  sniff:      (f, t) => f === t ? 'se olfatea como si buscara algo raro.'                      : 'está olfateando a',
  stare:      (f, t) => f === t ? 'se queda mirando al techo sin razón.'                       : 'se queda mirando fijamente a',
  trip:       (f, t) => f === t ? 'se tropezó consigo mismo, otra vez.'                        : 'tropezó accidentalmente con',
  blowkiss:   (f, t) => f === t ? 'se manda un beso al espejo.'                               : 'le lanzó un beso a',
  snuggle:    (f, t) => f === t ? 'se acurruca con una almohada suave.'                        : 'se acurruca dulcemente con',
  sleep:      (f, t) => f === t ? 'está durmiendo plácidamente.'                               : 'está durmiendo con',
  cold:       (f, t) => f === t ? 'tiene mucho frío.'                                          : 'se congela por el frío de',
  sing:       (f, t) => f === t ? 'está cantando.'                                             : 'le está cantando a',
  tickle:     (f, t) => f === t ? 'se está haciendo cosquillas.'                               : 'le está haciendo cosquillas a',
  scream:     (f, t) => f === t ? 'está gritando al viento.'                                   : 'le está gritando a',
  push:       (f, t) => f === t ? 'se empujó a sí mismo.'                                      : 'empujó a',
  nope:       (f, t) => f === t ? 'expresa claramente su desacuerdo.'                          : 'dice "¡No!" a',
  jump:       (f, t) => f === t ? 'salta de felicidad.'                                        : 'salta feliz con',
  heat:       (f, t) => f === t ? 'siente mucho calor.'                                        : 'tiene calor por',
  gaming:     (f, t) => f === t ? 'está jugando solo.'                                         : 'está jugando con',
  draw:       (f, t) => f === t ? 'hace un lindo dibujo.'                                      : 'dibuja inspirado en',
  call:       (f, t) => f === t ? 'marca su propio número esperando respuesta.'                : 'llamó al número de',
  seduce:     (f, t) => f === t ? 'lanzó una mirada seductora al vacío.'                       : 'está intentando seducir a',
  bleh:       (f, t) => f === t ? 'se sacó la lengua frente al espejo.'                        : 'le está haciendo muecas con la lengua a',
  blush:      (f, t) => f === t ? 'se sonrojó.'                                                : 'se sonrojó por',
  impregnate: (f, t) => f === t ? 'se embarazó.'                                               : 'embarazó a',
  cry:        (f, t) => f === t ? 'está llorando.'                                             : 'está llorando por',
  happy:      (f, t) => f === t ? 'está feliz.'                                                : 'está feliz con',
  coffee:     (f, t) => f === t ? 'está tomando café.'                                         : 'está tomando café con',
  clap:       (f, t) => f === t ? 'está aplaudiendo por algo.'                                 : 'está aplaudiendo por',
  cringe:     (f, t) => f === t ? 'siente cringe.'                                             : 'siente cringe por',
  dance:      (f, t) => f === t ? 'está bailando.'                                             : 'está bailando con',
  eat:        (f, t) => f === t ? 'está comiendo algo delicioso.'                              : 'está comiendo con',
  highfive:   (f, t) => f === t ? 'se chocó los cinco frente al espejo.'                      : 'chocó los 5 con',
  kill:       (f, t) => f === t ? 'se autoeliminó en modo dramático.'                          : 'asesinó a',
  kiss:       (f, t) => f === t ? 'se mandó un beso al aire.'                                  : 'le dio un beso a',
  kisscheek:  (f, t) => f === t ? 'se besó en la mejilla usando un espejo.'                   : 'le dio un beso en la mejilla a',
  lick:       (f, t) => f === t ? 'se lamió por curiosidad.'                                   : 'lamió a',
  laugh:      (f, t) => f === t ? 'se está riendo de algo.'                                    : 'se está burlando de',
  pat:        (f, t) => f === t ? 'se acarició la cabeza con ternura.'                         : 'le dio una caricia a',
  punch:      (f, t) => f === t ? 'lanzó un puñetazo al aire.'                                 : 'le dio un puñetazo a',
  run:        (f, t) => f === t ? 'está corriendo por su vida.'                                : 'está corriendo con',
  sad:        (f, t) => f === t ? 'está triste.'                                               : 'está expresando su tristeza a',
  smoke:      (f, t) => f === t ? 'está fumando tranquilamente.'                               : 'está fumando con',
  smile:      (f, t) => f === t ? 'está sonriendo.'                                            : 'le sonrió a',
  smug:       (f, t) => f === t ? 'está presumiendo mucho últimamente.'                        : 'está presumiendo a',
  think:      (f, t) => f === t ? 'está pensando profundamente.'                               : 'no puede dejar de pensar en',
  walk:       (f, t) => f === t ? 'salió a caminar en soledad.'                                : 'decidió dar un paseo con',
  dramatic:   (f, t) => f === t ? 'está haciendo un drama exagerado.'                          : 'le está haciendo un drama a',

  // Con género
  shy:      (f, t, gen) => f === t
    ? 'se sonrojó tímidamente y desvió la mirada.'
    : `se siente demasiado tímid${g(gen, 'o', 'a', 'e')} para mirar a`,
  slap:     (f, t, gen) => f === t
    ? `se dio una bofetada a sí mism${g(gen, 'o', 'a', 'x')}.`
    : 'le dio una bofetada a',
  angry:    (f, t, gen) => f === t
    ? `está muy enoj${g(gen, 'ado', 'ada', 'adx')}.`
    : `está super enoj${g(gen, 'ado', 'ada', 'adx')} con`,
  bored:    (f, t, gen) => f === t
    ? `está muy aburrid${g(gen, 'o', 'a', 'x')}.`
    : `está aburrid${g(gen, 'o', 'a', 'x')} de`,
  bite:     (f, t, gen) => f === t
    ? `se mordió solit${g(gen, 'o', 'a', 'x')}.`
    : 'mordió a',
  bonk:     (f, t, gen) => f === t
    ? `se dio un bonk a sí mism${g(gen, 'o', 'a', 'x')}.`
    : 'le dio un golpe a',
  bully:    (f, t, gen) => f === t
    ? `se hace bullying ${g(gen, 'el mismo', 'ella misma', 'el/ella mismx')}… alguien que ${g(gen, 'lo', 'la', 'lx')} abrace.`
    : 'le está haciendo bullying a',
  cuddle:   (f, t, gen) => f === t
    ? `se acurrucó sol${g(gen, 'o', 'a', 'x')}.`
    : 'se acurrucó con',
  drunk:    (f, t, gen) => f === t
    ? `está demasiado borrac${g(gen, 'ho', 'ha', 'hx')}.`
    : `está borrac${g(gen, 'ho', 'ha', 'hx')} con`,
  handhold: (f, t, gen) => f === t
    ? `se dio la mano consigo mism${g(gen, 'o', 'a', 'x')}.`
    : 'le agarró la mano a',
  hug:      (f, t, gen) => f === t
    ? `se abrazó a sí mism${g(gen, 'o', 'a', 'x')}.`
    : 'le dio un abrazo a',
  love:     (f, t, gen) => f === t
    ? `se quiere mucho a sí mism${g(gen, 'o', 'a', 'x')}.`
    : 'siente atracción por',
  pout:     (f, t, gen) => f === t
    ? `está haciendo pucheros sol${g(gen, 'o', 'a', 'x')}.`
    : 'está haciendo pucheros con',
  scared:   (f, t, gen) => f === t
    ? `está asustadx por algo.`
    : `está asustad${g(gen, 'o', 'a', 'x')} por`,
  spit:     (f, t, gen) => f === t
    ? `se escupió a sí mism${g(gen, 'o', 'a', 'x')} por accidente.`
    : 'le escupió a',
  step:     (f, t, gen) => f === t
    ? `se pisó a sí mism${g(gen, 'o', 'a', 'x')} por accidente.`
    : 'está pisando a',
  wave:     (f, t, gen) => f === t
    ? `se saludó a sí mism${g(gen, 'o', 'a', 'x')} en el espejo.`
    : 'está saludando a',
  wink:     (f, t, gen) => f === t
    ? `se guiñó a sí mism${g(gen, 'o', 'a', 'x')} en el espejo.`
    : 'le guiñó a',
}

const commandAliases: Record<string, string> = {
  muak:     'kiss',
  beso:     'kisscheek',
  cafe:     'coffee',
  aburrido: 'bored',
  drama:    'dramatic',
  preg:     'impregnate',
  timido:   'shy',
  correr:   'run',
  triste:   'sad',
  amor:     'love',
  fumar:    'smoke',
  escupir:  'spit',
  pisar:    'step',
  comer:    'eat',
  nom:      'eat',
  feliz:    'happy',
  morder:   'bite',
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
    'angry', 'bleh', 'bored', 'aburrido', 'beso', 'clap', 'coffee', 'cafe',
    'dramatic', 'drama', 'drunk', 'impregnate', 'preg', 'kisscheek', 'laugh',
    'love', 'amor', 'pout', 'punch', 'run', 'correr', 'sad', 'triste',
    'scared', 'seduce', 'shy', 'timido', 'sleep', 'smoke', 'fumar', 'spit',
    'escupir', 'step', 'pisar', 'think', 'walk', 'hug', 'kill', 'eat', 'nom',
    'comer', 'kiss', 'muak', 'wink', 'pat', 'happy', 'feliz', 'bully', 'bite',
    'morder', 'blush', 'wave', 'bath', 'smug', 'smile', 'highfive', 'handhold',
    'cringe', 'bonk', 'cry', 'lick', 'slap', 'dance', 'cuddle', 'cold', 'sing',
    'tickle', 'scream', 'push', 'nope', 'jump', 'heat', 'gaming', 'draw',
    'call', 'snuggle', 'blowkiss', 'trip', 'stare', 'sniff', 'curious',
    'thinkhard', 'comfort', 'peek',
  ],
  category: 'anime',

  run: async ({ sock, m, command }: any) => {
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
    const fromName = fromUser?.name  || 'Alguien'
    const toName   = toUser?.name    || 'alguien'
    const genero   = fromUser?.genre || 'Oculto'

    const captionText = captions[currentCommand](fromName, toName, genero)
    const caption = who !== m.sender
      ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
      : `${fromName} ${captionText} ${getRandomSymbol()}.`

    const mediaUrl = getRandomUrl(currentCommand)
    if (!mediaUrl)
      return m.reply(`No hay videos disponibles para *${currentCommand}*.`)

    try {
      await sock.sendMessage(
        m.chat,
        { video: { url: mediaUrl }, gifPlayback: true, caption, mentions: [who, m.sender] },
        { quoted: m }
      )
    } catch (e: any) {
      await m.reply(e.message)
    }
  },
}