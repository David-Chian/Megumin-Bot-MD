import axios from 'axios'
import crypto from 'crypto'
import NodeID3 from 'node-id3'
import sharp from 'sharp'

const API_URL = "https://remusic.ai/api/v1/ai-music/music"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const freshGa = () => `GA1.1.${Math.floor(Math.random() * 9e9 + 1e9)}.${Math.floor(Date.now() / 1000)}`
const randIP = () => Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 254)).join(".")

function getHeaders() {
  return {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://remusic.ai",
    "referer": "https://remusic.ai/ai-music-generator",
    "user-agent": UA,
    "cookie": `_ga=${freshGa()}; anonymous_user_id=${crypto.randomUUID()}`,
    "x-forwarded-for": randIP()
  }
}

const genrePatterns = [
  { regex: /\bnu[-\s]?metal(s)?\b/i, genre: 'nu-metal' },
  { regex: /\bspeed[-\s]?metal(s)?\b/i, genre: 'speed metal' },
  { regex: /\b(alternative|alt)[-\s]?rock(s)?\b/i, genre: 'alternative rock' },
  { regex: /\bk[-\s]?pop\b/i, genre: 'k-pop' },
  { regex: /\bj[-\s]?pop\b/i, genre: 'j-pop' },
  { regex: /\bc[-\s]?pop\b/i, genre: 'c-pop' },
  { regex: /\b(edm|electronic dance music)\b/i, genre: 'edm' },
  { regex: /\bdeep house\b/i, genre: 'deep house' },
  { regex: /\bprogressive house\b/i, genre: 'progressive house' },
  { regex: /\bfuture house\b/i, genre: 'future house' },
  { regex: /\bdubstep(s)?\b/i, genre: 'dubstep' },
  { regex: /\btech house\b/i, genre: 'tech house' },
  { regex: /\bminimal techno\b/i, genre: 'minimal techno' },
  { regex: /\btechno\b/i, genre: 'techno' },
  { regex: /\btrance\b/i, genre: 'trance' },
  { regex: /\bambient\b/i, genre: 'ambient' },
  { regex: /\belectro\b/i, genre: 'electro' },
  { regex: /\bm[úu]sica electr[óo]nica\b/i, genre: 'electronic music' },
  { regex: /\bphonk\b/i, genre: 'phonk' },
  { regex: /\bgrunge\b/i, genre: 'grunge' },
  { regex: /\bgoth(ic)? rock\b/i, genre: 'gothic rock' },
  { regex: /\bindie rock\b/i, genre: 'indie rock' },
  { regex: /\bindie pop\b/i, genre: 'indie pop' },
  { regex: /\bshoegaze\b/i, genre: 'shoegaze' },
  { regex: /\bno wave\b/i, genre: 'no wave' },
  { regex: /\bemo\b/i, genre: 'emo' },
  { regex: /\bmetalcore\b/i, genre: 'metalcore' },
  { regex: /\bdeath metal\b/i, genre: 'death metal' },
  { regex: /\bblack metal\b/i, genre: 'black metal' },
  { regex: /\bthrash metal\b/i, genre: 'thrash metal' },
  { regex: /\bprogressive metal\b/i, genre: 'progressive metal' },
  { regex: /\b(corrido(s)? tumbado(s)?)\b/i, genre: 'corridos tumbados' },
  { regex: /\bcorrido(s)?\b/i, genre: 'corridos' },
  { regex: /\bmariachi\b/i, genre: 'mariachi' },
  { regex: /\bnorteñ(o|a)\b/i, genre: 'norteño' },
  { regex: /\bbanda\b/i, genre: 'banda' },
  { regex: /\branchera\b/i, genre: 'ranchera' },
  { regex: /\bsalsa\b/i, genre: 'salsa' },
  { regex: /\bmerengue\b/i, genre: 'merengue' },
  { regex: /\bbachata\b/i, genre: 'bachata' },
  { regex: /\bcumbia\b/i, genre: 'cumbia' },
  { regex: /\b(reggaeton|reguet[oó]n)\b/i, genre: 'reggaeton' },
  { regex: /\bdembow\b/i, genre: 'dembow' },
  { regex: /\bafrobeat(s)?\b/i, genre: 'afrobeat' },
  { regex: /\bafro[-\s]?trap\b/i, genre: 'afro trap' },
  { regex: /\bamapiano\b/i, genre: 'amapiano' },
  { regex: /\bdancehall\b/i, genre: 'dancehall' },
  { regex: /\bska\b/i, genre: 'ska' },
  { regex: /\bgospel\b/i, genre: 'gospel' },
  { regex: /\b(hip[-\s]?hop|rap)\b/i, genre: 'hip hop' },
  { regex: /\bdrill\b/i, genre: 'drill' },
  { regex: /\bdrill latino\b/i, genre: 'latin drill' },
  { regex: /\b(trap latino|latin trap)\b/i, genre: 'latin trap' },
  { regex: /\bemo rap\b/i, genre: 'emo rap' },
  { regex: /\bcloud rap\b/i, genre: 'cloud rap' },
  { regex: /\btrap\b/i, genre: 'trap' },
  { regex: /\br&b\b/i, genre: 'r&b' },
  { regex: /\brhythm and blues\b/i, genre: 'r&b' },
  { regex: /\b(classical|opera|chamber music|modern classical)\b/i, genre: 'classical' },
  { regex: /\borchestral\b/i, genre: 'classical' },
  { regex: /\bsymphonic\b/i, genre: 'classical' },
  { regex: /\bfolk(s)?\b/i, genre: 'folk' },
  { regex: /\bhardstyle\b/i, genre: 'hardstyle' },
  { regex: /\bhardbass\b/i, genre: 'hardbass' },
  { regex: /\bbass boosted\b/i, genre: 'bass boosted' },
  { regex: /\bdrum and bass\b/i, genre: 'drum and bass' },
  { regex: /\bdnb\b/i, genre: 'drum and bass' },
  { regex: /\bindustrial\b/i, genre: 'industrial' },
  { regex: /\bexperimental\b/i, genre: 'experimental' },
  { regex: /\bavant[-\s]?garde\b/i, genre: 'avant-garde' },
  { regex: /\bworld music\b/i, genre: 'world music' },
  { regex: /\bmetal\b/i, genre: 'metal' },
  { regex: /\brock\b/i, genre: 'rock' },
  { regex: /\bpop\b/i, genre: 'pop' },
  { regex: /\blatin\b(?!\s+(trap|drill|pop))/i, genre: 'latin' },
  { regex: /\bsynthwave\b/i, genre: 'synthwave' },
  { regex: /\bretrowave\b/i, genre: 'retrowave' },
  { regex: /\bvaporwave\b/i, genre: 'vaporwave' },
  { regex: /\bfuture bass\b/i, genre: 'future bass' },
  { regex: /\bglitch hop\b/i, genre: 'glitch hop' },
  { regex: /\bneurofunk\b/i, genre: 'neurofunk' },
  { regex: /\bbreakcore\b/i, genre: 'breakcore' },
  { regex: /\bspeedcore\b/i, genre: 'speedcore' },
  { regex: /\bmakina\b/i, genre: 'makina' },
  { regex: /\beurobeat\b/i, genre: 'eurobeat' },
  { regex: /\bjumpstyle\b/i, genre: 'jumpstyle' },
  { regex: /\bcomplextro\b/i, genre: 'complextro' },
  { regex: /\bdark ambient\b/i, genre: 'dark ambient' },
  { regex: /\bdowntempo\b/i, genre: 'downtempo' },
  { regex: /\bchillwave\b/i, genre: 'chillwave' },
  { regex: /\bchillstep\b/i, genre: 'chillstep' },
  { regex: /\b(lo[-\s]?fi hip hop|lo[-\s]?fi|lofi)\b/i, genre: 'lo-fi' },
  { regex: /\bhard trance\b/i, genre: 'hard trance' },
  { regex: /\bpsytrance\b/i, genre: 'psytrance' },
  { regex: /\bgoa trance\b/i, genre: 'goa trance' },
  { regex: /\bbig room\b/i, genre: 'big room' },
  { regex: /\belectro house\b/i, genre: 'electro house' },
  { regex: /\bacid techno\b/i, genre: 'acid techno' },
  { regex: /\bacid house\b/i, genre: 'acid house' },
  { regex: /\bjungle\b/i, genre: 'jungle' },
  { regex: /\bpost[-\s]?rock\b/i, genre: 'post-rock' },
  { regex: /\bpost[-\s]?metal\b/i, genre: 'post-metal' },
  { regex: /\bmath rock\b/i, genre: 'math rock' },
  { regex: /\bmathcore\b/i, genre: 'mathcore' },
  { regex: /\bsludge metal\b/i, genre: 'sludge metal' },
  { regex: /\bdoom metal\b/i, genre: 'doom metal' },
  { regex: /\bstoner rock\b/i, genre: 'stoner rock' },
  { regex: /\bstoner metal\b/i, genre: 'stoner metal' },
  { regex: /\bpost[-\s]?hardcore\b/i, genre: 'post-hardcore' },
  { regex: /\bhardcore punk\b/i, genre: 'hardcore punk' },
  { regex: /\bcrust punk\b/i, genre: 'crust punk' },
  { regex: /\bblackgaze\b/i, genre: 'blackgaze' },
  { regex: /\bmetalstep\b/i, genre: 'metalstep' },
  { regex: /\bdjent\b/i, genre: 'djent' },
  { regex: /\bboom bap\b/i, genre: 'boom bap' },
  { regex: /\blo[-\s]?fi hip hop\b/i, genre: 'lo-fi hip hop' },
  { regex: /\bgrime\b/i, genre: 'grime' },
  { regex: /\breggaeton viejo\b/i, genre: 'reggaeton viejo' },
  { regex: /\btrap soul\b/i, genre: 'trap soul' },
  { regex: /\bdrill uk\b/i, genre: 'uk drill' },
  { regex: /\bjersey club\b/i, genre: 'jersey club' },
  { regex: /\bsamba\b/i, genre: 'samba' },
  { regex: /\bpagode\b/i, genre: 'pagode' },
  { regex: /\bforr[oó]\b/i, genre: 'forró' },
  { regex: /\bzouk\b/i, genre: 'zouk' },
  { regex: /\bkizomba\b/i, genre: 'kizomba' },
  { regex: /\bvallenato\b/i, genre: 'vallenato' },
  { regex: /\bchampeta\b/i, genre: 'champeta' },
  { regex: /\btango\b/i, genre: 'tango' },
  { regex: /\bflamenco\b/i, genre: 'flamenco' },
  { regex: /\bnew age\b/i, genre: 'new age' },
  { regex: /\bneo[-\s]?soul\b/i, genre: 'neo-soul' },
  { regex: /\bspoken word\b/i, genre: 'spoken word' },
  { regex: /\bchiptune\b/i, genre: 'chiptune' },
  { regex: /\b8[-\s]?bit\b/i, genre: '8-bit' },
  { regex: /\bbreakbeat\b/i, genre: 'breakbeat' },
  { regex: /\bnoise\b/i, genre: 'noise' },
  { regex: /\bcybergrind\b/i, genre: 'cybergrind' },
  { regex: /\bslap[-\s]?house\b/i, genre: 'slap house' },
  { regex: /\bbrazilian[-\s]?bass\b/i, genre: 'brazilian bass' },
  { regex: /\bhouse\b/i, genre: 'house' },
]

function detectGenres(text: string): string {
  const genres: string[] = []
  for (const { regex, genre } of genrePatterns) {
    if (regex.test(text) && !genres.includes(genre)) genres.push(genre)
  }
  return genres.join(', ')
}

async function createMusicJob(body: Record<string, any>, maxRetries = 5): Promise<any[]> {
  let lastError = "create failed"
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await axios.post(API_URL, body, { headers: getHeaders() })
      const json = res.data
      if (json && json.code === 100000 && Array.isArray(json.data) && json.data.length) {
        return json.data
      }
      lastError = json ? `${json.code}: ${json.message}` : `HTTP ${res.status}`
    } catch (err: any) {
      lastError = err.message
    }
    await sleep(1000)
  }
  throw new Error(lastError)
}

async function pollMusicJob(songId: string): Promise<any> {
  for (let i = 0; i < 50; i++) {
    await sleep(9000)
    try {
      const res = await axios.get(`${API_URL}/${songId}`, { headers: getHeaders() })
      const json = res.data
      const row = Array.isArray(json?.data) ? json.data[0] : json?.data
      if (!row) continue
      
      if (row.status === "success" && row.audio_url) {
        return row
      }
      if (["failed", "error", "fail"].includes(row.status)) {
        throw new Error("La generación falló en los servidores de la API.")
      }
    } catch (err: any) {
      console.error(`[Poll Error en ID ${songId}]:`, err.message)
    }
  }
  throw new Error("Tiempo de espera agotado para la canción.")
}

async function generarTitulo(lyrics: string): Promise<string> {
  if (!lyrics) return ''
  const iaPrompt = `Dame un título corto, original y atractivo para esta canción.\nResponde solo el título, sin comillas ni asteriscos ni texto adicional.\nLetra de la canción:\n${lyrics}`
  try {
    const iaRes = await axios.get('https://anabot.my.id/api/ai/bingchat', {
      params: { prompt: iaPrompt, apikey: 'freeApikey' },
      headers: { accept: 'application/json' }
    })
    if (iaRes.data?.success && iaRes.data?.data?.result?.chat) {
      return iaRes.data.data.result.chat
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .substring(0, 80)
    }
  } catch (error: any) {
    console.error('Error al generar título:', error.message)
  }
  return ''
}

export default {
  command: ['genmusic', 'genmusic2'],
  category: 'ai',

  run: async ({ sock, m, command, text }: any) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    if (command === 'genmusic' && !text) {
      return sock.reply(m.chat, `✎ Uso:\n\n*/genmusic* prompt / estilo musical\n_Ejemplo: lo-fi chill hop with saxophone_`, m, m.rcanal)
    }

    if (command === 'genmusic2' && !text) {
      return sock.reply(m.chat, `✎ Uso personalizado (Custom):\n\n*/genmusic2* letra | estilo/tags\n_Ejemplo: Letras de mi canción de amor | pop acústico, voz femenina_`, m, m.rcanal)
    }

    try {
      let body: Record<string, any> = {}
      let lyricsText = ""
      let styleTags = ""
      let finalTitle = "AI Song"

      await sock.reply(m.chat, '🎵 ᘜᥱᥒᥱrᥲᥒძ᥆ 𝗆𝗎́𝗌𝗂𝖼𝖺, 𝖾𝗌𝗉𝖾𝗋𝖺 𝗎𝗇 𝗆𝗈𝗆𝖾𝗇𝗍𝗈...', m, m.rcanal)

      if (command === 'genmusic') {
        if (text.length > 300) {
          return sock.reply(
            m.chat, 
            `⚠️ El *prompt* es demasiado largo. No puede superar los 300 caracteres.\nActualmente tiene ${text.length}.`, 
            m, 
            m.rcanal
          )
        }

        styleTags = detectGenres(text) || "Pop"
        body = {
          mode: 1,
          supplier: 10,
          mv: "v4",
          is_instrumental: /instrumental/i.test(text),
          is_public: true,
          prompt: String(text)
        }
      } else if (command === 'genmusic2') {
        const parts = text.split('|').map((v: string) => v.trim())
        const rawLyrics = parts[0] || ''
        const rawTags = parts[1] || 'Pop'

        if (!rawLyrics) {
          return sock.reply(m.chat, `⚠️ Debes escribir la letra de la canción antes del caracter "|".`, m, m.rcanal)
        }

        if (rawLyrics.length > 3000) {
          return sock.reply(m.chat, `⚠️ La *letra* no puede superar los 3000 caracteres.\nActualmente tiene ${rawLyrics.length}.`, m, m.rcanal)
        }

        if (rawTags.length > 200) {
          return sock.reply(m.chat, `⚠️ El *prompt/tags* no puede superar los 200 caracteres.\nActualmente tiene ${rawTags.length}.`, m, m.rcanal)
        }

        lyricsText = rawLyrics
        styleTags = rawTags
        finalTitle = (await generarTitulo(lyricsText)) || "New Custom Song"

        body = {
          mode: 2,
          supplier: 10,
          mv: "v4",
          is_instrumental: false,
          is_public: true,
          prompt: String(rawTags),
          title: finalTitle,
          tags: rawTags,
          lyrics: lyricsText
        }
      }

      const jobs = await createMusicJob(body)
      
      const results = await Promise.all(
        jobs.map(job => 
          pollMusicJob(job.song_id)
            .catch(err => {
              console.error(`Error en canción ${job.song_id}:`, err.message)
              return null
            })
        )
      )

      const validSongs = results.filter(Boolean)
      if (validSongs.length === 0) {
        throw new Error("No se pudo completar la generación de ninguna pista.")
      }

      for (const song of validSongs) {
        const audioUrl = song.audio_url
        const coverUrl = song.image_url || song.cover_url

        try {
          const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' })
          const audioBuffer = Buffer.from(audioRes.data)

          let thumbBuffer: Buffer | undefined
          let coverBuffer: Buffer | undefined

          if (coverUrl) {
            const imageRes = await axios.get(coverUrl, { responseType: 'arraybuffer' })
            coverBuffer = Buffer.from(imageRes.data)
            thumbBuffer = await sharp(coverBuffer).resize(320, 180).jpeg({ quality: 80 }).toBuffer()
          }

          const tags: any = {
            title: song.title || finalTitle,
            artist: 'The Diamond Bot',
            album: 'AI Music Collection',
            genre: song.tags || styleTags || 'AI Generation',
            year: '2026',
            comment: {
              language: 'spa',
              text: `Música generada mediante The Diamond Bot.`
            },
            unsynchronisedLyrics: {
              language: 'spa',
              text: song.lyrics || lyricsText || 'Pista Instrumental'
            }
          }

          if (coverBuffer) {
            tags.image = {
              mime: 'image/jpeg',
              type: { id: 3, name: 'front cover' },
              description: 'Cover',
              imageBuffer: coverBuffer
            }
          }

          const taggedBuffer = NodeID3.update(tags, audioBuffer)

          await sock.sendMessage(m.chat, {
            document: taggedBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${song.title || finalTitle}.mp3`,
            jpegThumbnail: thumbBuffer
          }, { quoted: m })

        } catch (err: any) {
          console.error(`Error procesando salida de audio:`, err.message)
        }
      }

    } catch (error: any) {
      sock.reply(m.chat, `✘ Error: ${error.message}`, m, m.rcanal)
    }
  }
}
