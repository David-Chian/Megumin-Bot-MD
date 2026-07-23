import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.resolve(__dirname, '../../cmds');
const pluginCache = new Map();
const debounceMap = new Map();
const watchers = new Map();
global.comandos = global.comandos ?? new Map();
global.plugins = global.plugins ?? {};
global.middlewares = global.middlewares ?? { before: [], after: [] };

function registerModule(filePath, mod) {
  const key = path.relative(commandsFolder, filePath).replace(/\\/g, '/').replace('.ts', '');
  for (const [cmd, data] of global.comandos)
    if (data.pluginKey === key) global.comandos.delete(cmd);

  const cmd = mod?.default || mod;

  global.plugins[key] = {
    ...mod,
    dirname: path.dirname(filePath),
    ...(typeof cmd?.before === 'function' ? { before: cmd.before } : {}),
    ...(typeof cmd?.all   === 'function' ? { all:    cmd.all   } : {}),
    ...(typeof cmd?.after === 'function' ? { after:  cmd.after } : {}),
  };

  if (typeof cmd?.before === 'function' && !cmd?.command) {
    global.middlewares.before = global.middlewares.before.filter(
      (fn: Function) => fn !== cmd.before
    );
    global.middlewares.before.push(cmd.before);
  }
  if (typeof cmd?.after === 'function' && !cmd?.command) {
    global.middlewares.after = global.middlewares.after.filter(
      (fn: Function) => fn !== cmd.after
    );
    global.middlewares.after.push(cmd.after);
  }

  if (!cmd?.command || typeof cmd.run !== 'function') return;

  const cmds = Array.isArray(cmd.command) ? cmd.command : [cmd.command];
  for (const c of cmds) {
    if (!c) continue;
    global.comandos.set(c.toLowerCase(), {
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
}

async function importModule(filePath) {
  const mtime = fs.statSync(filePath).mtimeMs;
  const cached = pluginCache.get(filePath);
  if (cached?.mtime === mtime) return cached.mod;
  const url = `${pathToFileURL(filePath).href}?v=${mtime}`;
  const mod = await import(url);
  pluginCache.set(filePath, { mtime, mod });
  return mod;
}

async function scan(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { await scan(full); continue; }
    if (!entry.name.endsWith('.ts')) continue;
    try {
      const mod = await importModule(full);
      registerModule(full, mod);
    } catch (e) {
      console.error(chalk.red(`⚠ Error cargando ${entry.name}:`), e.message);
    }
  }
}

async function reloadFile(filePath) {
  if (!filePath.endsWith('.ts')) return;
  if (!fs.existsSync(filePath)) {
    pluginCache.delete(filePath);
    const key = path.relative(commandsFolder, filePath).replace(/\\/g, '/').replace('.ts', '');
    for (const [cmd, data] of global.comandos)
      if (data.pluginKey === key) global.comandos.delete(cmd);
    delete global.plugins[key];
    console.log(chalk.yellow(`⚠ Plugin eliminado: ${path.basename(filePath)}`));
    return;
  }
  const mtime = fs.statSync(filePath).mtimeMs;
  const cached = pluginCache.get(filePath);
  if (cached?.mtime === mtime) return;
  try {
    const mod = await importModule(filePath);
    registerModule(filePath, mod);
    console.log(chalk.green(`✓ Plugin recargado: ${path.basename(filePath)}`));
  } catch (e) {
    console.error(chalk.red(`⚠ Error recargando ${path.basename(filePath)}:`), e.message);
  }
}

global.reload = (_, filePath) => {
  if (!filePath?.endsWith('.ts')) return;
  if (debounceMap.has(filePath)) clearTimeout(debounceMap.get(filePath));
  debounceMap.set(filePath, setTimeout(() => {
    debounceMap.delete(filePath);
    reloadFile(filePath).catch(() => {});
  }, 300));
};

function watchDir(dir) {
  if (watchers.has(dir)) return;
  if (!fs.existsSync(dir)) return;
  try {
    const w = fs.watch(dir, (event, filename) => {
      if (filename?.endsWith('.ts'))
        global.reload(event, path.join(dir, filename));
    });
    w.unref();
    watchers.set(dir, w);
  } catch {}
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
    if (entry.isDirectory()) watchDir(path.join(dir, entry.name));
}

export default async function seeCommands() {
  await scan(commandsFolder);
  watchDir(commandsFolder);
 // console.log(chalk.gray(`[ ✿ ] ${global.comandos.size} comandos cargados.`));
}