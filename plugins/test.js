const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null)
  const participants = groupMetadata?.participants || []

  const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')

  if (admins.length === 0) {
    return m.reply('No se detectaron administradores en este grupo.')
  }

  const adminList = admins.map(p => 
    `• ${p.id} (${p.admin === 'superadmin' ? 'Superadmin' : 'Admin'})`
  ).join('\n')

  const result = `
✅ *Administradores del grupo:*

${adminList}
`.trim()

  await m.reply(result)
}

handler.command = /^test$/i
export default handler