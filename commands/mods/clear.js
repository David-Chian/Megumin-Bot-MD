import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
 command: ['cleansubs', 'limpiarsubs', 'clearsubs', 'clear2'],
 category: 'mod',
 isModeration: true,
 run: async ({client, m}) => {
  try {
   const botDirs = [
    { label: 'Subbot', path: path.resolve(dirname, '../../Sessions/Subs') }
   ]

   let total = 0
   let details = []

   botDirs.forEach(({ label, path: baseDir }) => {
    if (!fs.existsSync(baseDir)) return

    const subDirs = fs.readdirSync(baseDir).filter(dir => {
     const fullPath = path.join(baseDir, dir)
     return fs.statSync(fullPath).isDirectory()
    })

    subDirs.forEach(subDir => {
     const subPath = path.join(baseDir, subDir)
     const files = fs.readdirSync(subPath)

     let eliminated = 0

     files.forEach(file => {
      if (file !== 'creds.json') {
       const filePath = path.join(subPath, file)
       fs.rmSync(filePath, { recursive: true, force: true })
       eliminated++
       total++
      }
     })

     if (eliminated > 0) {
      details.push(`${label} *${subDir}*: ${eliminated} archivos eliminados`)
     }
    })
   })

   let msg = `《✧》 Limpieza completada\n\n> Total archivos eliminados: ${total}`
   if (details.length > 0) msg += `\n\n${details.join('\n')}`

   await m.reply(msg)
  } catch (err) {
   await m.reply('✧ Error limpiando sesiones')
  }
 }
};
