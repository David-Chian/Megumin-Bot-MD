import FormData from "form-data";
import Jimp from "jimp";
const handler = async (m, {conn, usedPrefix, command}) => {
 try {    
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || "";
  if (!mime) return m.reply(`🚩 Envie una imagen o responda a la imagen utilizando el comando: ${usedPrefix + command}`);
  if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`🍂 El formato del archivo (${mime}) no es compatible, envía o responda a una imagen`);
  conn.reply(m.chat, '🚩 Mejorando la calidad de la imagen....', m, {
  contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
  title: packname,
  body: wm,
  previewType: 0, thumbnail: icons,
  sourceUrl: channel }}})
  let img = await q.download?.();
  let pr = await remini(img, "enhance");
  conn.sendMessage(m.chat, {image: pr}, {quoted: fkontak});
 } catch {
 return m.reply("🚩 Ocurrió un error");
 }
};
handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.group = true;
handler.register = true
handler.command = ["remini", "hd", "enhance"];
export default handler;

async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"];
    if (availableOperations.includes(operation)) {
      operation = operation;
    } else {
      operation = availableOperations[0];
    }
    const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro";
    const formData = new FormData();
    formData.append("image", Buffer.from(imageData), {filename: "enhance_image_body.jpg", contentType: "image/jpeg"});
    formData.append("model_version", 1, {"Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8"});
    formData.submit({url: baseUrl, host: "inferenceengine.vyro.ai", path: "/" + operation, protocol: "https:", headers: {"User-Agent": "okhttp/4.9.3", Connection: "Keep-Alive", "Accept-Encoding": "gzip"}},
      function (err, res) {
        if (err) reject(err);
        const chunks = [];
        res.on("data", function (chunk) {chunks.push(chunk)});
        res.on("end", function () {resolve(Buffer.concat(chunks))});
        res.on("error", function (err) {
        reject(err);
        });
      },
    );
  });
}



/*import fetch from "node-fetch";
import FormData from "form-data";

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m;
    const mime = q.mimetype || (q.msg ? q.msg.mimetype : '');

    if (!mime) return m.reply("Por favor, responde a una imagen que deseas mejorar.");
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`El formato *${mime}* no es compatible.`);

    const buffer = await q.download();
    const uploadedUrl = await uploadToCatbox(buffer);
    if (!uploadedUrl) throw new Error("No se pudo subir la imagen.");

    const enhancedBuffer = await getEnhancedBuffer(uploadedUrl);
    if (!enhancedBuffer) throw new Error("No se pudo obtener la imagen mejorada.");

    await conn.sendFile(m.chat, enhancedBuffer, "enhanced.png", "", m);
  } catch (e) {
    console.error(e);
    await m.reply(`${e}`);
  }
};

handler.help = ['hd', 'upscale'];
handler.tags = ['utils'];
handler.command = ['hd', 'upscale'];

export default handler;

async function uploadToCatbox(buffer) {
  const body = new FormData()
  body.append("reqtype", "fileupload")
  body.append("fileToUpload", buffer, "image.jpg")

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body,
    headers: body.getHeaders()
  })

  const text = await res.text()
  if (!text.startsWith('https://')) throw new Error("La subida a Catbox falló")
  return text.trim()
}

async function getEnhancedBuffer(url) {
  const res = await fetch(`https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(url)}&apikey=diamond`);
  if (!res.ok) return null;

  return Buffer.from(await res.arrayBuffer());
}*/