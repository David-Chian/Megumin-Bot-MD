import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseGitStatus(output) {
  const ignored = [
    'node_modules/',
    'backups/',
    'Sessions/',
    '.cache/',
    '.npm/',
    'tmp/',
    '.db',
    '.db-shm',
    '.db-wal',
    '.tar.gz',
    'package-lock.json'
  ]

  return output
    .trim()
    .split('\n')
    .filter(line => {
      const file = line.slice(3)
      return !ignored.some(i => file.includes(i))
    })
    .map(line => {
      const status = line.slice(0, 2).trim()
      const file = line.slice(3)
      return `• ${file} (${status})`
    })
    .join('\n')
}

async function reloadCommands(dir = path.join(__dirname, '..')) {
  const commandsMap = new Map()

  async function readCommands(folder) {
    const files = fs.readdirSync(folder)
    for (const file of files) {
      const fullPath = path.join(folder, file)
      if (fs.lstatSync(fullPath).isDirectory()) {
        await readCommands(fullPath)
      } else if (file.endsWith('.js')) {
        try {
          const { default: cmd } = await import(fullPath + '?update=' + Date.now())
          if (cmd?.command) {
            for (const c of cmd.command) {
              commandsMap.set(c.toLowerCase(), cmd)
            }
          }
        } catch (err) {
          console.error(`Error recargando comando ${file}:`, err)
        }
      }
    }
  }

  await readCommands(dir)
  global.comandos = commandsMap
}

export default {
  command: ['fix', 'update'],
  isOwner: true,

  run: async ({ client, m }) => {
    exec('git status --porcelain', (err, statusOut) => {
      if (err) return

      const filteredList = parseGitStatus(statusOut)
      const hasRealChanges = filteredList.length > 0

      const gitCmd = 'git pull'

      exec(gitCmd, async (error, stdout) => {
        if (error) {
          return client.sendMessage(
            m.key.remoteJid,
            { text: `❌ Error al actualizar\n\n${error.message}` },
            { quoted: m }
          )
        }

        await reloadCommands(path.join(__dirname, '..'))

        let msg = ''

        if (hasRealChanges) {
          msg +=
            '⚠️ *Cambios locales detectados*\n' +
            '*Archivos modificados:*\n' +
            filteredList +
            '\n\n'
        }

        if (stdout.includes('Already up to date')) {
          msg += 'ꕥ *Estado:* Todo está actualizado'
        } else {
          msg += `✅ *Actualización completada*\n\n${stdout}`
        }

        await client.sendMessage(
          m.key.remoteJid,
          { text: msg },
          { quoted: m }
        )
      })
    })
  }
}