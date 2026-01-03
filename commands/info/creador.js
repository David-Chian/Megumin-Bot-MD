import PhoneNumber from 'awesome-phonenumber';

export default {
  command: ['owner', 'creador'],
  category: 'info',
  run: async ({client, m}) => {
    try {

      const number = '5351524614'
      const jid = number + '@s.whatsapp.net'

      const contact = {
        number,
        name: 'Creador Principal 🫒',
        org: dev,
        email: 'diamond.settlar.help@gmail.com',
        region: 'Cuba',
        website: 'studio.diamondbots.xyz',
        note: '💎 Creador oficial.'
      }

      const generateVCard = ({ number, name, org, email, region, website, note }) => {
        const phone = PhoneNumber('+' + number)
        const intl = phone.getNumber('international') || '+' + number
        const clean = (text) => String(text).replace(/\n/g, '\\n').trim()

        return `
BEGIN:VCARD
VERSION:3.0
FN:${clean(name)}
ORG:${clean(org)}
TEL;type=CELL;waid=${number}:${intl}
EMAIL:${clean(email)}
ADR:;;${clean(region)};;;;
URL:${clean(website)}
NOTE:${clean(note)}
END:VCARD`.trim()
      }

      const vcard = generateVCard(contact)

      await client.sendMessage(m.chat, {
        contacts: {
          displayName: contact.name,
          contacts: [{ vcard, displayName: contact.name }]
        }
      }, { quoted: m })

    } catch (e) {
      await client.reply(m.chat, msgglobal, m)
    }
  }
};