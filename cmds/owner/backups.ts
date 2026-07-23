import fs from 'fs';
import path from 'path';
import database from '../../core/system/database.ts';

const BACKUPS_DIR = path.join(process.cwd(), 'core', 'backups');

export default {
  command: ['backup', 'backupdb'],
  category: 'owner',
  isOwner: true,
  run: async ({ sock, m, args, usedPrefix, command }) => {
    const sub = args[0]?.toLowerCase();

    if (sub === 'list' || sub === 'lista') {
      if (!fs.existsSync(BACKUPS_DIR)) {
        return sock.reply(m.chat, '📁 Aún no existe la carpeta de backups.', m, m.rcanal);
      }

      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('database-') && f.endsWith('.db'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f));
          return { name: f, size: stats.size, time: stats.mtime };
        })
        .sort((a, b) => b.time - a.time);

      if (files.length === 0) {
        return sock.reply(m.chat, '📁 No hay backups todavía.', m, m.rcanal);
      }

      const list = files.map((f, i) => {
        const sizeKB = (f.size / 1024).toFixed(1);
        const fecha = f.time.toLocaleString('es-ES', { timeZone: 'America/Havana' });
        return `${i + 1}. *${f.name}*\n   📦 ${sizeKB} KB — 🕐 ${fecha}`;
      }).join('\n\n');

      return sock.reply(m.chat, `*📋 Backups disponibles (${files.length}/5):*\n\n${list}`, m, m.rcanal);
    }

    await sock.reply(m.chat, '⏳ Creando backup de la base de datos...', m, m.rcanal);

    try {
      const result = await database.createBackup();
      sock.reply(m.chat, `✅ Backup creado correctamente:\n📄 \`${result.fileName}\``, m, m.rcanal);
    } catch (e) {
      sock.reply(m.chat, `❌ Error creando el backup: ${e.message}`, m, m.rcanal);
    }
  }
};