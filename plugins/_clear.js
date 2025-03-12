/*import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

let sessionPath = `./${sessions}/`

async function clearSessions() {
    console.log('💜 Iniciando limpieza de archivos de sesión...')

    if (!existsSync(sessionPath)) {
        console.log('🍁 La carpeta de sesiones no existe o está vacía.')
        return
}

    try {
        let files = await fs.readdir(sessionPath)
        let filesDeleted = 0

        for (const file of files) {
            if (file !== 'creds.json') {
                await fs.unlink(path.join(sessionPath, file))
                filesDeleted++
}}
        if (filesDeleted > 0) {
            console.log(`💜 Se eliminaron ${filesDeleted} archivos de sesión, excepto creds.json`)
} else {
            console.log('🍁 No hay archivos para eliminar')
}
} catch (err) {
        console.error('💔 Ocurrió un fallo al limpiar la sesión:', err)
}}
setInterval(clearSessions, 1 * 60 * 60 * 1000)
clearSessions()*/