const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
const handler = async (_0x4828e0, { conn: _0x9bfe62 }) => {
    if (!_0x4828e0['quoted']) conn.reply(m.chat, '_*🔥 ᏒᎬᏕᏢᎾᏁᎠᎬ Ꭿ ᏬᏁ ᎷᎬᏁᏕᎯᏠᎬ ᏅᏬᎬ ᎻᎯᎽᎯ ᏕᎨᎠᎾ ᎬᏁᏉᎨᎯᎠᎾ ᎬᏁ ᏉᎨᎬᏯᎾᏁᏨᎬ (ᏉᎬᏒ ᏕᎾᏝᎾ ᏬᏁᎯ ᏉᎬᏃ)*_', m, rcanal)
    if (_0x4828e0['quoted']['mtype'] !== 'viewOnceMessageV2') conn.reply(m.chat, '_*❤‍🔥 ᎬᏝ ᎷᎬᏁᏕᎯᏠᎬ ᏕᎬᏝᎬᏨᏨᎨᎾᏁᎯᎠᎾ ᏁᎾ ᎬᏕ ᏉᎨᎬᏯᎾᏁᏨᎬ (ᏉᎬᏒ ᏕᎾᏝᎾ ᏬᏁᎯ ᏉᎬᏃ)*_', m, rcanal)

    const _0x12dc2e = _0x4828e0['quoted']['message'];
    const _0x189b47 = Object.keys(_0x12dc2e)[0x0];
    const _0x38def8 = await downloadContentFromMessage(_0x12dc2e[_0x189b47], _0x189b47 === 'imageMessage' ? 'image' : 'video');

    let _0x2d1bfa = Buffer.from([]);
    for await (const _0x249104 of _0x38def8) {
        _0x2d1bfa = Buffer.concat([_0x2d1bfa, _0x249104]);
    }

    if (/video/.test(_0x189b47)) {
        return _0x9bfe62.sendFile(_0x4828e0['chat'], _0x2d1bfa, 'error.mp4', _0x12dc2e[_0x189b47]['caption'] || '', _0x4828e0);
    } else {
        if (/image/.test(_0x189b47)) {
            return _0x9bfe62.sendFile(_0x4828e0['chat'], _0x2d1bfa, 'error.jpg', _0x12dc2e[_0x189b47]['caption'] || '', _0x4828e0);
        }
    }
};

handler['help'] = ['readvo'];
handler['tags'] = ['tools'];
handler['command'] = ['readviewonce', 'read', 'revelar', 'readvo'];
handler['register'] = true;
handler['group'] = true;

export default handler;