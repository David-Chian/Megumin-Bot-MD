// Alex-X >> https://github.com/OfcKing

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
                const errorLine = stackLines.find(line => line.includes(pluginsDir)) || 'No se pudo determinar la línea del error'

                let suggestion = '❌ Error desconocido. Verifique el archivo manualmente.'
                if (error.message.includes('SyntaxError')) {
                    suggestion = '💡 Revisa la sintaxis: puede faltar un paréntesis, corchete o comilla.'
                } else if (error.message.includes('Cannot find module')) {
                    suggestion = '💡 Verifica que todos los módulos requeridos estén instalados y disponibles.'
                } else if (error.message.includes('Unexpected token')) {
                    suggestion = '💡 Puede ser un error en la estructura del código, como un símbolo mal colocado.'
                }

                response += `🚩 *Error en:* ${file}\n📍 *Línea sospechosa:* ${errorLine}\n🔎 *Mensaje del error:* ${error.message}\n💡 *Sugerencia:* ${suggestion}\n\n`
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
handler.register = true

export default handler