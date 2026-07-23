import os from 'os';
import fs from 'fs';
import { performance } from 'perf_hooks';

function clockString(ms) {
  var d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  var h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  var m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  var s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'D ', h, 'H ', m, 'M ', s, 'S '].map(v => v.toString().padStart(2, 0)).join('');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  do { bytes /= 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
  return bytes.toFixed(2) + ' ' + units[i];
}

function readCgroupFile(path) {
  try { return parseInt(fs.readFileSync(path, 'utf8').trim()); } catch { return null; }
}

function getContainerMemory() {
  const limitV2 = readCgroupFile('/sys/fs/cgroup/memory.max');
  const usageV2 = readCgroupFile('/sys/fs/cgroup/memory.current');
  if (limitV2 && limitV2 !== Infinity && limitV2 < Number.MAX_SAFE_INTEGER) {
    return {
      total: limitV2,
      used: usageV2 || 0,
      free: limitV2 - (usageV2 || 0)
    };
  }

  const limitV1 = readCgroupFile('/sys/fs/cgroup/memory/memory.limit_in_bytes');
  const usageV1 = readCgroupFile('/sys/fs/cgroup/memory/memory.usage_in_bytes');
  const hostTotal = os.totalmem();
  if (limitV1 && limitV1 < hostTotal) {
    return {
      total: limitV1,
      used: usageV1 || 0,
      free: limitV1 - (usageV1 || 0)
    };
  }

  const freeMem = os.freemem();
  return {
    total: hostTotal,
    used: hostTotal - freeMem,
    free: freeMem
  };
}

export default {
  command: ['status'],
  category: 'info',
  isAdmin: false,
  isBotAdmin: false,
  isOwner: false,
  isGroup: false,

  run: async ({ sock, m }) => {
    const start = performance.now();
    await m.reply('_Testing speed..._');
    const speed = (performance.now() - start).toFixed(2);

    const used = process.memoryUsage();

    const cpus = os.cpus().map(cpu => {
      cpu.total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return cpu;
    });

    const cpu = cpus.reduce((last, cpu, _, { length }) => {
      last.total += cpu.total;
      last.speed += cpu.speed / length;
      last.times.user += cpu.times.user;
      last.times.nice += cpu.times.nice;
      last.times.sys += cpu.times.sys;
      last.times.idle += cpu.times.idle;
      last.times.irq += cpu.times.irq;
      return last;
    }, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } });

    const uptime = process.uptime() * 1000;
    const muptime = clockString(uptime);

    const { total: totalMem, used: memUsed, free: freeMem } = getContainerMemory();

    const txt = `*ᴘ ɪ ɴ ɢ*
${speed} ms

*ʀ ᴜ ɴ ᴛ ɪ ᴍ ᴇ*
${muptime}

*s ᴇ ʀ ᴠ ᴇ ʀ*
*🛑 ʀᴀᴍ:* ${formatBytes(memUsed)} / ${formatBytes(totalMem)}
*🔵 ғʀᴇᴇ RAM:* ${formatBytes(freeMem)}
*🔴 ᴄᴘᴜ:* ${cpus[0]?.model || 'Unknown'}
*🔭 ᴘʟᴀᴛғᴏʀᴍ:* ${os.platform()}
*🧿 sᴇʀᴠᴇʀ:* ${os.hostname()}
*⏰ ᴛɪᴍᴇ:* ${new Date().toLocaleTimeString()}

_NodeJS Memory Usage_
${
  '```' +
  Object.keys(used).map(key =>
    `${key.padEnd(15)}: ${formatBytes(used[key])}`
  ).join('\n') +
  '```'
}

_CPU Usage (${cpus.length} Core/s)_
${cpus[0]?.model.trim()} (${Math.round(cpu.speed)} MHz)
${Object.keys(cpu.times).map(type =>
  `- *${(type + '*').padEnd(6)}: ${((100 * cpu.times[type]) / cpu.total).toFixed(2)}%`
).join('\n')}`;

    await m.reply(txt);
  }
};