import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';
import schedule from 'node-schedule';

const dbPath = path.join(process.cwd(), 'core', 'database.db');
const db = new Database(dbPath, { fileMustExist: false, timeout: 10000 });

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

const stmtCache = new Map<string, any>();
function stmt(sql: string) {
  let s = stmtCache.get(sql);
  if (!s) {
    s = db.prepare(sql);
    stmtCache.set(sql, s);
  }
  return s;
}
const memCache = new Map();
const USER_CACHE_TTL = 600000;
const CHAT_CACHE_TTL = 8000;
const CHATUSER_CACHE_TTL = 8000;
const CHATUSERS_LIST_CACHE_TTL = 5000;
const SET_CACHE_TTL = 300000;
const STICKERPACK_CACHE_TTL = 600000;

const CACHE_TTLS: Record<string, number> = {
  user: USER_CACHE_TTL,
  chat: CHAT_CACHE_TTL,
  chatuser: CHATUSER_CACHE_TTL,
  chatuserslist: CHATUSERS_LIST_CACHE_TTL,
  set: SET_CACHE_TTL,
  stickerpack: STICKERPACK_CACHE_TTL,
};

const isNumber = (value) => typeof value === 'number' && !isNaN(value);

export const defUser = {
  name: '',
  exp: 0,
  sugCooldown: 0,
  level: 0,
  Subs: 0,
  usedcommands: 0,
  pasatiempo: '',
  description: '',
  marry: '',
  genre: '',
  birth: '',
  metadatos: null,
  metadatos2: null,
  lastCommand: '',
};

export const defChat = {
  bannedGrupo: 0,
  welcomeMessage: '',
  byeMessage: '',
  welcome: 0,
  goodbye: 0,
  antinsfw: 0,
  nsfw: 0,
  alerts: 0,
  gacha: 1,
  rpg: 1,
  adminonly: 0,
  expulsar: 0,
  warnLimit: 0,
  primaryBot: null,
  antilinks: 1,
  antistatus: 0,
  personajesReservados: '[]',
  intercambios: '[]',
  timeTrade: 0,
  scheduledActions: '[]',
  marriages: '{}',
  groupOpenStatus: 0,
  impuestosActivos: 0,
  impuestos: '{}',
};

export const defChatUser = {
  coins: 0,
  bank: 0,
  lastdungeon: 0,
  lasthunt: 0,
  lastfish: 0,
  lastslot: 0,
  lastplant: 0,
  dailyStreak: 0,
  characters: '[]',
  personajesEnVenta: '[]',
  crimeCooldown: 0,
  mineCooldown: 0,
  ritualCooldown: 0,
  workCooldown: 0,
  rtCooldown: 0,
  slutCooldown: 0,
  roboCooldown: 0,
  pptCooldown: 0,
  lastDaily: 0,
  voteCooldown: 0,
  simonCooldown: 0,
  rwCooldown: 0,
  buyCooldown: 0,
  stats: '{}',
  usedTime: null,
  warnings: '[]',
  tttCooldown: 0,
  plinkoCooldown: 0,
  lastWeekly: 0,
  holCooldown: 0,
  coinfCooldown: 0,
  dueloCooldown: 0,
  lastMonthly: 0,
  memoryCooldown: 0,
  robopCooldown: 0,
  aventuraCooldown: 0,
  lumboxData: '{"usos":0,"lastReset":0}',
  lastLumbox:0,
  c4Cooldown: 0,
  ahorcadoCooldown: 0,
  mineweperCooldown: 0,
};

export const defSets = {
  self: 0,
  prefijo: '["/","#","."]',
  commandsejecut: 0,
  type: 'Sub',
  link: 'https://diamondbots.xyz/register',
  banner: 'https://cdn.sockywa.xyz/files/mNT8.jpeg',
  icon: 'https://cdn.sockywa.xyz/files/MtLn.jpeg',
  currency: 'Monedas 🪙',
  namebot: 'ৎ୭࠭͢𝑴𝒆̤𝒈𝒖̣֟፝֯𝒎̤𝒊̣𝒏🔥̤ʙⷪᴏ͓ᷫᴛⷭ𓆪͟͞ ',
  namebot2: '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐',
  owner: '5351524614'
};

export const defStickerPack = {
  packs: '[]',
  cmdmap: '{}',
};

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
      exp INTEGER DEFAULT 0,
      sugCooldown INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      Subs INTEGER DEFAULT 0,
      usedcommands INTEGER DEFAULT 0,
      pasatiempo TEXT DEFAULT '',
      description TEXT DEFAULT '',
      marry TEXT DEFAULT '',
      genre TEXT DEFAULT '',
      birth TEXT DEFAULT '',
      metadatos TEXT,
      metadatos2 TEXT,
      lastCommand TEXT DEFAULT ''
    )`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      bannedGrupo BOOLEAN DEFAULT 0,
      welcomeMessage TEXT DEFAULT '',
      byeMessage TEXT DEFAULT '',
      welcome BOOLEAN DEFAULT 0,
      goodbye BOOLEAN DEFAULT 0,
      antinsfw BOOLEAN DEFAULT 0,
      nsfw BOOLEAN DEFAULT 0,
      alerts BOOLEAN DEFAULT 0,
      gacha BOOLEAN DEFAULT 1,
      rpg BOOLEAN DEFAULT 1,
      warnLimit BOOLEAN DEFAULT 0,
      expulsar BOOLEAN DEFAULT 0,
      adminonly BOOLEAN DEFAULT 0,
      primaryBot TEXT,
      antilinks BOOLEAN DEFAULT 1,
      antistatus BOOLEAN DEFAULT 0,
      personajesReservados TEXT DEFAULT '[]',
      intercambios TEXT DEFAULT '[]',
      timeTrade INTEGER DEFAULT 0,
      scheduledActions TEXT DEFAULT '[]',
      marriages TEXT DEFAULT '{}',
      impuestosActivos INTEGER DEFAULT 0,
      impuestos TEXT DEFAULT '{}',
      groupOpenStatus INTEGER DEFAULT 0
    )`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_users (
      chat_id TEXT,
      user_id TEXT,
      coins INTEGER DEFAULT 0,
      bank INTEGER DEFAULT 0,
      lastdungeon INTEGER DEFAULT 0,
      lasthunt INTEGER DEFAULT 0,
      lastfish INTEGER DEFAULT 0,
      lastslot INTEGER DEFAULT 0,
      dailyStreak INTEGER DEFAULT 0,
      characters TEXT DEFAULT '[]',
      personajesEnVenta TEXT DEFAULT '[]',
      crimeCooldown INTEGER DEFAULT 0,
      mineCooldown INTEGER DEFAULT 0,
      slotCooldown INTEGER DEFAULT 0,
      carreraCooldown INTEGER DEFAULT 0,
      ritualCooldown INTEGER DEFAULT 0,
      workCooldown INTEGER DEFAULT 0,
      rtCooldown INTEGER DEFAULT 0,
      slutCooldown INTEGER DEFAULT 0,
      roboCooldown INTEGER DEFAULT 0,
      pptCooldown INTEGER DEFAULT 0,
      lastDaily INTEGER DEFAULT 0,
      voteCooldown INTEGER DEFAULT 0,
      rwCooldown INTEGER DEFAULT 0,
      buyCooldown INTEGER DEFAULT 0,
      stats TEXT DEFAULT '{}',
      usedTime TEXT,
      warnings TEXT DEFAULT '[]',
      tttCooldown INTEGER DEFAULT 0,
      plinkoCooldown INTEGER DEFAULT 0,
      PRIMARY KEY (chat_id, user_id)
    )`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      self BOOLEAN DEFAULT 0,
      prefijo TEXT DEFAULT '["/","#"]',
      commandsejecut INTEGER DEFAULT 0,
      type TEXT DEFAULT 'Sub',
      link TEXT DEFAULT 'https://diamondbots.xyz/register',
      banner TEXT DEFAULT 'https://cdn.sockywa.xyz/files/mNT8.jpeg',
      icon TEXT DEFAULT 'https://cdn.sockywa.xyz/files/MtLn.jpeg',
      currency TEXT DEFAULT 'Monedas 🪙',
      namebot TEXT DEFAULT 'ৎ୭࠭͢𝑴𝒆̤𝒈𝒖̣֟፝֯𝒎̤𝒊̣𝒏🔥̤ʙⷪᴏ͓ᷫᴛⷭ𓆪͟͞ ',
      namebot2 TEXT DEFAULT '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐',
      owner TEXT DEFAULT '5351524614'
    )`);

  db.exec(`CREATE TABLE IF NOT EXISTS sticker_packs (id TEXT PRIMARY KEY, packs TEXT DEFAULT '[]')`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_exp ON users(exp)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_level ON users(level)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_usedcommands ON users(usedcommands)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chatusers_coins ON chat_users(chat_id, coins)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chatusers_bank ON chat_users(chat_id, bank)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chatusers_dailystreak ON chat_users(chat_id, dailyStreak)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chatusers_lastdaily ON chat_users(chat_id, lastDaily)`);
}

function runMigrations() {
  const tables = [
    { name: 'users',      def: defUser,     exclude: ['id'] },
    { name: 'chats',      def: defChat,     exclude: ['id'] },
    { name: 'chat_users', def: defChatUser, exclude: ['chat_id', 'user_id'] },
    { name: 'settings',   def: defSets,     exclude: ['id'] },
    { name: 'sticker_packs', def: defStickerPack, exclude: ['id'] },
  ];

  for (const table of tables) {
    const existingCols  = db.prepare(`PRAGMA table_info(${table.name})`).all();
    const existingNames = new Set(existingCols.map(c => c.name));

    for (const [col, defaultValue] of Object.entries(table.def)) {
      if (table.exclude.includes(col) || existingNames.has(col)) continue;

      let sqlType    = 'TEXT';
      let sqlDefault = 'NULL';

      if (defaultValue === null) {
        sqlType    = 'TEXT';
        sqlDefault = 'NULL';
      } else if (typeof defaultValue === 'number') {
        sqlType    = 'INTEGER';
        sqlDefault = String(defaultValue);
      } else if (typeof defaultValue === 'boolean') {
        sqlType    = 'INTEGER';
        sqlDefault = defaultValue ? '1' : '0';
      } else if (typeof defaultValue === 'string') {
        sqlType    = 'TEXT';
        sqlDefault = `'${defaultValue.replace(/'/g, "''")}'`;
      } else if (typeof defaultValue === 'object') {
        sqlType    = 'TEXT';
        sqlDefault = `'${JSON.stringify(defaultValue).replace(/'/g, "''")}'`;
      }

      try {
        db.exec(`ALTER TABLE ${table.name} ADD COLUMN ${col} ${sqlType} DEFAULT ${sqlDefault}`);
      } catch (e) {
        console.error(`[DB Migration] ❌ ${table.name}.${col}:`, e.message);
        continue;
      }

      const stored =
        defaultValue === null
          ? null
          : typeof defaultValue === 'object'
          ? JSON.stringify(defaultValue)
          : defaultValue;

      try {
        if (table.name === 'chat_users') {
          const rows = db.prepare(`SELECT chat_id, user_id FROM chat_users`).all();
          const updStmt = db.prepare(`UPDATE chat_users SET ${col} = ? WHERE chat_id = ? AND user_id = ?`);
          db.transaction((rows) => {
            for (const row of rows) updStmt.run(stored, row.chat_id, row.user_id);
          })(rows);
        } else {
          const rows = db.prepare(`SELECT id FROM ${table.name}`).all();
          const updStmt = db.prepare(`UPDATE ${table.name} SET ${col} = ? WHERE id = ?`);
          db.transaction((rows) => {
            for (const row of rows) updStmt.run(stored, row.id);
          })(rows);
        }
      } catch (e) {
        console.error(`[DB Migration] ❌ Update ${table.name}.${col}:`, e.message);
      }
    }
  }
}

initDB();
runMigrations();

function getCacheKey(type, id) {
  return `${type}:${id}`;
}

function clearChatUserCache(chatId) {
  for (const key of memCache.keys()) {
    if (key.startsWith(`chatuser:${chatId}:`)) memCache.delete(key);
  }
  memCache.delete(getCacheKey('chatuserslist', chatId));
}

export function getUser(id, opt: any = {}) {
  if (!id) {
    const { orderBy, desc = true } = opt;
    if (orderBy) {
      const allowedCols = ['exp', 'level', 'usedcommands', 'name'];
      if (!allowedCols.includes(orderBy)) throw new Error('Columna no permitida');
      return stmt(`SELECT * FROM users ORDER BY ${orderBy} ${desc ? 'DESC' : 'ASC'}`).all();
    }
    return stmt('SELECT * FROM users').all();
  }
  const key = getCacheKey('user', id);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < USER_CACHE_TTL) return cached.data;

  let user = stmt('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    stmt(`INSERT OR IGNORE INTO users (id) VALUES (?)`).run(id);
    user = stmt('SELECT * FROM users WHERE id = ?').get(id);
  }
  if (user.metadatos) {
    try { user.metadatos = JSON.parse(user.metadatos); } catch {}
  }
  if (user.metadatos2) {
    try { user.metadatos2 = JSON.parse(user.metadatos2); } catch {}
  }
  memCache.set(key, { data: user, ts: Date.now() });
  return user;
}

export function updateUser(id, field, val) {
  const user = stmt('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return;
  memCache.delete(getCacheKey('user', user.id));
  let stored = val;
  if (val && typeof val === 'object') stored = JSON.stringify(val);
  return stmt(`UPDATE users SET ${field} = ? WHERE id = ?`).run(stored, user.id);
}

export function getChat(id) {
  if (!id) return stmt('SELECT * FROM chats').all();
  const key = getCacheKey('chat', id);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < CHAT_CACHE_TTL) return cached.data;

  let chat = stmt('SELECT * FROM chats WHERE id = ?').get(id);
  if (!chat) {
    stmt(`INSERT OR IGNORE INTO chats (id) VALUES (?)`).run(id);
    chat = stmt('SELECT * FROM chats WHERE id = ?').get(id);
  }
  if (chat.personajesReservados) {
    try { chat.personajesReservados = JSON.parse(chat.personajesReservados); } catch { chat.personajesReservados = []; }
  }
  if (chat.intercambios) {
    try { chat.intercambios = JSON.parse(chat.intercambios); } catch { chat.intercambios = []; }
  }
  if (chat.marriages) {
    try { chat.marriages = JSON.parse(chat.marriages); } catch { chat.marriages = {}; }
  }
  if (chat.scheduledActions) {
    try { chat.scheduledActions = JSON.parse(chat.scheduledActions); } catch { chat.scheduledActions = []; }
  }
  memCache.set(key, { data: chat, ts: Date.now() });
  return chat;
}

export function updateChat(id, field, val) {
  const chat = stmt('SELECT id FROM chats WHERE id = ?').get(id);
  if (!chat) return;
  memCache.delete(getCacheKey('chat', id));
  let stored = val;
  if (val && typeof val === 'object') stored = JSON.stringify(val);
  return stmt(`UPDATE chats SET ${field} = ? WHERE id = ?`).run(stored, id);
}

function parseChatUserRow(user: any) {
  if (user.characters)        try { user.characters        = JSON.parse(user.characters);        } catch { user.characters = []; }
  if (user.personajesEnVenta) try { user.personajesEnVenta = JSON.parse(user.personajesEnVenta); } catch { user.personajesEnVenta = []; }
  if (user.stats)             try { user.stats             = JSON.parse(user.stats);             } catch { user.stats = {}; }
  if (user.warnings)          try { user.warnings          = JSON.parse(user.warnings);          } catch { user.warnings = []; }
  return user;
}

export function getChatUser(chatId, userId?, opt: any = {}) {
  if (!chatId) return stmt('SELECT * FROM chat_users').all();

  if (!userId) {
    const { orderBy, desc = true } = opt;
    if (!orderBy) {
      const key = getCacheKey('chatuserslist', chatId);
      const cached = memCache.get(key);
      if (cached && Date.now() - cached.ts < CHATUSERS_LIST_CACHE_TTL) return cached.data;

      const rows = stmt('SELECT * FROM chat_users WHERE chat_id = ?').all(chatId).map(parseChatUserRow);
      memCache.set(key, { data: rows, ts: Date.now() });
      return rows;
    }

    const allowedCols = ['coins', 'bank', 'dailyStreak', 'lastDaily'];
    if (!allowedCols.includes(orderBy)) throw new Error('Columna no permitida para ordenamiento');
    const sql = `SELECT * FROM chat_users WHERE chat_id = ? ORDER BY ${orderBy} ${desc ? 'DESC' : 'ASC'}`;
    return stmt(sql).all(chatId).map(parseChatUserRow);
  }

  const key = getCacheKey('chatuser', `${chatId}:${userId}`);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < CHATUSER_CACHE_TTL) return cached.data;

  let cu = stmt('SELECT * FROM chat_users WHERE chat_id = ? AND user_id = ?').get(chatId, userId);
  if (!cu) {
    stmt(`INSERT OR IGNORE INTO chat_users (chat_id, user_id) VALUES (?, ?)`).run(chatId, userId);
    cu = stmt('SELECT * FROM chat_users WHERE chat_id = ? AND user_id = ?').get(chatId, userId);
  }
  cu = parseChatUserRow(cu);

  memCache.set(key, { data: cu, ts: Date.now() });
  return cu;
}

export function updateChatUser(chatId, userId, field, val) {
  memCache.delete(getCacheKey('chatuser', `${chatId}:${userId}`));
  memCache.delete(getCacheKey('chatuserslist', chatId));
  let stored = val;
  if (val && typeof val === 'object') stored = JSON.stringify(val);
  return stmt(`UPDATE chat_users SET ${field} = ? WHERE chat_id = ? AND user_id = ?`).run(stored, chatId, userId);
}

export function getSettings(id) {
  const key = getCacheKey('set', id)
  const cached = memCache.get(key)
  if (cached && Date.now() - cached.ts < SET_CACHE_TTL) return cached.data

  let row = stmt('SELECT * FROM settings WHERE id = ?').get(id)

  if (!row) {
    const existingCols = db.prepare(`PRAGMA table_info(settings)`).all()
    const existingNames = new Set(existingCols.map((c: any) => c.name))

    const fields = ['id', ...Object.keys(defSets).filter((field) => existingNames.has(field))]
    const placeholders = fields.map(() => '?').join(', ')
    const values = fields.map((field) => {
      if (field === 'id') return id
      return defSets[field]
    })

    stmt(`INSERT INTO settings (${fields.join(', ')}) VALUES (${placeholders})`).run(...values)

    row = stmt('SELECT * FROM settings WHERE id = ?').get(id)
  }

  if (row.prefijo) {
    try {
      row.prefijo = JSON.parse(row.prefijo)
    } catch {
      if (row.prefijo === 'true' || row.prefijo === '1') row.prefijo = ['/', '#']
    }
  }

  memCache.set(key, { data: row, ts: Date.now() })
  return row
}

export function updateSettings(id, field, val) {
  const setting = stmt('SELECT id FROM settings WHERE id = ?').get(id);
  if (!setting) return;

  const exists = db
    .prepare(`PRAGMA table_info(settings)`)
    .all()
    .some((col: any) => col.name === field);

  if (!exists) {
    console.error(`[DB] La columna settings.${field} no existe`);
    return;
  }

  memCache.delete(getCacheKey('set', setting.id));

  let stored = val;

  if (val === true) stored = '1';
  else if (val === false) stored = '0';
  else if (Array.isArray(val) || typeof val === 'object') stored = JSON.stringify(val);

  return stmt(`UPDATE settings SET ${field} = ? WHERE id = ?`).run(stored, setting.id);
}

export function getStickersPack(id) {
  if (!id) return stmt('SELECT * FROM sticker_packs').all();
  const key = getCacheKey('stickerpack', id);
  const cached = memCache.get(key);
  if (cached && Date.now() - cached.ts < STICKERPACK_CACHE_TTL) return cached.data;

  let stickerPack = stmt('SELECT * FROM sticker_packs WHERE id = ?').get(id);
  if (!stickerPack) {
    stmt(`INSERT INTO sticker_packs (id, packs) VALUES (?, ?)`).run(id, defStickerPack.packs);
    stickerPack = stmt('SELECT * FROM sticker_packs WHERE id = ?').get(id);
  }
  if (stickerPack.packs) {
    try { stickerPack.packs = JSON.parse(stickerPack.packs); } catch { stickerPack.packs = []; }
  }
  memCache.set(key, { data: stickerPack, ts: Date.now() });
  return stickerPack;
}

export function updateStickersPack(id, field, val) {
  const stickerPack = stmt('SELECT id FROM sticker_packs WHERE id = ?').get(id);
  if (!stickerPack) return;
  memCache.delete(getCacheKey('stickerpack', id));
  let stored = val;
  if (val && typeof val === 'object') stored = JSON.stringify(val);
  return stmt(`UPDATE sticker_packs SET ${field} = ? WHERE id = ?`).run(stored, id);
}

export function deletedb(type, ...ids) {
  if (!type || !ids || ids.length === 0) return false;
  switch (type) {
    case 'user':
      memCache.delete(getCacheKey('user', ids[0]));
      return stmt('DELETE FROM users WHERE id = ?').run(ids[0]).changes > 0;
    case 'chat':
      memCache.delete(getCacheKey('chat', ids[0]));
      return stmt('DELETE FROM chats WHERE id = ?').run(ids[0]).changes > 0;
    case 'chatuser':
      if (ids.length < 2) return false;
      memCache.delete(getCacheKey('chatuser', `${ids[0]}:${ids[1]}`));
      memCache.delete(getCacheKey('chatuserslist', ids[0]));
      return stmt('DELETE FROM chat_users WHERE chat_id = ? AND user_id = ?').run(ids[0], ids[1]).changes > 0;
    case 'settings':
      memCache.delete(getCacheKey('set', ids[0]));
      return stmt('DELETE FROM settings WHERE id = ?').run(ids[0]).changes > 0;
    case 'stickerpack':
      memCache.delete(getCacheKey('stickerpack', ids[0]));
      return stmt('DELETE FROM sticker_packs WHERE id = ?').run(ids[0]).changes > 0;
    default:
      return false;
  }
}

export function setCreate(table, identifier, field, value) {
  const tableConfig = {
    users:      { primaryKeys: ['id'],                  jsonFields: ['metadatos', 'metadatos2'] },
    chats:      { primaryKeys: ['id'],                  jsonFields: ['personajesReservados', 'intercambios', 'scheduledActions'] },
    chat_users: { primaryKeys: ['chat_id', 'user_id'],  jsonFields: ['characters', 'personajesEnVenta', 'stats', 'warnings'] },
    settings:   { primaryKeys: ['id'],                  jsonFields: ['prefijo'] },
  };
  const config = tableConfig[table];
  if (!config) throw new Error(`Tabla '${table}' no soportada`);

  const columnExists = (tableName, columnName) => {
    try {
      return db.prepare(`PRAGMA table_info(${tableName})`).all().some(col => col.name === columnName);
    } catch { return false; }
  };

  if (!columnExists(table, field)) {
    let sqlType = typeof value === 'number' ? 'INTEGER' : 'TEXT';
    let sqlDefault = 'NULL';

    if (typeof value === 'number') {
      sqlDefault = String(value);
    } else if (Array.isArray(value)) {
      sqlDefault = "'[]'";
    } else if (typeof value === 'object' && value !== null) {
      sqlDefault = `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    } else if (typeof value === 'string') {
      sqlDefault = `'${value.replace(/'/g, "''")}'`;
    } else {
      sqlDefault = "''";
    }

    db.exec(`ALTER TABLE ${table} ADD COLUMN ${field} ${sqlType} DEFAULT ${sqlDefault}`);

    if (table === 'settings') {
      memCache.delete(getCacheKey('set', identifier));
    }
  }

  if (table === 'chat_users') {
    if (!Array.isArray(identifier) || identifier.length < 2) throw new Error('chat_users requiere [chatId, userId]');
    const [chatId, userId] = identifier;
    const record = getChatUser(chatId, userId);
    if (record[field] === undefined || record[field] === null) {
      updateChatUser(chatId, userId, field, value);
      return value;
    }
    return record[field];
  } else if (table === 'users') {
    const record = getUser(identifier);
    if (record[field] === undefined || record[field] === null) {
      updateUser(identifier, field, value);
      return value;
    }
    return record[field];
  } else if (table === 'chats') {
    const record = getChat(identifier);
    if (record[field] === undefined || record[field] === null) {
      updateChat(identifier, field, value);
      return value;
    }
    return record[field];
  } else if (table === 'settings') {
    const record = getSettings(identifier);
    if (record[field] === undefined || record[field] === null) {
      updateSettings(identifier, field, value);
      return value;
    }
    return record[field];
  }
  return value;
}

export function clearCache(type?, id?) {
  if (type === undefined && id === undefined) {
    memCache.clear();
    return true;
  }
  if (id) {
    memCache.delete(getCacheKey(type, id));
  } else {
    for (const key of memCache.keys()) {
      if (key.startsWith(`${type}:`)) memCache.delete(key);
    }
  }
}
function cleanExpiredCache() {
  const now = Date.now();
  let removed = 0;
  for (const [key, entry] of memCache) {
    const type = key.slice(0, key.indexOf(':'));
    const ttl = CACHE_TTLS[type] ?? 60000;
    if (now - (entry as any).ts > ttl) {
      memCache.delete(key);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(`[Cache] 🧹 ${removed} entradas expiradas eliminadas (${memCache.size} restantes)`);
  }
}
setInterval(cleanExpiredCache, 60 * 1000);

setInterval(() => {
  try {
    db.pragma('wal_checkpoint(PASSIVE)');
  } catch (e) {
    console.error('[WAL checkpoint] ❌', e.message);
  }
}, 5 * 60 * 1000);

const BACKUPS_DIR = path.join(process.cwd(), 'core', 'backups');
const MAX_BACKUPS = 5;

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

export function createBackup() {
  return new Promise((resolve, reject) => {
    try {
      ensureBackupsDir();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `database-${timestamp}.db`;
      const backupPath = path.join(BACKUPS_DIR, backupFileName);

      db.backup(backupPath)
        .then(() => {
          console.log(`[Backup] ✅ Backup creado: ${backupFileName}`);
          cleanOldBackups();
          resolve({ fileName: backupFileName, path: backupPath });
        })
        .catch((err) => {
          console.error('[Backup] ❌ Error creando backup:', err.message);
          reject(err);
        });
    } catch (e) {
      console.error('[Backup] ❌ Error inesperado:', e.message);
      reject(e);
    }
  });
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('database-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUPS_DIR, f),
        time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      for (const file of toDelete) {
        fs.unlinkSync(file.path);
      }
    }
  } catch (e) {
    console.error('[Backup] ❌ Error limpiando backups viejos:', e.message);
  }
}

export function initBackupScheduler() {
  ensureBackupsDir();
  schedule.scheduleJob('0 0 * * *', () => {
    console.log('[Backup] ⏰ Ejecutando backup programado...');
    createBackup();
  });
}

export default {
  initDB,
  getUser,
  updateUser,
  getChat,
  updateChat,
  getChatUser,
  updateChatUser,
  getSettings,
  updateSettings,
  getStickersPack,
  updateStickersPack,
  deletedb,
  setCreate,
  clearCache,
  createBackup,
  initBackupScheduler,
  db,
};