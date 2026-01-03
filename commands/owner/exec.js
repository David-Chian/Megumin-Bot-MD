import syntaxerror from 'syntax-error'
import { format } from 'util'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__dirname)

export default {
  command: ['eval', '=>'],
  isOwner: true,

  run: async ({client, m, args, command, text}) => {
    
    let code = text
    let _return
    let _syntax = ''
    if (command === '=>') {
      code = 'return ' + code
    }

    try {
      let f = { exports: {} }
      let exec = new (async () => { }).constructor(
        'client',
        'm',
        'require',
        'args',
        'module',
        'exports',
        code
      )

      _return = await exec.call(
        client,
        client,
        m,
        require,
        args,
        f,
        f.exports
      )

    } catch (e) {
      let err = syntaxerror(code, 'Eval Error', {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        sourceType: 'module'
      })

      if (err) {
        _syntax = '```' + err + '```\n\n'
      }

      _return = e
    }
    return client.reply(
      m.chat,
      _syntax + format(_return),
      m
    )
  }
}