import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const msToTime = (duration: number): string => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const s = seconds.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return m === '00'
    ? `${s} segundo${seconds !== 1 ? 's' : ''}`
    : `${m} minuto${minutes !== 1 ? 's' : ''}, ${s} segundo${seconds !== 1 ? 's' : ''}`;
};

const obtenerPersonajes = () => {
  try {
    return JSON.parse(fs.readFileSync('./core/characters.json', 'utf-8'));
  } catch (e) {
    console.error('[Error] characters.json:', e);
    return [];
  }
};

const PRECIO_BASE = 1000;
const AUMENTO_POR_USO = 50;
const COOLDOWN_TIME = 15 * 60 * 1000;
const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export default {
  command: ['lumbox', 'luckbox', 'abrir'],
  category: 'economy',

  run: async ({ sock, m }) => {
    const chatId = m.chat;
    const userId = m.sender;
    const chat = await getChat(chatId);
    const chatUser = await getChatUser(chatId, userId);
    const settings = await getSettings(sock.user.id.split(':')[0] + '@s.whatsapp.net');
    const currency = settings?.currency || 'Diamantes 💎';
    const now = Date.now();

    if (chat.adminonly || !chat.rpg)
      return m.reply('✎ Estos comandos están desactivados en este grupo.');

    const lastLumbox: number = chatUser.lastLumbox || 0;
    const tiempoRestante = lastLumbox + COOLDOWN_TIME - now;
    if (tiempoRestante > 0)
      return m.reply(`⏳ Espera *${msToTime(tiempoRestante)}* para abrir otra Lum Box.`);

    let lumboxData = chatUser.lumboxData
      ? (typeof chatUser.lumboxData === 'string'
          ? JSON.parse(chatUser.lumboxData)
          : chatUser.lumboxData)
      : { usos: 0, lastReset: now };

    if (now - lumboxData.lastReset >= SEMANA_MS) {
      lumboxData = { usos: 0, lastReset: now };
    }

    const precioActual = PRECIO_BASE + lumboxData.usos * AUMENTO_POR_USO;

    if ((chatUser.coins || 0) < precioActual)
      return m.reply(`✘ No tienes suficientes *${currency}*. Necesitas *${precioActual}*.`);

    await updateChatUser(chatId, userId, 'coins', chatUser.coins - precioActual);
    lumboxData.usos += 1;
    await updateChatUser(chatId, userId, 'lumboxData', lumboxData);
    await updateChatUser(chatId, userId, 'lastLumbox', now);

    await m.reply(
      `🎁 Abriendo Lum Box...\n💸 Gastaste *${precioActual}* ${currency}\n⏳ Espera un momento...`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const chance = Math.random() * 100;

    if (chance < 20) {
      return m.reply(`💀 ¡Mala suerte! La Lum Box estaba vacía. Perdiste *${precioActual}* ${currency}.`);
    }

    if (chance < 40) {
      const recuperado = Math.floor(precioActual * 0.3);
      await updateChatUser(chatId, userId, 'coins', chatUser.coins - precioActual + recuperado);
      return m.reply(`📦 Recompensa pobre... Solo recuperaste *${recuperado}* ${currency}.`);
    }

    if (chance < 60) {
      const expGanada = Math.floor(Math.random() * 400) + 100;
      const user = await getUser(userId);
      await updateUser(userId, 'exp', (user.exp || 0) + expGanada);
      return m.reply(`✨ ¡Ganaste *${expGanada} XP*!`);
    }

    if (chance < 80) {
      const premio = Math.floor(precioActual * (1.2 + Math.random()));
      await updateChatUser(chatId, userId, 'coins', chatUser.coins - precioActual + premio);
      return m.reply(`✨ ¡JACKPOT! Has ganado *${premio.toLocaleString()}* ${currency}.`);
    }

    const personajes = obtenerPersonajes();
    if (!personajes.length) return m.reply('⚠️ No hay personajes disponibles.');

    const personaje = personajes[Math.floor(Math.random() * personajes.length)];

    const todosEnChat = getChatUser(chatId) as any[];
    const poseedor = todosEnChat.find(
      (u) =>
        Array.isArray(u.characters) &&
        u.characters.some((c: any) => c.name === personaje.name)
    );

    let estado: string;
    let mensajeFinal: string;
    let mentionedJid: string[] = [];

    if (poseedor) {
      const ownerData = getUser(poseedor.user_id);
      const ownerName = ownerData?.name || poseedor.user_id.split('@')[0];
      estado = `𝐑ᥱᥴᥣᥲmᥲძ᥆ ⍴᥆r *${ownerName}*`;
      mentionedJid = [poseedor.user_id];
      mensajeFinal = `\n\n❌ ¡Qué mala suerte! Salió un personaje que ya tiene dueño. No puedes quedártelo.`;
    } else {
      estado = '𝐋іᑲrᥱ';
      mensajeFinal = `\n\n🌟 ¡Felicidades! Obtienes un nuevo personaje libre.`;

      const characters = Array.isArray(chatUser.characters) ? chatUser.characters : [];
      characters.push({
        id: uuidv4().slice(0, 8),
        name: personaje.name,
        gender: personaje.gender,
        source: personaje.source,
        value: personaje.value,
        url: personaje.url,
        claim: new Date().toLocaleString(),
      });
      await updateChatUser(chatId, userId, 'characters', characters);
    }

    const caption = `🎁 *LUM BOX: PERSONAJE*
        
❀ 𝐍᥆mᑲrᥱ » *${personaje.name}*
⚥ 𝐆ᥱᥒᥱr᥆ » *${personaje.gender}*
● 𝐏rᥱᥴі᥆ » *${personaje.value}*
✤ 𝐅ᥙᥱᥒ𝗍ᥱ » *${personaje.source}*
❒ 𝐄s𝗍ᥲძ᥆ » *${estado}*
✮ 𝐆ᥲs𝗍ᥲs𝗍ᥱ » *${precioActual}* ${currency}${mensajeFinal}`;

    await sock.sendMessage(
      chatId,
      {
        image: { url: personaje.url },
        caption,
        mimetype: 'image/jpeg',
        mentionedJid,
      },
      { quoted: m }
    );
  },
};