import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🔍 *Ejemplo de uso:* \n/pinterest Akame');

  try {
    let res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
    let json = await res.json();
    if (!json.length) return m.reply('❌ No se encontraron imágenes.');

    let sections = json.slice(0, 10).map((img, i) => ({
      title: `🔹 Imagen ${i + 1}`,
      rows: [
        {
          title: `📷 Ver imagen`,
          description: `🔗 Click para abrir`,
          rowId: img.image_large_url
        }
      ]
    }));

    let listMessage = {
      text: `🔎 *Resultados de búsqueda para:* _${text}_`,
      footer: 'Selecciona una imagen para ver',
      title: '🖼️ Imágenes encontradas',
      buttonText: 'Ver imágenes',
      sections
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply('❌ Ocurrió un error al buscar imágenes.');
  }
};

handler.command = /^(pinterest|imgsearch)$/i;
export default handler;