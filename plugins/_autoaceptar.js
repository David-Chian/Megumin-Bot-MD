let handler = m => m

handler.before = async function (m, {conn, isAdmin, isBotAdmin}) {
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
if (chat.autoAceptar && !isAdmin) {
    if (!isBotAdmin) return !0
        const participants = await conn.groupRequestParticipantsList(m.chat)
        const latinPrefix = '5'
        const filteredParticipants = participants.filter(p => p.jid.includes('@s.whatsapp.net') && p.jid.split('@')[0].startsWith(latinPrefix))
        for (const participant of filteredParticipants) {
            await conn.groupRequestParticipantsUpdate(m.chat, [participant.jid], "approve")
        }
        if (m.messageStubType === 172 && m.messageStubParameters) {
            const [jid] = m.messageStubParameters
            if (jid.includes('@s.whatsapp.net') && jid.split('@')[0].startsWith(latinPrefix)) {
                await conn.groupRequestParticipantsUpdate(m.chat, [jid], "approve")}}
}}
export default handler
