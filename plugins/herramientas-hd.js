import fetch from "node-fetch";
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
  const res = await fetch(`https://api.stellarwa.xyz/tools/upscale?url=${url}`);
  if (!res.ok) return null;

  return Buffer.from(await res.arrayBuffer());
}