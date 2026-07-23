import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import seeCommands from './core/system/commandLoader.ts';
import level from './cmds/level.ts';
import antistatus from './cmds/antistatus.ts';
import antinsfw from './cmds/antinsfw.ts';
import { before as antilink } from './cmds/antilink.ts';
import { resolveLidToRealJid, isJidAdminInGroup } from './core/utils.ts';

const groupMetaCache = new Map<string, { data: any; ts: number }>();
const lidCache       = new Map<string, { data: string; ts: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [jid, entry] of groupMetaCache)
    if (now - entry.ts > 15 * 60 * 1000) groupMetaCache.delete(jid);
  for (const [key, entry] of lidCache)
    if (now - entry.ts > 10 * 60 * 1000) lidCache.delete(key);
}, 15 * 60 * 1000);

async function getCachedGroupMeta(sock: any, jid: string) {
  if (!jid?.endsWith('@g.us')) return null;
  const now    = Date.now();
  const cached = groupMetaCache.get(jid);
  if (cached && now - cached.ts < 5 * 60 * 1000) return cached.data;
  const meta = await sock.groupMetadata(jid).catch(() => null);
  if (meta) groupMetaCache.set(jid, { data: meta, ts: now });
  return meta;
}

async function cachedResolveLid(jid: string, sock: any, chat: string) {
  if (!jid) return jid;
  const key    = `${jid}:${chat}`;
  const now    = Date.now();
  const cached = lidCache.get(key);
  if (cached && now - cached.ts < 10 * 60 * 1000) return cached.data;
  const resolved = await resolveLidToRealJid(jid, sock, chat);
  if (resolved) lidCache.set(key, { data: resolved, ts: now });
  return resolved ?? jid;
}

function normalizeToJid(phone: string | number | null | undefined): string | null {
  if (!phone) return null;
  const base = typeof phone === 'number' ? phone.toString() : phone.replace(/\D/g, '');
  return base ? `${base}@s.whatsapp.net` : null;
}

function getAllSessionBots(): string[] {
  const sessionDirs = ['./Sessions/Subs', './Sessions/Mods', './Sessions/Prems'];
  const bots: string[] = [];
  for (const dir of sessionDirs) {
    try {
      for (const sub of fs.readdirSync(path.resolve(dir))) {
        const credsPath = path.resolve(dir, sub, 'creds.json');
        if (fs.existsSync(credsPath)) bots.push(sub + '@s.whatsapp.net');
      }
    } catch {}
  }
  try {
    if (fs.existsSync(path.resolve('./Sessions/Owner/creds.json'))) {
      const ownerId = (global as any).sock?.user?.id?.split(':')[0] + '@s.whatsapp.net';
      if (ownerId) bots.push(ownerId);
    }
  } catch {}
  return bots;
}

seeCommands();

export default async (sock: any, m: any) => {
  if (!m.message) return;

  await antistatus(sock, m);
  antinsfw(sock, m);
  if (m.message.viewOnceMessageV2)
    m.message = m.message.viewOnceMessageV2.message;
  if (m.message.viewOnceMessage)
    m.message = m.message.viewOnceMessage.message;

let body: string =
  m.message.conversation ||
  m.message.extendedTextMessage?.text ||
  m.message.imageMessage?.caption ||
  m.message.videoMessage?.caption ||
  m.message.buttonsResponseMessage?.selectedButtonId ||
  m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
  m.message.templateButtonReplyMessage?.selectedId ||
  (
    m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson &&
    JSON.parse(
      m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
    ).id
  ) ||
  '';

m.text = body;

const stickerMsg = m.message?.stickerMessage;
if (stickerMsg?.fileSha256) {
  const hash = Buffer.from(stickerMsg.fileSha256).toString('base64');
const packData = getStickersPack(m.chat)
const raw = (packData as any).cmdmap
const stickerMap: Record<string, any> =
  raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}

  if (stickerMap[hash]) {
    body    = stickerMap[hash].text;
    m.text  = body;
    m.mentionedJid = stickerMap[hash].mentionedJid ?? [];
  }
}
  if (m.sender && m.chat?.endsWith('@g.us')) {
    const real = await cachedResolveLid(m.sender, sock, m.chat);
    if (real) m.sender = real;
  }
  if (m.key?.participant && m.chat?.endsWith('@g.us')) {
    const real = await cachedResolveLid(m.key.participant, sock, m.chat);
    if (real) m.key.participant = real;
  }
  if (Array.isArray(m.mentionedJid) && m.chat?.endsWith('@g.us')) {
    m.mentionedJid = await Promise.all(
      m.mentionedJid.map((jid: string) => cachedResolveLid(jid, sock, m.chat))
    );
  }
  await antilink(m, { client: sock, sock });

  const sender   = m.sender;
  const pushname = m.pushName || 'Sin nombre';
  const from     = m.key.remoteJid;
  const selfId   = sock.user.id.split(':')[0] + '@s.whatsapp.net';

const [settings, chatData, metadata] = await Promise.all([
  getSettings(selfId),
  getChat(m.chat),
  m.isGroup ? getCachedGroupMeta(sock, from) : null
]);
  const groupName    = metadata?.subject || '';
  const participants = metadata?.participants || [];

  for (const name in (global as any).plugins) {
    const plugin = (global as any).plugins[name];
    if (plugin && typeof plugin.all === 'function') {
      try {
        await plugin.all.call(sock, m, { client: sock, sock });
      } catch (err) {
        console.error(`Error en plugin.all -> ${name}`, err);
      }
    }
  }

  const rawBotname = settings.namebot2 || 'Alya';
  const tipo       = settings.type     || 'Sub';
  const cleanBot   = rawBotname.replace(/[^a-zA-Z0-9\s]/g, '') || 'Megumin';
  const shortForms = [
    cleanBot.charAt(0),
    cleanBot.split(' ')[0],
    tipo.split(' ')[0],
    cleanBot.split(' ')[0].slice(0, 2),
    cleanBot.split(' ')[0].slice(0, 3),
  ].filter(Boolean);
  const prefixes = [cleanBot, ...shortForms];

  let prefix: RegExp;
  if (Array.isArray(settings.prefijo) || typeof settings.prefijo === 'string') {
    const prefixArray = Array.isArray(settings.prefijo) ? settings.prefijo : [settings.prefijo];
    const escNames = prefixes.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^`]/g, '\\$&')).join('|');
    const escPre   = prefixArray.map((p: string) => p.replace(/[|\\{}()[\]^$+*.\-\^`]/g, '\\$&')).join('|');
    prefix = new RegExp(`^(${escNames})?(${escPre})`, 'i');
  } else if (settings.prefijo === true) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp(`^(${prefixes.map(p => p.replace(/[|\\{}()[\]^$+*.\-\^`]/g, '\\$&')).join('|')})?`, 'i');
  }

  globalThis.prefix = prefix;

  const _selfId   = sock.user.id.split(':')[0] + '@s.whatsapp.net'
  const _settings = getSettings(_selfId)
  const _chat     = getChat(m.chat)

  const _shouldRunBefore = (() => {
    if (!_settings?.self) return true
    const _ownerJids = [
      _selfId,
      ...((global as any).owner || []).map((n: string) => n + '@s.whatsapp.net'),
      ...((global as any).mods  || []).map((n: string) => n + '@s.whatsapp.net'),
    ]
    return _ownerJids.includes(m.sender)
  })()

  const _isPrimary = (() => {
    if (!_chat?.primaryBot) return true
    return _chat.primaryBot === _selfId
  })()

  if (_shouldRunBefore && _isPrimary) {
    for (const name in (global as any).plugins) {
      const plugin = (global as any).plugins[name];
      if (typeof plugin.before === 'function') {
        try {
          const stop = await plugin.before.call(sock, m, {
            client: sock,
            sock,
            args: [],
            usedPrefix: '',
            command: '',
            text: body,
          });
          if (stop) return;
        } catch (err) {
          console.error(`Error en plugin.before -> ${name}`, err);
        }
      }
    }
  }

  const strRegex  = (s: string) => s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  const pluginPfx = (sock as any).prefix ?? prefix;
  const matchs    = pluginPfx instanceof RegExp
    ? [[pluginPfx.exec(body), pluginPfx]]
    : Array.isArray(pluginPfx)
      ? (pluginPfx as any[]).map(p => {
          const rx = p instanceof RegExp ? p : new RegExp(strRegex(p));
          return [rx.exec(body), rx];
        })
      : typeof pluginPfx === 'string'
        ? [[new RegExp(strRegex(pluginPfx)).exec(body), new RegExp(strRegex(pluginPfx))]]
        : [[null, null]];

  const match = (matchs as any[]).find(p => p[0]);
  if (!match) return;

  let usedPrefix = (match[0] ?? [])[0] ?? '';
  let args       = body.slice(usedPrefix.length).trim().split(/ +/);
  let command    = (args.shift() || '').toLowerCase();
  const text     = args.join(' ');

  const ownerJids = [
    selfId,
    ...(global as any).owner.map((x: string) => x + '@s.whatsapp.net'),
  ];
  const isOwner = ownerJids.includes(sender);

  const h = chalk.bold.blue('***********************************');
  const v = chalk.bold.white('│ ');
  console.log(
    `\n${h}\n` +
    chalk.bold.yellow(`${v} Fecha: ${chalk.whiteBright(moment().format('DD/MM/YY HH:mm:ss'))}\n`) +
    chalk.bold.blueBright(`${v} Usuario: ${chalk.whiteBright(pushname)}\n`) +
    chalk.bold.magentaBright(`${v} Remitente: ${gradient('deepskyblue', 'darkorchid')(sender)}\n`) +
    (m.isGroup
      ? chalk.bold.cyanBright(`${v} Grupo: ${chalk.greenBright(groupName)}\n${v} ID: ${gradient('violet', 'midnightblue')(from)}\n`)
      : chalk.bold.greenBright(`${v} Chat privado\n`)) +
    h
  );

  const tf = await getChatUser(m.chat, m.sender);
  const to = new Date().toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');
  if (!tf.stats)     tf.stats     = {};
  if (!tf.stats[to]) tf.stats[to] = { msgs: 0, cmds: 0 };
  tf.stats[to].msgs++;
  await updateChatUser(m.chat, m.sender, 'stats', tf.stats);

  if (m.isGroup && chatData?.bannedGrupo) {
    const groupAdminsBanned = participants
      .filter((p: any) => p.admin)
      .map((p: any) => p.id);
    const resolvedAdmins = await Promise.all(
      groupAdminsBanned.map((id: string) => cachedResolveLid(id, sock, from))
    );
    const isAdminInBanned = resolvedAdmins.includes(sender);
    if (!isAdminInBanned && !isOwner) return;
  }

  const groupAdmins = participants.filter((p: any) =>
    p.admin === 'admin' || p.admin === 'superadmin'
  );

const resolvedSender = await cachedResolveLid(sender, sock, from)
const resolvedBot = await cachedResolveLid(selfId, sock, from)

const isAdmins = m.isGroup
  ? await isJidAdminInGroup(sock, from, resolvedSender || sender)
  : false

const isBotAdmins = m.isGroup
  ? await isJidAdminInGroup(sock, from, resolvedBot || selfId)
  : false

  if (chatData?.adminonly && !isAdmins) return;

const freshChat   = getChat(m.chat);
const primaryBot  = freshChat?.primaryBot ?? null;
  const hasPrefix  = settings.prefijo === true
    ? true
    : (Array.isArray(settings.prefijo)
        ? settings.prefijo
        : typeof settings.prefijo === 'string'
          ? [settings.prefijo]
          : []
      ).some((p: string) => body?.startsWith(p));

if (primaryBot && primaryBot !== selfId) {
  const primaryInSessions = getAllSessionBots().includes(primaryBot);
  const primaryInGroup = participants.some(
    (p: any) => (p.phoneNumber || p.id || p.jid) === primaryBot
  );

  if (!primaryInSessions || !primaryInGroup) {
    await updateChat(m.chat, 'primaryBot', null);
  } else {
    return;
  }
}

  if (
    m.id?.startsWith('3EB0') ||
    (m.id?.startsWith('BAE5') && m.id.length === 16) ||
    (m.id?.startsWith('B24E') && m.id.length === 20)
  ) return;

  if (settings.self) {
    const modsJids = (global as any).mods.map((n: string) => n + '@s.whatsapp.net');
    if (sender !== selfId && !isOwner && !modsJids.includes(sender)) return;
  }

  if (m.chat && !m.chat.endsWith('@g.us')) {
    const allowedInPrivate = [
      'report', 'reporte', 'sug', 'read', 'eval', 'r', 'confesar', 'responder',
      'suggest', 'invite', 'invitar', 'setname', 'setbotname', 'setbanner',
      'setmenubanner', 'setusername', 'setpfp', 'setimage', 'setbotcurrency',
      'setbotprefix', 'setstatus', 'setbotowner', 'reload', 'codemod', 'qrmod',
      'codepremium', 'qrpremium', 'setbotchannel', 'setchannel', 'setlink',
      'setbotlink', 'seticon', 's', 'suno',
    ];
    if (!isOwner && !allowedInPrivate.includes(command)) return;
  }

  (global as any).dfail = (type: string, msg: any) => {
    const messages: Record<string, string> = {
      owner:      `ꕥ El comando *${command}* solo puede ser ejecutado por mi Creador.`,
      moderation: `ꕥ El comando *${command}* solo puede ser ejecutado por los moderadores.`,
      admin:      `ꕥ El comando *${command}* solo puede ser ejecutado por los Administradores del Grupo.`,
      botAdmin:   `ꕥ El comando *${command}* solo puede ser ejecutado si el Bot es Administrador del Grupo.`,
    };
    const text = messages[type];
    if (text) return sock.reply(msg.chat, `${text}`,m,m.rcanal);
  };

  const modsJids     = (global as any).mods.map((n: string | number) => normalizeToJid(n));
  const isModeration = modsJids.includes(resolvedSender);

  const cmdData = (global as any).comandos.get(command);

  if (!cmdData) {
    if (settings.prefijo === 1) return;
    sock.readMessages([m.key]).catch(() => {});
    return sock.reply(m.chat, `ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`,m,m.rcanal);
  }

  if (cmdData.isOwner      && !isOwner)      return (global as any).dfail('owner',      m);
  if (cmdData.isModeration && !isModeration) return (global as any).dfail('moderation', m);
  if (cmdData.isAdmin      && !isAdmins)     return (global as any).dfail('admin',      m);
  if (cmdData.botAdmin && !isBotAdmins) {
  const freshIsBotAdmin = m.isGroup
    ? await isJidAdminInGroup(sock, from, selfId, true)
    : false

  if (!freshIsBotAdmin) {
    return (global as any).dfail('botAdmin', m)
  }
}

  if (typeof cmdData.before === 'function') {
    try {
      const stop = await cmdData.before.call(sock, m, {
        client: sock, sock, command, args, text, usedPrefix,
      });
      if (stop) return;
    } catch (err) {
      console.error(`Error en BEFORE del comando ${command}:`, err);
    }
  }

if (command) sock.sendPresenceUpdate('composing', m.chat).catch(() => {});

const FALLBACK_IMG = 'https://files.catbox.moe/fov7g3.jpg';

const originalSendMessage = sock.sendMessage.bind(sock);
sock.sendMessage = async (jid: string, content: any, opts?: any) => {
  const mediaFields = ['image', 'video', 'audio', 'document', 'sticker'] as const;
  const mediaField  = mediaFields.find(f => f in content);

  if (!mediaField) return originalSendMessage(jid, content, opts);

  try {
    return await originalSendMessage(jid, content, opts);
  } catch (err: any) {
    const msg = err?.message || '';
    if (!msg.includes('Invalid mediaType') && !msg.includes('invalid media')) throw err;

    const caption = content.caption || content.text || '';
    return originalSendMessage(
      jid,
      { image: { url: FALLBACK_IMG }, caption: caption ? `${caption}\n\n_⚠ Vista previa no disponible_` : '⚠ Vista previa no disponible' },
      opts
    );
  }
};

  try {
    sock.readMessages([m.key]).catch(() => {});

    const user2 = await getUser(m.sender);
    user2.name         = (pushname || 'Sin nombre').trim();
    user2.usedcommands = (user2.usedcommands || 0) + 1;
    user2.exp          = (user2.exp || 0) + Math.floor(Math.random() * 100);
    user2.lastCommand  = command;
    user2.lastSeen     = new Date();

    settings.commandsejecut = (settings.commandsejecut || 0) + 1;

    const today = new Date().toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).split('/').reverse().join('-');
    if (!tf.stats)        tf.stats        = {};
    if (!tf.stats[today]) tf.stats[today] = { msgs: 0, cmds: 0 };
    tf.stats[today].cmds++;
    tf.usedTime = new Date();

Promise.all([
  updateUser(m.sender, 'exp', user2.exp),
  updateUser(m.sender, 'name', user2.name),
  updateUser(m.sender, 'usedcommands', user2.usedcommands),
  updateUser(m.sender, 'lastCommand',  command),
  updateSettings(selfId, 'commandsejecut', settings.commandsejecut),
  updateChatUser(m.chat, m.sender, 'stats',    tf.stats),
  updateChatUser(m.chat, m.sender, 'usedTime', tf.usedTime),
]).catch(() => {});

const isLegacyRun = cmdData.run.length <= 1;
if (isLegacyRun) {
  await cmdData.run({ client: sock, sock, m, args, command, text, usedPrefix, prefix: usedPrefix });
} else {
  await cmdData.run({ sock, m, args, command, text, usedPrefix });
}

  } catch (err: any) {
    m.reply('❌ Error al ejecutar el comando:\n' + (err.message || err));
    console.error('Error ejecutando comando:', err);
  }

  for (const name in (global as any).plugins) {
    const plugin = (global as any).plugins[name];
    if (typeof plugin.after === 'function') {
      try {
        await plugin.after.call(sock, m, {
          client: sock, sock, usedPrefix, command, args, text,
        });
      } catch (err) {
        console.error(`Error en plugin.after -> ${name}`, err);
      }
    }
  }

  if (typeof cmdData.after === 'function') {
    try {
      await cmdData.after.call(sock, m, {
        client: sock, sock, command, args, text, usedPrefix,
      });
    } catch (err) {
      console.error(`Error en AFTER del comando ${command}:`, err);
    }
  }

  level(m);
};