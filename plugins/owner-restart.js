let handler = async (m, { conn, usedPrefix, command }) => {

    try {
        m.reply('✧ El bot se reiniciará en breve...')
        setTimeout(() => {
            process.exit(0)
        }, 3000) 
    } catch (error) {
        console.log(error)
        conn.reply(m.chat, `⚠︎ *Error:* ${error}`, m)
    }
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart']
handler.rowner = true

export default handler