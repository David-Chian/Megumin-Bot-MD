export default {
  command: ['setbye'],
  category: 'grupo',
  isAdmin: true,
  run: async ({sock, m, args, command, text, prefix}) => {
    const chatId = m.chat;
    const chat = await getChat(m.chat)

    if (!args.length) {
      return m.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ Set Bye ࣭𑁯ᰍ   ̊ ܃܃

*❒ Variables disponibles:*
𖣣ֶㅤ֯⌗ ✤ ⬭ @user    
> → Mención del usuario que sale

𖣣ֶㅤ֯⌗ ✤ ⬭ @group   
> → Nombre del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @desc    
> → Descripción del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @members 
> → Número de miembros actuales

𖣣ֶㅤ֯⌗ ✤ ⬭ @time    
> → Fecha y hora

✿ Si ya tienes un mensaje configurado y quieres borrarlo:
${prefix + command} 0`);
    }

    if (args[0] === '0') {
      if (!chat.byeMessage || chat.byeMessage.trim() === '') {
        return m.reply('✎ No tienes ningún mensaje de despedida definido.');
      }
      chat.byeMessage = '';

   await updateChat(m.chat, 'byeMessage', chat.byeMessage)
      return m.reply('✐ Mensaje de despedida eliminado.');
    }

    if (chat.byeMessage && chat.byeMessage.trim() !== '') {
      return m.reply(`✎ Ya tienes un mensaje de despedida configurado:\n\n${chat.byeMessage}\n\nSi quieres reemplazarlo, primero bórralo con:\n${prefix + command} 0`);
    }

    const texto = args.join(' ');
    chat.byeMessage = texto;

   await updateChat(m.chat, 'byeMessage', chat.byeMessage)

    m.reply(`《✎》 Nuevo mensaje de despedida configurado correctamente.`);
  }
};
