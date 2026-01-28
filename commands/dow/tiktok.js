import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: async ({ client, m, args }) => {

    if (!args.length || !args[0].includes("tiktok.com")) {
      return m.reply(`✎ Por favor, ingresa un enlace válido de TikTok.\n\nEjemplo: *!tiktok* https://vt.tiktok.com/...`);
    }

    const url = args[0];
    const apikey = "freeApikey";

    try {
      const apiUrl = `https://anabot.my.id/api/download/tiktok?url=${encodeURIComponent(url)}&apikey=${apikey}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);
      
      const json = await res.json();

      if (!json.success || !json.data?.result) {
        return m.reply(`💣 No se pudo obtener el video. Verifica que el enlace sea público.`);
      }

      const { 
        username, 
        description, 
        nowatermark, 
        video, 
        audio 
      } = json.data.result;

      const caption = `ೀ܀⊹˙┆✽ " *Tіk𝗍᥆k ᗪ᥆ᥕᥒᥣ᥆ᥲძ* 𝜗𝜚┆˙⊹܀ೀ

⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Usuario:* ${username || 'Desconocido'}
⭒̇ㅤ֯◌ 〃 ׄ 〬〿 *Descripción:* ${description || 'Sin descripción'}`.trim();

      const videoUrl = nowatermark || video;

      if (videoUrl) {
        await client.sendMessage(m.chat, { 
          video: { url: videoUrl }, 
          caption 
        }, { quoted: m });
      } else {
        await m.reply(`💣 No se encontró un enlace de descarga de video.`);
      }

    } catch (e) {
      console.error(e);
      await m.reply("⚠️ El servicio de descarga no está disponible en este momento.");
    }
  },
};
