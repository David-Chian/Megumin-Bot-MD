import { promises as fs } from 'fs';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  let result = '';
  if (days > 0) result += `${days} d `;
  if (hours > 0) result += `${hours} h `;
  if (minutes > 0) result += `${minutes} m `;
  if (seconds > 0 || result === '') result += `${seconds} s`;
  return result.trim();
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim();
  return (
    characters.find(c => c.name.toLowerCase() === name) ||
    characters.find(c => c.name.toLowerCase().includes(name)) ||
    characters.find(c => name.includes(c.name.toLowerCase()))
  );
}

export default {
  command: ['winfo', 'charinfo', 'cinfo'],
  category: 'gacha',
  use: '<nombre del personaje>',
  run: async ({sock, m, args}) => {
    const chatId = m.chat;
    const chatData = await getChat(chatId);
    
    if (chatData.adminonly || !chatData.gacha)
      return sock.reply(m.chat,`${mess.comandooff}`,m,m.rcanal);

    const characterName = args.join(' ').toLowerCase().trim();
    if (!characterName)
      return sock.reply(m.chat,`《✤》 Por favor, proporciona el nombre de un personaje.`,m,m.rcanal);

    const characters = await loadCharacters();
    const character = findSimilarCharacter(characterName, characters);
    if (!character)
      return sock.reply(m.chat,`✿ No se ha encontrado el personaje *${characterName}*, ni uno similar.`,m,m.rcanal);

    const sortedByValue = [...characters].sort((a, b) => (b.value || 0) - (a.value || 0));
    const rank = sortedByValue.findIndex(c => c.name.toLowerCase() === character.name.toLowerCase()) + 1;
    const lastVoteTime = character.lastVoteTime || null;
    const timeAgo = lastVoteTime ? 'hace ' + msToTime(Date.now() - lastVoteTime) : 'Aún no ha sido votado.';

    const reservado = chatData.personajesReservados?.find(p => p.name === character.name);
    
    let usuarioPoseedor = null;
    let characterInstance = null;
    
    const chatUsers = await getChatUser(chatId);
    
    for (const user of chatUsers) {
      if (user.characters && Array.isArray(user.characters)) {
        const foundChar = user.characters.find(c => c.name?.toLowerCase() === character.name.toLowerCase());
        if (foundChar) {
          usuarioPoseedor = user.user_id;
          characterInstance = foundChar;
          break;
        }
      }
    }

    let ownerName = 'Usuario desconocido';
    if (usuarioPoseedor) {
      const userData = await getUser(usuarioPoseedor);
      ownerName = userData.name || usuarioPoseedor.split('@')[0];
    }

    const claimStatus = characterInstance?.claim || 'Desconocido';

    let estado = '*Libre*';
    if (usuarioPoseedor) {
      estado = `*Reclamado por ${ownerName}*\n𖹭  ׄ  ְ ✿ Fecha de reclamo › *${claimStatus}*`;
    } else if (reservado) {
      let reservadoName = 'Usuario desconocido';
      const reservadoUser = await getUser(reservado.userId);
      reservadoName = reservadoUser.name || reservado.userId.split('@')[0];
      estado = `*Reservado por ${reservadoName}*`;
    }

    const message = `𖹭  ׄ  ְ ❒ Nombre › *${character.name}*

𖹭  ׄ  ְ ⚥ Género › *${character.gender || 'Desconocido'}*
𖹭  ׄ  ְ ⛀ Valor › *${character.value?.toLocaleString() || '0'}*
𖹭  ׄ  ְ ꕤ Estado › ${estado}
𖹭  ׄ  ְ ✤ Votos › *${character.votes || 0}*
𖹭  ׄ  ְ ✰ Fuente › *${character.source || 'Desconocida'}*
𖹭  ׄ  ְ ✧ Puesto › *#${rank}*
𖹭  ׄ  ְ ★ Último voto › *${timeAgo}*`;

    await sock.reply(m.chat,`${message}`,m,m.rcanal);
  }
};
