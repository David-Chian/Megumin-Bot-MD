export default {
    command: ['struct', 'estructura', 'json'],
    isOwner: true,
    run: async ({ sock, m }) => {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

        if (!quoted) return m.reply('↩️ Responde un mensaje con este comando.')

        const estructura = JSON.stringify(quoted, null, 2)

        await m.reply(`\`\`\`json\n${estructura}\n\`\`\``)
    }
}