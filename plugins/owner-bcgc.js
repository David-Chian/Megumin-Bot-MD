const handler = async (m, {conn, isROwner, text}) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const getGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1]);
  const anu = groups.map((v) => v.id);
  const pesan = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!pesan) throw '*Y EL TEXTO?*';
  // m.reply(`*😻 𝖬𝖾𝗇𝗌𝖺𝗃𝖾 𝖤𝗇𝗏𝗂𝖺𝖽𝗈 𝖠 : ${anu.length} 𝖦𝗋𝗎𝗉𝗈𝗌*\n\n*𝘗𝘶𝘦𝘥𝘦 𝘴𝘦𝘳 𝘲𝘶𝘦 𝘯𝘰 𝘴𝘦 𝘦𝘯𝘷𝘪𝘦 𝘢 𝘵𝘰𝘥𝘰𝘴 𝘭𝘰𝘴 𝘤𝘩𝘢𝘵𝘴 𝘱𝘰𝘳 𝘴𝘱𝘢𝘮 𝘰 𝘱𝘶𝘦𝘥𝘦 𝘮𝘢𝘯𝘥𝘢𝘳 𝘳𝘭 𝘣𝘰𝘵 𝘢𝘭 𝘴𝘰𝘱𝘰𝘳𝘵𝘦 🦋*`)
  for (const i of anu) {
    await delay(500);
    conn.relayMessage(i,
        {liveLocationMessage: {
          degreesLatitude: 35.685506276233525,
          degreesLongitude: 139.75270667105852,
          accuracyInMeters: 0,
          degreesClockwiseFromMagneticNorth: 2,
          caption: '😻 𝖢𝗈𝗆𝗎𝗇𝗂𝖼𝖺𝖽𝗈 🦋\n\n' + pesan + '\n\n🟢 *Activos*',
          sequenceNumber: 2,
          timeOffset: 3,
          contextInfo: m,
        }}, {}).catch((_) => _);
  }
  m.reply(`*😻 𝖬𝖾𝗇𝗌𝖺𝗃𝖾 𝖤𝗇𝗏𝗂𝖺𝖽𝗈 𝖠: ${anu.length} 𝙶𝚁𝚄𝙿𝙾/𝚂*\n\n*𝘗𝘶𝘦𝘥𝘦 𝘴𝘦𝘳 𝘲𝘶𝘦 𝘯𝘰 𝘴𝘦 𝘦𝘯𝘷𝘪𝘦 𝘢 𝘵𝘰𝘥𝘰𝘴 𝘭𝘰𝘴 𝘤𝘩𝘢𝘵𝘴 𝘱𝘰𝘳 𝘴𝘱𝘢𝘮 𝘰 𝘱𝘶𝘦𝘥𝘦 𝘮𝘢𝘯𝘥𝘢𝘳 𝘳𝘭 𝘣𝘰𝘵 𝘢𝘭 𝘴𝘰𝘱𝘰𝘳𝘵𝘦 🦋*`);
};
handler.help = ['broadcastgroup', 'bcgc'].map((v) => v + ' <teks>');
handler.tags = ['owner'];
handler.command = ['bcgc'];
handler.owner = true;

export default handler;