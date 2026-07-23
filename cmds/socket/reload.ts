import { startSubBot } from '../../cmds/socket/subbot.ts';
import fs from 'fs';
import path from 'path';
import {jidDecode} from '@whiskeysockets/baileys';

export default {
  command: ['reload'],
  category: 'socket',
  run: async ({sock, m, args}) => {
    const rawId = sock.user?.id || ''
    const decoded = jidDecode(rawId)
    const cleanId = decoded?.user || rawId.split('@')[0]

    const sessionTypes = ['Subs']
    const basePath = 'Sessions'
    const sessionPath = sessionTypes
      .map((type) => path.join(basePath, type, cleanId))
      .find((p) => fs.existsSync(p))

    if (!sessionPath) {
      return m.reply('《✧》 Este comando solo puede ser usado desde una instancia de Sub-Bot.')
    }

    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = await getSettings(botId) || {}

    const isOficialBot = botId === global.sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const botType = isOficialBot
      ? 'Principal/Owner'
          : 'Sub Bot'

    const caption = `✤ *Sesión del bot reiniciada correctamente!*.`

    const phone = args[0] ? args[0].replace(/\D/g, '') : m.sender.split('@')[0]
    const chatId = m.chat

   // setTimeout(() => {
      if (botType === 'Sub Bot') {
        startSubBot(m, sock, caption, false, phone, chatId, {}, true)
      } else {
       // startModBot(m, sock, caption, false, phone, chatId, {}, true)
      }
   // }, 3000)

    await sock.reply(m.chat, caption, m)
  },
};
