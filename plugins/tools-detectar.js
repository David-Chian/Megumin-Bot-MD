import fs from 'fs'
import path from 'path'

var handler = async (m, { usedPrefix, command }) => {
    try {
        await m.react('🕒') 
        conn.sendPresenceUpdate('composing', m.chat)

        const pluginsDir = './plugins'

        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

        let response = `📂 *Revisión de Syntax Errors:*\n\n`
        let hasErrors = false

        for (const file of files) {
            try {
                await import(path.resolve(pluginsDir, file))
            } catch (error) {
                hasErrors = true
                const stackLines = error.stack.split('\n')

                const errorLineMatch = stackLines[0].match(/:(\d+):\d+/) 
                const errorLine = errorLineMatch ? errorLineMatch[1] : 'Desconocido'

                response += `🚩 *Error en:* ${file}\n\n> ● Mensaje: ${error.message}\n> ● Número de línea: ${errorLine}\n\n${dev}`
            }
        }

        if (!hasErrors) {
            response += '✅ ¡Todo está en orden! No se detectaron errores de sintaxis'
        }

        await conn.reply(m.chat, response, m)
        await m.react('✅')
    } catch (err) {
        await m.react('✖️') 
        console.error(err)
        conn.reply(m.chat, '🚩 *Ocurrió un fallo al verificar los plugins.*', m)
    }
}

handler.command = ['detectarsyntax']
handler.help = ['detectarsyntax']
handler.tags = ['tools']
handler.rowner = true
handler.register = true

export default handler
