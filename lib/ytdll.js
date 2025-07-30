import axios from 'axios'

export async function fetchYouTubeDownload(videoUrl) {
  try {
    const res = await axios.post(
      'https://ytdown.ypnk.dpdns.org/yp/downloader',
      {
        url: videoUrl,
        isMobile: true,
        timestamp: Date.now()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
          'Referer': 'https://ytdown.ypnk.dpdns.org/yp/downloader'
        }
      }
    )

    const data = res.data

    if (!data.success) {
      throw new Error('Error.')
    }

    return {
      success: true,
      title: data.title,
      thumbnail: data.thumbnail,
      downloads: data.downloads.map(d => ({
        type: d.text,
        url: d.url,
        extension: d.originalExtension,
        contentType: d.contentType
      }))
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}