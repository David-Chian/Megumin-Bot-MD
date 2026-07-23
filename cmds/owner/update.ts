import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { exec, execSync } from 'child_process';
import crypto from 'crypto';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IGNORED = [
  'node_modules/', 'Sessions/', '.cache/',
  '.npm/', 'tmp/', '.db', '.db-shm', '.db-wal',
  '.tar.gz', 'package-lock.json',
];

const CORE_PATTERNS = ['handler.ts', 'index.ts', 'settings.ts', 'core/'];

function isCoreFile(file: string) {
  return CORE_PATTERNS.some(p => file.includes(p));
}

const KEYWORDS = new Set([
  'break','case','catch','class','const','continue','debugger','default','delete',
  'do','else','export','extends','false','finally','for','function','if','import',
  'in','instanceof','let','new','null','return','super','switch','this','throw',
  'true','try','typeof','var','void','while','with','yield','async','await','static',
]);

const METHOD_NAMES = new Set([
  'log','parse','stringify','from','toString','readFileSync','existsSync','statSync',
  'resolve','join','randomUUID','randomBytes','startsWith','replace','trim','isFile',
  'relayMessage','sendMessage',
]);

function tokenize(src: string) {
  const tokens: { content: string; type: string }[] = [];
  let i = 0;
  const push = (content: string, type = 'DEFAULT') => { if (content) tokens.push({ content, type }); };

  while (i < src.length) {
    const ch = src[i], rest = src.slice(i);
    if (rest.startsWith('//')) { let j = i + 2; while (j < src.length && src[j] !== '\n') j++; push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
    if (rest.startsWith('/*')) { let j = i + 2; while (j < src.length - 1 && !(src[j] === '*' && src[j + 1] === '/')) j++; j = Math.min(j + 2, src.length); push(src.slice(i, j), 'DEFAULT'); i = j; continue; }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch; let j = i + 1, esc = false;
      while (j < src.length) { const c = src[j]; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === quote) { j++; break; } j++; }
      push(src.slice(i, j), 'STR'); i = j; continue;
    }
    if (/[0-9]/.test(ch)) { let j = i + 1; while (j < src.length && /[0-9._]/.test(src[j])) j++; push(src.slice(i, j), 'NUMBER'); i = j; continue; }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j), next = src[j] || '', prev = src[i - 1] || '';
      if (KEYWORDS.has(word)) push(word, 'KEYWORD');
      else if ((METHOD_NAMES.has(word) || next === '(') && prev === '.') push(word, 'METHOD');
      else if (METHOD_NAMES.has(word) && next === '(') push(word, 'METHOD');
      else push(word, 'DEFAULT');
      i = j; continue;
    }
    push(ch, 'DEFAULT'); i++;
  }

  const merged: { content: string; type: string }[] = [];
  for (const t of tokens) {
    const last = merged[merged.length - 1];
    if (last?.type === 'DEFAULT' && t.type === 'DEFAULT') last.content += t.content;
    else merged.push({ ...t });
  }
  return merged;
}

async function sendCodeMessage(sock: any, jid: string, filename: string, codeOrTokens: any, quoted: any) {
  const codeBlocks = Array.isArray(codeOrTokens) ? codeOrTokens : tokenize(String(codeOrTokens));
  const payload = {
    response_id: crypto.randomUUID(),
    sections: [
      {
        view_model: {
          primitive: { text: filename, __typename: 'GenAIMarkdownTextUXPrimitive' },
          __typename: 'GenAISingleLayoutViewModel',
        },
      },
      {
        view_model: {
          primitive: { language: 'javascript', code_blocks: codeBlocks, __typename: 'GenAICodeUXPrimitive' },
          __typename: 'GenAISingleLayoutViewModel',
        },
      },
    ],
  };
  const content = {
    messageContextInfo: {
      threadId: [],
      deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [], recipientKeyHash: '', recipientTimestamp: Math.floor(Date.now() / 1000) },
      deviceListMetadataVersion: 2,
      messageSecret: crypto.randomBytes(32).toString('base64'),
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [],
          messageType: 1,
          unifiedResponse: { data: Buffer.from(JSON.stringify(payload), 'utf8').toString('base64') },
          contextInfo: {
            mentionedJid: [], groupMentions: [], statusAttributions: [],
            forwardingScore: 2, isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '259786046210223@bot' },
            forwardOrigin: 4, botMessageSharingInfo: { botEntryPointOrigin: 1, forwardScore: 2 },
          },
        },
      },
    },
  };
  return sock.relayMessage(jid, content, { quoted });
}

async function sendErrors(sock: any, jid: string, errors: { file: string; error: any }[], quoted: any) {
  let errorText = `// ❌ ERRORES AL RECARGAR PLUGINS\n\n`;
  for (const { file, error } of errors) {
    errorText += `// ── ${file} ──\n`;
    errorText += `/*\n${error.stack || error.message || String(error)}\n*/\n\n`;
  }
  const redTokens = tokenize(errorText).map(t => ({
    content: t.content,
    type: t.content.trim() === '' || t.content === '\n' ? 'DEFAULT' : 'KEYWORD',
  }));
  await sendCodeMessage(sock, jid, 'plugin_errors.log', redTokens, quoted);
}

async function reloadCommands(dir: string) {
  const errors: { file: string; error: any }[] = [];

  (global as any).comandos    = new Map();
  (global as any).plugins     = {};
  (global as any).middlewares = { before: [], after: [] };

  const pluginCache = new Map<string, { mtime: number; mod: any }>();

  async function readDir(folder: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(folder, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) { await readDir(full); continue; }
      if (!entry.name.endsWith('.ts')) continue;

      try {
        const mtime = fs.statSync(full).mtimeMs;
        const url = `${pathToFileURL(full).href}?v=${mtime}`;
        const mod = await import(url);
        const cmd = mod?.default;
        const key = path.relative(dir, full).replace(/\\/g, '/').replace('.ts', '');

        (global as any).plugins[key] = {
          ...mod,
          dirname: path.dirname(full),
          ...(typeof cmd?.before === 'function' ? { before: cmd.before } : {}),
          ...(typeof cmd?.all    === 'function' ? { all:    cmd.all    } : {}),
          ...(typeof cmd?.after  === 'function' ? { after:  cmd.after  } : {}),
        };

        // Registrar before/after como middleware global si no tiene comando propio
        if (typeof cmd?.before === 'function' && !cmd?.command) {
          (global as any).middlewares.before = (global as any).middlewares.before.filter(
            (fn: Function) => fn !== cmd.before
          );
          (global as any).middlewares.before.push(cmd.before);
        }
        if (typeof cmd?.after === 'function' && !cmd?.command) {
          (global as any).middlewares.after = (global as any).middlewares.after.filter(
            (fn: Function) => fn !== cmd.after
          );
          (global as any).middlewares.after.push(cmd.after);
        }

        if (!cmd?.command || typeof cmd.run !== 'function') continue;

        const cmds = Array.isArray(cmd.command) ? cmd.command : [cmd.command];
        for (const c of cmds) {
          if (!c) continue;
          (global as any).comandos.set(c.toLowerCase(), {
            pluginKey: key,
            run: cmd.run,
            category:     cmd.category     ?? 'general',
            description:  cmd.description  ?? '',
            isOwner:      cmd.isOwner      ?? false,
            isModeration: cmd.isModeration ?? false,
            isGroup:      cmd.isGroup      ?? false,
            isAdmin:      cmd.isAdmin      ?? false,
            botAdmin:     cmd.botAdmin     ?? false,
          });
        }
      } catch (e: any) {
        errors.push({ file: entry.name, error: e });
        console.error(chalk.red(`❌ Error cargando ${entry.name}:`), e.message);
      }
    }
  }

  await readDir(dir);
  return errors;
}

export default {
  command: ['fix', 'update'],
  isOwner: true,

  run: async ({ sock, m }: any) => {
    const jid = m.key.remoteJid;
    const commandsDir = path.join(__dirname, '..');

    await sock.sendMessage(jid, { text: '🔄 Actualizando...' }, { quoted: m });

    exec('git pull', async (error: any, stdout: string) => {
      if (error) {
        return sock.sendMessage(jid, { text: `❌ Error en git pull:\n\n${error.message}` }, { quoted: m });
      }

      const alreadyUpToDate = stdout.includes('Already up to date');

      let coreChanges: string[] = [];
      try {
        const diff = execSync('git diff HEAD~1 HEAD --name-only 2>/dev/null || echo ""', { encoding: 'utf8' });
        coreChanges = diff.trim().split('\n').filter(f =>
          f && !IGNORED.some(i => f.includes(i)) && isCoreFile(f)
        );
      } catch (_) {}

      const errors = await reloadCommands(commandsDir);

      let msg = alreadyUpToDate
        ? `ꕥ *Estado:* Todo está actualizado\n\n`
        : `✅ *Repositorio actualizado*\n\n${stdout.trim()}\n\n`;

      msg += `📦 *Comandos cargados:* ${(global as any).comandos.size}\n`;
      msg += `🧩 *Plugins cargados:* ${Object.keys((global as any).plugins).length}`;

      if (errors.length > 0) msg += `\n⚠️ *${errors.length} plugin(s) con error*`;

      if (coreChanges.length > 0) {
        msg += `\n\n🔔 *Archivos actualizados:*\n`;
        msg += coreChanges.map(f => `• ${f}`).join('\n');
      }

      await sock.sendMessage(jid, { text: msg }, { quoted: m });

      if (errors.length > 0) await sendErrors(sock, jid, errors, m);
    });
  },
};