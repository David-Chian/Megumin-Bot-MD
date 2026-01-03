import fetch from 'node-fetch';

export default {
  command: ['imagen', 'img', 'image'],
  category: 'search',
  run: async ({client, m, args, from}) => {
    const text = args.join(' ')
    if (!text) {
      return client.reply(
        m.chat,
        `《✧》 Ingresa un *término* de búsqueda.`,
        m,
      )
    }

const bannedWords = [
  '+18', '18+', 'contenido adulto', 'contenido explícito', 'contenido sexual',
  'actriz porno', 'actor porno', 'estrella porno', 'pornstar', 'video xxx', 'xxx', 'x x x',
  'pornhub', 'xvideos', 'xnxx', 'redtube', 'brazzers', 'onlyfans', 'cam4', 'chaturbate',
  'myfreecams', 'bongacams', 'livejasmin', 'spankbang', 'tnaflix', 'hclips', 'fapello',
  'mia khalifa', 'lana rhoades', 'riley reid', 'abella danger', 'brandi love',
  'eva elfie', 'nicole aniston', 'janice griffith', 'alexis texas', 'lela star',
  'gianna michaels', 'adriana chechik', 'asa akira', 'mandy muse', 'kendra lust',
  'jordi el niño polla', 'johnny sins', 'danny d', 'manuel ferrara', 'mark rockwell',
  'porno', 'porn', 'sexo', 'sex', 'desnudo', 'desnuda', 'erótico', 'erotico', 'erotika',
  'tetas', 'pechos', 'boobs', 'boob', 'nalgas', 'culo', 'culos', 'qlos', 'trasero',
  'pene', 'verga', 'vergota', 'pito', 'chocha', 'vagina', 'vaginas', 'coño', 'concha',
  'genital', 'genitales', 'masturbar', 'masturbación', 'masturbacion', 'gemidos',
  'gemir', 'orgía', 'orgy', 'trío', 'trio', 'gangbang', 'creampie', 'facial', 'cum',
  'milf', 'teen', 'incesto', 'incest', 'violación', 'violacion', 'rape', 'bdsm',
  'hentai', 'tentacle', 'tentáculos', 'fetish', 'fetiche', 'sado', 'sadomaso',
  'camgirl', 'camsex', 'camshow', 'playboy', 'playgirl', 'playmate', 'striptease',
  'striptis', 'slut', 'puta', 'putas', 'perra', 'perras', 'whore', 'fuck', 'fucking',
  'fucked', 'cock', 'dick', 'pussy', 'ass', 'shemale', 'trans', 'transgénero',
  'transgenero', 'lesbian', 'lesbiana', 'gay', 'lgbt', 'explicit', 'hardcore',
  'softcore', 'nudista', 'nudismo', 'nudity', 'deepthroat', 'dp', 'double penetration',
  'analplay', 'analplug', 'rimjob', 'spank', 'spanking', 'lick', 'licking', '69',
  'doggystyle', 'reverse cowgirl', 'cowgirl', 'blowjob', 'bj', 'handjob', 'hj',
  'p0rn', 's3x', 'v@gina', 'c0ck', 'd1ck', 'fuk', 'fuking', 'fak', 'boobz', 'pusy',
  'azz', 'cumshot', 'sexcam', 'livecam', 'webcam', 'sexchat', 'sexshow', 'sexvideo',
  'sexvid', 'sexpics', 'sexphoto', 'seximage', 'sexgif', 'pornpic', 'pornimage',
  'pornvid', 'pornvideo', 'only fan', 'only-fans', 'only_fans', 'onlyfans.com',
  'mia khalifha', 'mia khalifah', 'mia khalifaa', 'mia khalif4', 'mia khal1fa',
  'mia khalifa +18', 'mia khalifa xxx', 'mia khalifa desnuda', 'mia khalifa porno'
]
    const lowerText = text.toLowerCase()
    const nsfwEnabled = global.db.data.chats[m.chat]?.nsfw === true

    if (!nsfwEnabled && bannedWords.some((word) => lowerText.includes(word))) {
      return m.reply('《✧》 Este comando no *permite* búsquedas de contenido *+18* o *NSFW*')
    }

    await m.reply(mess.wait)

    const url = `${api.url}/search/googleimagen?query=${encodeURIComponent(text)}&key=${api.key}`

    try {
      const res = await fetch(url)

      if (!res.ok || !res.headers.get('content-type')?.includes('image')) {
        return m.reply(`ꕥ No se encontraron resultados para *${text}*`)
      }

      const buffer = await res.buffer()

      await client.sendMessage(m.chat, { image: buffer }, { quoted: m })
    } catch (e) {
     // console.error(e)
      await m.reply(msgglobal)
    }
  },
};
