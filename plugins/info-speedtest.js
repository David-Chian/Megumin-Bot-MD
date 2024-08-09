import cp from 'child_process';
import {promisify} from 'util';
const exec = promisify(cp.exec).bind(cp);
const handler = async (m) => {
    conn.reply(m.chat, wait, m, {
    contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
    title: packname,
    body: wm,
    previewType: 0, thumbnail: icons,
    sourceUrl: channel }}})
  let o;
  try {
    o = await exec('python3 speed.py');
  } catch (e) {
    o = e;
  } finally {
    const {stdout, stderr} = o;
    if (stdout.trim()) m.reply(stdout);
    if (stderr.trim()) m.reply(stderr);
  }
};
handler.help = ['speedtest'];
handler.tags = ['info'];
handler.command = ['speedtest','stest','speed'];

handler.register = true
export default handler;
