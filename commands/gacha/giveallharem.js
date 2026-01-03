import { resolveLidToRealJid } from "../../lib/utils.js"

export default {
  command: ['giveallharem'],
  category: 'gacha',
  run: async ({client, m, args}) => {
    const db = global.db.data
    const chatId = m.chat
    const senderId = m.sender
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ Estos comandos estan desactivados en este grupo.`)

    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : false
    const mentionedJid = await resolveLidToRealJid(who2, client, m.chat);

    if (!who2 || mentionedJid === senderId)
      return m.reply('✎ Menciona al usuario al que deseas regalar todos tus personajes.')

    if (!chatData.users?.[senderId]?.characters?.length)
      return m.reply('《✧》 No tienes personajes en tu inventario.')

   const user2 = global.db.data.chats[m.chat].users[mentionedJid]

    if (!user2) {
      return m.reply('《✧》 El usuario *mencionado* no está *registrado* en el bot')
    }

    chatData.users[mentionedJid] = {
      characters: [],
      characterCount: 0,
      totalRwcoins: 0,
    }

    const fromUser = chatData.users[senderId]
    const toUser = chatData.users[mentionedJid]

    fromUser.characters.forEach((c) => {
      toUser.characters.push(c)
      toUser.characterCount++
      toUser.totalRwcoins += c.value || 0
    })

    fromUser.characters = []
    fromUser.characterCount = 0
    fromUser.totalRwcoins = 0

    const nameReceiver = db.users[mentionedJid]?.name || mentionedJid.split('@')[0]
    const message = `✎ Regalaste todos tus personajes al usuario *${nameReceiver}*.`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  },
};
