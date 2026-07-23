import syntaxerror from 'syntax-error'
import { format } from 'util'
import { createRequire } from 'module'

export default {
  command: ['eval', 'e'],
  isOwner: true,
  run: async ({ sock, m, args, command, text }: any) => {
    const require = createRequire(import.meta.url);

    try {
      if (text.trim() === 'm.quoted') {
        if (!m.quoted) return sock.sendMessage(m.chat, { text: 'Debes citar un mensaje.' }, { quoted: m });
 
        return await sock.sendMessage(m.chat, { text: format(m.quoted) }, { quoted: m });
      }
      if (text.trim() === 'm.chat') {
        return await sock.sendMessage(m.chat, { text: format(m.chat) }, { quoted: m });
      }
    } catch (e) {
      return await sock.sendMessage(m.chat, { text: format(e) }, { quoted: m });
    }

    let code = text;
    let _return;
    let _syntax = '';

    if ((command === 'e' || command === 'eval') && !/^\s*return\b/.test(code)) {
  const looksLikeStatementBlock = /\b(const|let|var|if|for|while|function|class|throw)\b/.test(code) && code.includes('\n');
  if (!looksLikeStatementBlock) {
    code = 'return ' + code;
  }
}

    try {
      const f = { exports: {} };
      const exec = new (async () => {}).constructor(
        'sock',
        'm',
        'require',
        'args',
        'module',
        'exports',
        code
      );

      _return = await exec.call(sock, sock, m, require, args, f, f.exports);

    } catch (e: any) {
      const err = syntaxerror(code, 'Eval Error', {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        sourceType: 'module',
      });

      if (err) _syntax = '```' + err + '```\n\n';
      _return = e;
    }

    const isMsgInfo = (obj: any) => typeof obj === 'object' && obj !== null && 'key' in obj && 'messageTimestamp' in obj;

    if (_syntax || (_return !== undefined && !isMsgInfo(_return))) {
      await sock.sendMessage(m.chat, {
        text: _syntax + format(_return),
      }, { quoted: m });
    }
  }
}