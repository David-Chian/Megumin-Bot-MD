import cp from 'child_process'
import { promisify } from 'util'

const exec = promisify(cp.exec)

export default {
  command: ['r'],
  isOwner: true,
  run: async ({ client, m, text }) => {

    if (!text) return m.reply('Debes escribir un comando para ejecutar')

    let o
    try {
      o = await exec(text.trim())
    } catch (e) {
      o = e
    } finally {
      const { stdout, stderr } = o
      if (stdout && stdout.trim()) await m.reply(stdout)
      if (stderr && stderr.trim()) await m.reply(stderr)
    }
  }
}