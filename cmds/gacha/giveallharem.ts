import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['giveallharem'],
  category: 'gacha',
  run: async ({sock, m, args}) => {
    const chatId = m.chat
    const senderId = m.sender
    
    const chatConfig = await getChat(chatId)
    
    if (chatConfig.adminonly || !chatConfig.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal)

    const texto = m.mentionedJid
    const who2 = texto.length > 0 ? texto[0] : m.quoted ? m.quoted.sender : false
    const mentionedJid = await resolveLidToRealJid(who2, sock, m.chat)

    if (!who2 || mentionedJid === senderId)
      return sock.reply(m.chat,'《✤》 Menciona al usuario al que deseas regalar todos tus personajes.',m,m.rcanal)

    const fromUser = await getChatUser(chatId, senderId)

    if (!fromUser?.characters?.length)
      return sock.reply(m.chat,'✧ No tienes personajes en tu inventario.',m,m.rcanal)

    let toUser = await getChatUser(chatId, mentionedJid)
    
    if (!toUser) {
      toUser = await getChatUser(chatId, mentionedJid)
    }

    const charactersToTransfer = [...fromUser.characters]
    
    for (const char of charactersToTransfer) {
      if (!toUser.characters) toUser.characters = []
      toUser.characters.push(char)
    }

    await updateChatUser(chatId, mentionedJid, 'characters', toUser.characters)

    fromUser.characters = []
    await updateChatUser(chatId, senderId, 'characters', fromUser.characters)

    const globalReceiver = await getUser(mentionedJid)
    const nameReceiver = globalReceiver?.name || mentionedJid.split('@')[0]
    
    const message = `✐ Regalaste todos tus personajes al usuario *${nameReceiver}*.`

    await sock.reply(m.chat,`${message}`,m,m.rcanal)
  },
}
