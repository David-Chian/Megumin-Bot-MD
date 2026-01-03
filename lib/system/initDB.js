let isNumber = (x) => typeof x === 'number' && !isNaN(x)

function initDB(m, client) {
  const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

  const settings = global.db.data.settings[jid] ||= {}
  settings.self ??= false
  settings.prefijo ??= ['/', '#', '.']
  settings.id ??= '120363358338732714@newsletter'
  settings.nameid ??= '──̄͟͞⛛̵̅𝐌̸͡𝐞𝐠̵𝐮̲͜𝐦̷̈𝐢͜𝐧̸̤𝐁̷𝐨̶̇͜𝐭𓊓̴̻𝐂̷𝐡̶͡𝐚𝐧̈͜𝐧͜𝐞͜𝐥̵̲͞🔥̵̄͟'
  settings.type ??= 'Sub'
  settings.link ??= 'https://whatsapp.com/channel/0029VaqAtuIK0IBsHYXtvA3e'
  settings.banner ??= 'https://cdn.stellarwa.xyz/files/bGo5.jpeg'
  settings.icon ??= 'https://cdn.stellarwa.xyz/files/MtLn.jpeg'
  settings.currency ??= 'Monedas 💰'
  settings.namebot ??= 'ৎ୭࠭͢𝑴𝒆̤𝒈𝒖̣֟፝֯𝒎̤𝒊̣𝒏🔥̤ʙⷪᴏ͓ᷫᴛⷭ𓆪͟͞ '
  settings.namebot2 ??= '⏤͟͞ू⃪ ፝͜⁞M͢ᴇɢ፝֟ᴜᴍ⃨ɪɴ⃜✰⃔࿐'
  settings.owner ??= 'ᥫᩣᎠ꯭I𝚫⃥꯭M꯭Ꭷ꯭Ꮑ꯭Ꭰ࠭⋆̟(◣_◢)凸'

  const user = global.db.data.users[m.sender] ||= {}
  user.name ??= ''
  user.exp = isNumber(user.exp) ? user.exp : 0
  user.level = isNumber(user.level) ? user.level : 0
  user.usedcommands = isNumber(user.usedcommands) ? user.usedcommands : 0
  user.pasatiempo ??= ''
  user.description ??= ''
  user.marry ??= ''
  user.genre ??= ''
  user.birth ??= ''
  user.metadatos ??= null
  user.metadatos2 ??= null

  const chat = global.db.data.chats[m.chat] ||= {}
  chat.users ||= {}
  chat.bannedGrupo ??= false
  chat.welcome ??= true
  chat.nsfw ??= false
  chat.alerts ??= true
  chat.gacha ??= true
  chat.rpg ??= true
  chat.adminonly ??= false
  chat.primaryBot ??= null
  chat.antilinks ??= true
  chat.personajesReservados ||= []

  chat.users[m.sender] ||= {}
  chat.users[m.sender].coins = isNumber(chat.users[m.sender].coins) ? chat.users[m.sender].coins : 0
  chat.users[m.sender].bank = isNumber(chat.users[m.sender].bank) ? chat.users[m.sender].bank : 0
  chat.users[m.sender].characters = Array.isArray(chat.users[m.sender].characters) ? chat.users[m.sender].characters : []
}

export default initDB;