/*
handler.command = /^(test7)$/i;

handler = async (m, { conn }) => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const sendTypingMessage = async (text, chatId) => {
        let typingMessage = '';
        for (let i = 0; i < text.length; i++) {
            typingMessage += text[i];
            await conn.sendMessage(chatId, { text: typingMessage }, { quoted: m });
            await delay(50); 
        }
    };

    
    const mensaje = 'Este es un mensaje que aparecerá como si estuviera siendo escrito.';

    
    await sendTypingMessage(mensaje, m.chat);
};

export default handler;
*/