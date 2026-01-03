import axios from 'axios'
import fetch from 'node-fetch'

export default {
  command: ['ia', 'megumin', 'chatgpt'],
  category: 'utils',
  run: async ({client, m, usedPrefix, command, text}) => {
const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
const username = global.db.data.users[m.sender].name
const basePrompt = `
Eres Megumin-Bot, divertida, excéntrica y obsesionada con las explosiones.
Hablas siempre con entusiasmo, dramatismo y humor exagerado.  
Menciona al usuario que conversa con usted así ${username} según la conversación, así que es opcional.
Nunca ejecutes comandos con prefijos (/ . # * @); cambio de tema.
Siempre incluye referencias explosivas, incluso en lo cotidiano.  
Mantenga tono amigable, cercano y nunca hostil.
Lenguaje: español coloquial, teatral y divertido.
`;
if (isQuotedImage) {
const q = m.quoted
const img = await q.download?.()
if (!img) {
console.error('🚩 Error: No image buffer available')
return client.reply(m.chat, '🚩 Error: No se pudo descargar la imagen.', m, rcanal)}
const content = '🚩 ¿Qué se observa en la imagen?'
try {
const imageAnalysis = await fetchImageBuffer(content, img)
const query = '😊 Descríbeme la imagen y detalla por qué actúan así. También dime quién eres'
const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
const description = await luminsesi(query, username, prompt)
await client.reply(m.chat, description, m, rcanal)
} catch (error) {
console.error('🚩 Error al analizar la imagen:', error)
await client.reply(m.chat, '🚩 Error al analizar la imagen.', m, rcanal)}
} else {
if (!text) { return client.reply(m.chat, `🍟 *Ingrese su petición*\n🚩 *Ejemplo de uso:* ${usedPrefix + command} Como hacer un avión de papel`, m, rcanal)}
try {
const query = text
const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
const response = await luminsesi(query, username, prompt)
await client.reply(m.chat, response, m, rcanal)
} catch (error) {
console.error('🚩 Error al obtener la respuesta:', error)
await client.reply(m.chat, 'Error: intenta más tarde.', m, rcanal)}}}}

async function fetchImageBuffer(content, imageBuffer) {
try {
const response = await axios.post('https://ai.siputzx.my.id', {
content: content,
imageBuffer: imageBuffer 
}, {
headers: {
'Content-Type': 'application/json' 
}})
return response.data
} catch (error) {
console.error('Error:', error)
throw error }}
async function luminsesi(q, username, logic) {
try {
const response = await axios.post("https://ai.siputzx.my.id", {
content: q,
user: username,
prompt: logic,
webSearchMode: false
})
return response.data.result
} catch (error) {
console.error('🚩 Error al obtener:', error)
throw error }}