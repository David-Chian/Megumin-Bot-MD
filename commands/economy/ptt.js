export default {
  command: ['ppt'],
  category: 'rpg',
  run: async ({client, m, text, usedPrefix, command}) => {
  if (globalThis.db.data.chats[m.chat].adminonly) return m.reply(`❒ Para acceder a los comandos de *Economía* en este grupo, es necesario desactivar el modo *solo administradores*. \n\n> Un *administrador* puede realizar este cambio utilizando el comando › *${usedPrefix}adminonly disable*`);
  if (!globalThis.db.data.chats[m.chat].rpg) return m.reply(`❒ Este grupo tiene los comandos de *Economía* en modo pausa.\n\nPero la solución está en manos de un *administrador*, que puede activarlo usando:\n› *${usedPrefix}economia enable*.`);
  let user = globalThis.db.data.chats[m.chat].users[m.sender]
  if (!user.pptCooldown) user.pptCooldown = 0;
  let remainingTime = user.pptCooldown - Date.now();

  let botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
  let botSettings = globalThis.db.data.settings[botId]

  let monedas = botSettings.currency

  if (remainingTime > 0) {
    return m.reply(`✿ Debes esperar *${msToTime(remainingTime)}* antes de jugar nuevamente.`);
  }

  const options = ['piedra', 'papel', 'tijera'];
  const userChoice = text.trim().toLowerCase();

  if (!options.includes(userChoice)) {
    return m.reply(`✿ Usa el comando de esta manera: ${usedPrefix}${command} <piedra|papel|tijera>`);
  }

  const botChoice = options[Math.floor(Math.random() * options.length)];

  const result = determineWinner(userChoice, botChoice);
  const randomReward = Math.floor(Math.random() * 3000);
  const randomExp = Math.floor(Math.random() * 1000);
  const randomLoss = Math.floor(Math.random() * 1000);
  const randomTieReward = Math.floor(Math.random() * 100);
  const randomTieExp = Math.floor(Math.random() * 100);

  if (result === '✧ ¡Ganaste!') {
    user.chocolates += randomReward;
    user.exp += randomExp;
    await client.reply(m.chat, `✧ Ganaste.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ❀ *Elección del bot ›* ${botChoice}\n> ✰ *${monedas} ›* ¥${randomReward.toLocaleString()}\n> ✱ *Exp ›* ${randomExp}\n\n${dev}`, m);
  } else if (result === '✿ Perdiste. ¡Intenta de nuevo!') {
    if (user.chocolates >= randomLoss) {
      user.chocolates -= randomLoss;
    } else if (user.bank >= randomLoss) {
      user.bank -= randomLoss;
    } else {
      const total = user.chocolates + user.bank;
      if (total >= randomLoss) {
        const remaining = randomLoss - user.chocolates;
        user.chocolates = 0;
        user.bank -= remaining;
      } else {
        randomLoss = total;
        user.chocolates = 0;
        user.bank = 0;
      }
    }
    await client.reply(m.chat, `✿ Perdiste.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ❀ *Elección del bot ›* ${botChoice}\n> ✰ *${monedas} ›* -¥${randomLoss.toLocaleString()}\n\n${dev}`, m);
  } else {
    user.chocolates += randomTieReward;
    user.exp += randomTieExp;
    await client.reply(m.chat, `❀ Empate.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ❀ *Elección del bot ›* ${botChoice}\n> ✰ *${monedas} ›* +¥${randomTieReward.toLocaleString()}\n> ✱ *Exp ›* +${randomTieExp}\n\n${dev}`, m);
  }

  user.pptCooldown = Date.now() + 10 * 60000; // 10 minutos de espera
}};

function determineWinner(userChoice, botChoice) {
  if (userChoice === botChoice) {
    return '❀ Empate.';
  }

  if (
    (userChoice === 'piedra' && botChoice === 'tijera') ||
    (userChoice === 'papel' && botChoice === 'piedra') ||
    (userChoice === 'tijera' && botChoice === 'papel')
  ) {
    return '✧ ¡Ganaste!';
  } else {
    return '✿ Perdiste. ¡Intenta de nuevo!';
  }
}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  if (minutes === '00') {
    return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }
}