import {generateWAMessageFromContent} from '@whiskeysockets/baileys';
import {smsg} from './lib/simple.js';
import {format} from 'util';
import {fileURLToPath} from 'url';
import path, {join} from 'path';
import {unwatchFile, watchFile} from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import './plugins/main-allfake.js'

/**
 * @type {import('@adiwajshing/baileys')}  
 */
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

/**
 * Handle messages upsert
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate 
 */
export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || [];
this.uptime = this.uptime || Date.now();
if (!chatUpdate) {
return
}
if (!chatUpdate || !chatUpdate.messages) {
return
} else {
this.pushMessage(chatUpdate.messages).catch(console.error)
}
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) {
return;
}
if (global.db.data == null) await global.loadDatabase()
/*------------------------------------------------*/             
if (global.chatgpt.data === null) await global.loadChatgptDB()
/*------------------------------------------------*/        
try {
m = smsg(this, m) || m
if (!m)
return
m.exp = 0
m.cookies = false
m.money = false
try {
// TODO: use loop to insert data instead of this
let user = global.db.data.users[m.sender]
/*------------------------------------------------*/                    
let chatgptUser = global.chatgpt.data.users[m.sender];
if (typeof chatgptUser !== "object")
global.chatgpt.data.users[m.sender] = [];                
/*------------------------------------------------*/
if (typeof user !== 'object')
global.db.data.users[m.sender] = {}
if (user) {
if (!isNumber(user.exp)) user.exp = 0
if (!('premium' in user)) user.premium = false
if (!('muto' in user)) user.muto = false
if (!isNumber(user.joincount)) user.joincount = 1
if (!isNumber(user.money)) user.money = 150
if (!isNumber(user.cookies)) user.cookies = 20
if (!('registered' in user)) user.registered = false

if (!user.registered) {
if (!('name' in user)) user.name = m.name
if (!('age' in user)) user.age = 0
if (!isNumber(user.regTime)) user.regTime = -1
}

if (!isNumber(user.afk)) user.afk = -1
if (!('role' in user)) user.role = 'Novato'
if (!isNumber(user.bank)) user.bank = 0
if (!isNumber(user.coin)) user.coin = 0
if (!isNumber(user.diamond)) user.diamond = 3
if (!isNumber(user.exp)) user.exp = 0
if (!isNumber(user.lastadventure)) user.lastadventure = 0
if (!isNumber(user.lastcoins)) user.lastcoins = 0    
if (!isNumber(user.lastclaim)) user.lastclaim = 0
if (!isNumber(user.lastcode)) user.lastcode = 0
if (!isNumber(user.lastcofre)) user.lastcofre = 0
if (!isNumber(user.lastcodereg)) user.lastcodereg = 0
if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0    
if (!isNumber(user.lastduel)) user.lastduel = 0
if (!isNumber(user.crime)) user.crime = 0
if (!isNumber(user.lastmining)) user.lastmining = 0
if (!isNumber(user.lastpago)) user.lastpago = 0 
if (!isNumber(user.level)) user.level = 0
if (!isNumber(user.warn)) user.warn = 0
if (!user.premium) user.premiumTime = 0
} else
global.db.data.users[m.sender] = {
afk: -1,
afkReason: '',
name: m.name,
age: 0,
bank: 0,
banned: false,
BannedReason: '',
Banneduser: false,
coin: 0,
diamond: 3,
joincount: 1,
lastadventure: 0,
lastcoins: 0,
lastclaim: 0,
lastcode: 0,
lastcofre: 0,
lastdiamantes: 0,
lastduel: 0,
lastpago: 0,
lastrob: 0,
level: 0,
cookies: 20,
money: 100,
muto: false,
premium: false,
premiumTime: 0,
registered: false,
regTime: -1,
rendang: 0, 
}
let akinator = global.db.data.users[m.sender].akinator
if (typeof akinator !== 'object')
global.db.data.users[m.sender].akinator = {}
if (akinator) {
if (!('sesi' in akinator)) akinator.sesi = false
if (!('server' in akinator)) akinator.server = null
if (!('frontaddr' in akinator)) akinator.frontaddr = null
if (!('session' in akinator)) akinator.session = null
if (!('signature' in akinator)) akinator.signature = null
if (!('question' in akinator)) akinator.question = null
if (!('progression' in akinator)) akinator.progression = null
if (!('step' in akinator)) akinator.step = null
if (!('soal' in akinator)) akinator.soal = null
} else
global.db.data.users[m.sender].akinator = {
sesi: false,
server: null,
frontaddr: null,
session: null,
signature: null,
question: null,
progression: null,
step: null, 
soal: null
}                   
let chat = global.db.data.chats[m.chat]
if (typeof chat !== 'object')
global.db.data.chats[m.chat] = {}

if (chat) {
if (!('isBanned' in chat)) chat.isBanned = false         
if (!('welcome' in chat)) chat.welcome = true           
if (!('detect' in chat)) chat.detect = true               
if (!('sWelcome' in chat)) chat.sWelcome = ''          
if (!('sBye' in chat)) chat.sBye = ''                    
if (!('sPromote' in chat)) chat.sPromote = ''             
if (!('sDemote' in chat)) chat.sDemote = '' 
if (!('sCondition' in chat)) chat.sCondition = JSON.stringify([{ grupo: { usuario: [], condicion: [], admin: '' }, prefijos: []}])
if (!('delete' in chat)) chat.delete = false                   
if (!('modohorny' in chat)) chat.modohorny = false                   
if (!('autosticker' in chat)) chat.autosticker = false      
if (!('audios' in chat)) chat.audios = false
if (!('antiBot' in chat)) chat.antiBot = false 
if (!('antiBot2' in chat)) chat.antiBot2 = false               
if (!('antiver' in chat)) chat.antiver = false 
if (!('antiPorn' in chat)) chat.antiPorn = false     
if (!('antiLink' in chat)) chat.antiLink = false     
if (!('antiLink2' in chat)) chat.antiLink2 = false
if (!('antiTiktok' in chat)) chat.antiTiktok = false
if (!('antiYoutube' in chat)) chat.antiYoutube = false
if (!('antiTelegram' in chat)) chat.antiTelegram = false
if (!('antiFacebook' in chat)) chat.antiFacebook = false
if (!('antiInstagram' in chat)) chat.antiInstagram = false
if (!('antiTwitter' in chat)) chat.antiTwitter = false
if (!('antiDiscord' in chat)) chat.antiDiscord = false
if (!('antiThreads' in chat)) chat.antiThreads = false
if (!('antiTwitch' in chat)) chat.antiTwitch = false
if (!('antifake' in chat)) chat.antifake = false
if (!('reaction' in chat)) chat.reaction = false  
if (!('viewonce' in chat)) chat.viewonce = false       
if (!('modoadmin' in chat)) chat.modoadmin = false    
if (!('antitoxic' in chat)) chat.antitoxic = false
if (!('simi' in chat)) chat.simi = false
if (!('antiTraba' in chat)) chat.antiTraba = false
if (!('autolevelup' in chat))  chat.autolevelup = false
if (!isNumber(chat.expired)) chat.expired = 0
} else
global.db.data.chats[m.chat] = {
isBanned: false,
welcome: true,
detect: true,
sWelcome: '',
sBye: '',
sPromote: '',
sDemote: '', 
sCondition: JSON.stringify([{ grupo: { usuario: [], condicion: [], admin: '' }, prefijos: []}]), 
delete: false,
modohorny: false,
autosticker: false,
audios: false,
antiBot: false,
antiBot2: false,
antiver: false,
antiPorn: false,
antiLink: false,
antiLink2: false,
antiTiktok: false,
antiYoutube: false,
antiTelegram: false,
antiFacebook: false,
antiInstagram: false,
antiTwitter: false,
antiDiscord: false,
antiThreads: false,
antiTwitch: false,
antifake: false,
reaction: false,
viewonce: false,
modoadmin: false,
antitoxic: false, 
simi: false,
antiTraba: false,
autolevelup: false,
expired: 0,
}
let settings = global.db.data.settings[this.user.jid]
if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!('self' in settings)) settings.self = false
if (!('autoread' in settings)) settings.autoread = false
if (!('autoread2' in settings)) settings.autoread2 = false
if (!('restrict' in settings)) settings.restrict = false
if (!('antiPrivate' in settings)) settings.antiPrivate = false
if (!('antiCall' in settings)) settings.antiCall = true
if (!('antiSpam' in settings)) settings.antiSpam = true
if (!('modoia' in settings)) settings.modoia = false
if (!('jadibotmd' in settings)) settings.jadibotmd = false  
if (!('autobio' in settings)) settings.autobio = false
} else global.db.data.settings[this.user.jid] = {
self: false,
autoread: false,
autoread2: false,
restrict: false,
antiPrivate: false,
antiCall: true,
antiSpam: true,
modoia: false, 
jadibotmd: true,
autobio: false,
}} catch (e) {
console.error(e)
}

const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const isOwner = isROwner || m.fromMe
const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
//const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0
if (opts['queque'] && m.text && !(isMods || isPrems)) {
let queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

if (opts['nyimak']) return
if (!isROwner && opts['self']) return 
if (opts['pconly'] && m.chat.endsWith('g.us')) return
if (opts['gconly'] && !m.chat.endsWith('g.us')) return
if (opts['swonly'] && m.chat !== 'status@broadcast') return
if (typeof m.text !== 'string')
m.text = ''

        //if (m.isBaileys) return 
        if (m.isBaileys || isBaileysFail && m?.sender === this?.this?.user?.jid) {
        return
        }
m.exp += Math.ceil(Math.random() * 10)
let usedPrefix
let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
const participants = (m.isGroup ? groupMetadata.participants : []) || []
const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {} // User Data
const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
const isRAdmin = user?.admin == 'superadmin' || false
const isAdmin = isRAdmin || user?.admin == 'admin' || false //user admins? 
const isBotAdmin = bot?.admin || false //Detecta sin el bot es admin

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
for (let name in global.plugins) {
let plugin = global.plugins[name]
if (!plugin)
continue
if (plugin.disabled)
continue
const __filename = join(___dirname, name)
if (m.sender === this.user.jid) {
continue
}
if (typeof plugin.all === 'function') {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename
})
} catch (e) {
// if (typeof e === 'string') continue
console.error(e)
/*for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
let data = (await conn.onWhatsApp(jid))[0] || {}
if (data.exists)
m.reply(`⧋〘📕 FORMATO ERRONEO 📕〙⧋\n\n❒ 𝗘𝗥𝗥𝗢𝗥:\n\`\`\`${format(e)}\`\`\`\n`.trim(), data.jid)
}*/
}}
if (!opts['restrict'])
if (plugin.tags && plugin.tags.includes('admin')) {
// global.dfail('restrict', m, this)
continue
}
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
let match = (_prefix instanceof RegExp ? // RegExp Mode?
[[_prefix.exec(m.text), _prefix]] :
Array.isArray(_prefix) ? // Array?
_prefix.map(p => {
let re = p instanceof RegExp ? // RegExp in Array?
p :
new RegExp(str2Regex(p))
return [re.exec(m.text), re]
}) :
typeof _prefix === 'string' ? // String?
[[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
[[[], new RegExp]]
).find(p => p[1])
if (typeof plugin.before === 'function') {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}))
continue
}
if (typeof plugin !== 'function')
continue
if ((usedPrefix = (match[0] || '')[0])) {
let noPrefix = m.text.replace(usedPrefix, '')
let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
args = args || []
let _args = noPrefix.trim().split` `.slice(1)
let text = _args.join` `
command = (command || '').toLowerCase()
let fail = plugin.fail || global.dfail // When failed
let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
plugin.command.test(command) :
Array.isArray(plugin.command) ? // Array?
plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
cmd.test(command) :
cmd === command
) :
typeof plugin.command === 'string' ? // String?
plugin.command === command :
false

if (!isAccept) {
continue
}
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['owner-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return // Except this
if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned && !isROwner) return 
if (m.text && user.banned && !isROwner) {
if (user.antispam > 2) return
m.reply(`🚫 Está baneado(a), no puede usar los comandos de este bot!\n\n${user.bannedReason ? `\n💌 *Motivo:* 
${user.bannedReason}` : '💌 *Motivo:* Sin Especificar'}\n\n⚠️ *Si este bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puede exponer su caso en:*\n\n🤍 ${asistencia}`)
user.antispam++        
return
}

//Antispam 2                
if (user.antispam2 && isROwner) return
let time = global.db.data.users[m.sender].spam + 3000
if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`) 
global.db.data.users[m.sender].spam = new Date * 1
}

let hl = _prefix 
let adminMode = global.db.data.chats[m.chat].modoadmin
let mini = `${plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl ||  m.text.slice(0, 1) == hl || plugins.command}`
if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return   
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { //número bot owner
fail('owner', m, this)
continue
}
if (plugin.rowner && !isROwner) { 
fail('rowner', m, this)
continue
}
if (plugin.owner && !isOwner) { 
fail('owner', m, this)
continue
}
if (plugin.mods && !isMods) { 
fail('mods', m, this)
continue
}
if (plugin.premium && !isPrems) { 
fail('premium', m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail('group', m, this)
continue
} else if (plugin.botAdmin && !isBotAdmin) { 
fail('botAdmin', m, this)
continue
} else if (plugin.admin && !isAdmin) { 
fail('admin', m, this)
continue
}
if (plugin.private && m.isGroup) {
fail('private', m, this)
continue
}
if (plugin.register == true && _user.registered == false) { 
fail('unreg', m, this)
continue
}

m.isCommand = true
let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
if (xp > 2000)
m.reply('Chirrido -_-') 
else               
if (!isPrems && plugin.money && global.db.data.users[m.sender].money < plugin.money * 1) {
conn.reply(m.chat, `❮💰❯ 𝗡𝗼 𝘁𝗶𝗲𝗻𝗲𝘀 𝘀𝘂𝗳𝗶𝗰𝗶𝗲𝗻𝘁𝗲𝘀 𝗠𝗲𝗴𝘂𝗖𝗼𝗶𝗻𝘀 𝗽𝗮𝗿𝗮 𝘂𝘀𝗮𝗿 𝗲𝘀𝘁𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼.`, m, rcanal)       
continue     
}

m.exp += xp
if (!isPrems && plugin.cookies && global.db.data.users[m.sender].cookies < plugin.cookies * 1) {
conn.reply(m.chat, `❮🌟❯ 𝗡𝗼 𝘁𝗶𝗲𝗻𝗲𝘀 𝘀𝘂𝗳𝗶𝗰𝗶𝗲𝗻𝘁𝗲𝘀 𝗖𝗼𝗼𝗸𝗶𝗲𝘀 𝗽𝗮𝗿𝗮 𝘂𝘀𝗮𝗿 𝗲𝘀𝘁𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼. 𝗣𝗮𝗿𝗮 𝗰𝗼𝗺𝗽𝗿𝗮𝗿 𝗺𝗮𝘀 𝗖𝗼𝗼𝗸𝗶𝗲𝘀, 𝘂𝘀𝗲 𝗲𝘀𝘁𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼.\n\n• 𝗣𝗼𝗿 𝗘𝗷𝗲𝗺𝗽𝗹𝗼:\n\n*${usedPrefix}buyall*\n*${usedPrefix}buy*`, m, rcanal) 
continue
}


if (plugin.level > _user.level) {
conn.reply(m.chat, `❮📣❯ 𝗥𝗲𝗾𝘂𝗶𝗲𝗿𝗲 𝗲𝗹 𝗻𝗶𝘃𝗲𝗹: *${plugin.level}*\n\n• 𝗧𝘂 𝗻𝗶𝘃𝗲𝗹 𝗮𝗰𝘁𝘂𝗮𝗹 𝗲𝘀: *${_user.level}*\n\n• 𝗨𝘀𝗮 𝗲𝘀𝘁𝗲 𝗰𝗼𝗺𝗮𝗻𝗱𝗼 𝗽𝗮𝗿𝗮 𝘀𝘂𝗯𝗶𝗿 𝗱𝗲 𝗻𝗶𝘃𝗲𝗹:\n*${usedPrefix}levelup*`, m, rcanal)       
continue
}
let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
user,
bot,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename
}
try {
await plugin.call(this, m, extra)
if (!isPrems)
m.cookies = m.cookies || plugin.cookies || false
m.money = m.money || plugin.money || false
} catch (e) {
// Error occured
m.error = e
console.error(e)
if (e) {
let text = format(e)
for (let key of Object.values(global.APIKeys))
text = text.replace(new RegExp(key, 'g'), 'Admin')
if (e.name)
/*for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
let data = (await conn.onWhatsApp(jid))[0] || {}
if (data.exists)
m.reply(`⧋〘📕 𝗘𝗥𝗥𝗢𝗥 │ 𝗙𝗔𝗟𝗟𝗢 📕〙⧋\n\n❒ 𝗘𝗥𝗥𝗢𝗥:\n\`\`\`${format(e)}\`\`\`\n`.trim(), data.jid)
}*/
m.reply(text)
}} finally {

if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra)
} catch (e) {
console.error(e)
}}
if (m.cookies)
conn.reply(m.chat, `Utilizaste *${+m.cookies}* 🍪`, m, fake)
}
if (m.money)
conn.reply(m.chat, `Utilizaste *${+m.money}* 💰`, m, fake)
break
}}} catch (e) {
console.error(e)
} finally {
if (opts['queque'] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
//console.log(global.db.data.users[m.sender])
let user, stats = global.db.data.stats
if (m) { let utente = global.db.data.users[m.sender]
if (utente.muto == true) {
let bang = m.key.id
let cancellazzione = m.key.participant
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione }})
}
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
user.cookies -= m.cookies * 1
user.money -= m.money * 1
}

let stat
if (m.plugin) {
let now = +new Date
if (m.plugin in stats) {
stat = stats[m.plugin]
if (!isNumber(stat.total))
stat.total = 1
if (!isNumber(stat.success))
stat.success = m.error != null ? 0 : 1
if (!isNumber(stat.last))
stat.last = now
if (!isNumber(stat.lastSuccess))
stat.lastSuccess = m.error != null ? 0 : now
} else
stat = stats[m.plugin] = {
total: 1,
success: m.error != null ? 0 : 1,
last: now,
lastSuccess: m.error != null ? 0 : now
}
stat.total += 1
stat.last = now
if (m.error == null) {
stat.success += 1
stat.lastSuccess = now
}}}

try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) {
console.log(m, m.quoted, e)}
let settingsREAD = global.db.data.settings[this.user.jid] || {}  
if (opts['autoread']) await this.readMessages([m.key])
if (settingsREAD.autoread2) await this.readMessages([m.key])  
//await conn.sendPresenceUpdate('composing', m.chat);
//this.sendPresenceUpdate('recording', m.chat);

if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|megumin|megu|a|s)/gi)) {
let emot = pickRandom(["🚩", "🍟", "🔥","✨️", "🌸", "💥", "⭐️", "🌟", "🍂", "🫂", "🍁", "💖", "💞", "💕", "💋"])
if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
}
function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]}
}}

/**
 * Handle groups participants update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate 
 */
export async function participantsUpdate({ id, participants, action }) {
if (opts['self'])
return
// if (id in conn.chats) return // First login will spam
if (this.isInit)
return
if (global.db.data == null)
await loadDatabase()
let chat = global.db.data.chats[id] || {}
let text = ''
switch (action) {
case 'add':
case 'remove':
if (chat.welcome) {
let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
for (let user of participants) {
let pp = global.icons
try {
pp = await this.profilePictureUrl(user, 'image')
} catch (e) {
} finally {
let apii = await this.getFile(pp)                                      
const botTt2 = groupMetadata.participants.find(u => this.decodeJid(u.id) == this.user.jid) || {} 
const isBotAdminNn = botTt2?.admin === "admin" || false
text = (action === 'add' ? (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!').replace('@date', global.botdate).replace('@time', global.bottime).replace('@readMore', global.readMore).replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc?.toString() || '*Ai-Yaemori*\n𝗦𝗶𝗻 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝗰𝗶𝗼𝗻') :
(chat.sBye || this.bye || conn.bye || 'Bye, @user!')).replace('@user', '@' + user.split('@')[0]).replace('@date', global.botdate).replace('@time', global.bottime)

if (chat.antifake && isBotAdminNn && action === 'add') {
const prefijosPredeterminados = [1, 2, 4, 6, 7, 8, 9] // Puedes editar que usuarios deseas que se eliminen si empieza por algunos de los números
const rutaArchivo = './prefijos.json'
let prefijos = []
const existeArchivo = fs.existsSync(rutaArchivo)
if (existeArchivo) {
try {
const contenido = fs.readFileSync(rutaArchivo, 'utf-8')
prefijos = JSON.parse(contenido)
} catch (error) {
console.log('Error "prefijos.json": ', error)
return
}} else {
prefijos = prefijosPredeterminados
}
const comienzaConPrefijo = prefijos.some(prefijo => user.startsWith(prefijo.toString()))
if (comienzaConPrefijo) {
let texto = mid.mAdvertencia + mid.mFake2(user)
await conn.sendMessage(id, { text: texto, mentions: [user] })
let responseb = await conn.groupParticipantsUpdate(id, [user], 'remove')
if (responseb[0].status === "404") return      
}}

let fkontak2 = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${user.split('@')[0]}:${user.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }      
this.sendMessage(id, { text: text, 
contextInfo:{
forwardingScore: 9999999,
isForwarded: true, 
mentionedJid:[user],
"externalAdReply": {
"showAdAttribution": true,
"renderLargerThumbnail": true,
"thumbnail": apii.data, 
"title": [wm, packname, botname].getRandom(),
"containsAutoReply": true,
"mediaType": 1, 
sourceUrl: redes }}}, { quoted: fkontak2 })
apii.data = ''
//this.sendFile(id, apii.data, 'pp.jpg', text, null, false, { mentions: [user] }, { quoted: fkontak2 })
}}}

break
case 'promote':
case 'daradmin':
case 'darpoder':
text = (chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```')
case 'demote':
case 'quitarpoder':
case 'quitaradmin':
if (!text)
text = (chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```')
text = text.replace('@user', '@' + participants[0].split('@')[0])
if (chat.detect)
//this.sendMessage(id, { text, mentions: this.parseMention(text) })
break
}}

/**
 * Handle groups update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate 
 */
export async function groupsUpdate(groupsUpdate) {
if (opts['self'] && !isOwner && !isROwner)
return
for (const groupUpdate of groupsUpdate) {
const id = groupUpdate.id
if (!id) continue
let chats = global.db.data?.chats?.[id], text = ''
if (!chats?.detect) continue
// if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc)
//if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject)
//if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon)
if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke)
if (!text) continue
await this.sendMessage(id, { text, mentions: this.parseMention(text) })
}}

export async function callUpdate(callUpdate) {
let isAnticall = global.db.data.settings[this.user.jid].antiCall  
if (!isAnticall) return
for (let nk of callUpdate) { 
if (nk.isGroup == false) {
if (nk.status == "offer") {
let callmsg = await this.reply(nk.from, `❮📣❯ 𝗛𝗼𝗹𝗮 *@${nk.from.split('@')[0]}*, 𝙡𝙖𝙨 ${nk.isVideo ? '𝗹𝗹𝗮𝗺𝗮𝗱𝗮𝘀' : '𝘃𝗶𝗱𝗲𝗼 𝗹𝗹𝗮𝗺𝗮𝗱𝗮𝘀'} 𝗻𝗼 𝗲𝘀𝘁𝗮𝗻 𝗽𝗲𝗿𝗺𝗶𝘁𝗶𝗱𝗮𝘀 𝗲𝗻 𝗲𝘀𝘁𝗲 𝗯𝗼𝘁.\n\n• 𝗘𝗻 𝗰𝗮𝘀𝗼 𝗱𝗲 𝘂𝗻 𝗲𝗿𝗿𝗼𝗿, 𝗰𝗼𝗻𝘁𝗮𝗰𝘁𝗮 𝗮𝗹 𝗽𝗿𝗼𝗽𝗶𝗲𝘁𝗮𝗿𝗶𝗼:\n• ${creador}`, false, { mentions: [nk.from] })
//let data = global.owner.filter(([id, isCreator]) => id && isCreator)
//await this.sendContact(nk.from, data.map(([id, name]) => [id, name]), false, { quoted: callmsg })
await this.updateBlockStatus(nk.from, 'block')
}}}}

export async function deleteUpdate(message) {
try {
const { fromMe, id, participant } = message
if (fromMe) return 
let msg = this.serializeM(this.loadMessage(id))
let chat = global.db.data.chats[msg?.chat] || {}
if (!chat?.delete) return 
if (!msg) return 
if (!msg?.isGroup) return 
const antideleteMessage = `╭•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊
│❒ 𝗨𝗦𝗨𝗔𝗥𝗜𝗢:
│• @${participant.split`@`[0]}
│
│❒ 𝗔𝗰𝗮𝗯𝗮 𝗱𝗲 𝗲𝗹𝗶𝗺𝗶𝗻𝗮𝗿 𝘂𝗻 𝗺𝗲𝗻𝘀𝗮𝗷𝗲
│𝗿𝗲𝗲𝗻𝘃𝗶𝗮𝗻𝗱𝗼... ⏱️
╰•┈•〘❌ 𝗔𝗡𝗧𝗜 𝗗𝗘𝗟𝗘𝗧𝗘 ❌〙•┈• ◊`.trim();
await this.sendMessage(msg.chat, {text: antideleteMessage, mentions: [participant]}, {quoted: msg})
this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
} catch (e) {
console.error(e)
}}

global.dfail = (type, m, conn) => {
const msg = {
rowner: '「👑」 *Esta función solo puede ser usada por mi creador*\n\n> David-Chian.', 
owner: '「👑」 *Esta función solo puede ser usada por mi desarrollador.', 
mods: '「🤴🏻」 *Esta función solo puede ser usada por mis desarrolladores.*', 
premium: '「🍧」 *Esta función solo es para usuarios Premium.', 
group: '「🐢」 *Esta funcion solo puede ser ejecutada en grupos.*', 
private: '「🍭」 *Esta función solo puede ser usada en chat privado.*', 
admin: '「👑」 *Este comando solo puede ser usado por admins.*', 
botAdmin: '「🚩」 *Para usar esta función debo ser admin.*', 
unreg: '「🍟」 *¡Hey! no estas registrado, registrese para usar esta función*\n\n*/reg nombre.edad*\n\n*_❕ Ejemplo_* : */reg David.23*',
restrict: '「💫」 *Esta característica esta desactivada.*'
}[type];
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))}
const file = global.__filename(import.meta.url, true);

// NO TOCAR
watchFile(file, async () => {
unwatchFile(file);
console.log(chalk.green('Actualizando "handler.js"'));
if (global.reloadHandler) console.log(await global.reloadHandler());

if (global.conns && global.conns.length > 0 ) {
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
for (const userr of users) {
userr.subreloadHandler(false)
}}});