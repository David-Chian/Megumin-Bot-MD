import didyoumean from 'didyoumean'
import similarity from 'similarity'

export async function before(m, { conn }) {
    if (!m.text || !global.prefix.test(m.text)) return

    const usedPrefix = global.prefix.exec(m.text)[0];
    const noPrefix = m.text.slice(usedPrefix.length).trim()
    const args = noPrefix.split(' ').slice(1)
    const command = noPrefix.split(' ')[0].toLowerCase()

    const help = Object.values(global.plugins).filter(v => v.command && !v.disabled)
        .map(v => Array.isArray(v.command) ? v.command : [v.command])
        .flat()

    if (help.includes(command)) return

    const mean = didyoumean(command, help)
    const sim = similarity(command, mean)
    const som = sim * 100;
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    const name = await conn.getName(who);
    const caption = `*🍧  Hola* @${who.split('@')[0]}\nEl comando no existe, pero se encontraron resultados similares\n✔️ *${usedPrefix + mean}*\n❗ *Similitud:* _${parseInt(som)}%_`

    if (mean && sim >= 0.5) {
        conn.reply(m.chat, caption, m, { mentions: [who] }, m, rcanal);
    } else {
        await m.reply(`⚡︎ El comando "${usedPrefix + command}" no es válido.\nUsa "!menu" para ver los comandos disponibles.`, m, rcanal);
    }
}