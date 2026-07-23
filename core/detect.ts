import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import crypto from 'crypto';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const thresholds = { Porn: 0.60, Hentai: 0.65, Sexy: 0.85 };
const classlabels = { Porn: 'Contenido explícito', Hentai: 'Contenido explícito (anime)', Sexy: 'Contenido muy provocativo', Neutral: 'Contenido seguro', Drawing: 'Dibujo / ilustración' };
const extmimemap = { '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.mov': 'video/quicktime', '.3gp': 'video/3gpp', '.avi': 'video/x-msvideo', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp' };
let model = null;
let tf = null;
let loading = null;
let ready = false;

function findModelPath() {
  const bases = [process.cwd(), path.join(__dirname, '..'), path.join(__dirname, '..', '..')];
  for (const base of bases) {
    const candidate = path.join(base, 'node_modules', 'nsfwjs', 'quant_nsfw_mobilenet');
    if (fs.existsSync(path.join(candidate, 'model.json'))) {
      return 'file://' + candidate + path.sep;
    }
  }
  return null;
}

async function loadModel() {
  if (ready) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      tf = await import('@tensorflow/tfjs');
      const nsfwjs = require('nsfwjs');
      const localPath = findModelPath();
      if (localPath) {
        model = await nsfwjs.load(localPath, { size: 224 });
      } else {
        model = await nsfwjs.load('MobileNetV2', { size: 224 });
        //model = await nsfwjs.load(undefined, { size: 224 });
      }
      ready = true;
      console.log(chalk.gray('[ ✓ ] Modelo DETEC-NSFW inicializado correctamente.'));
    } catch (err) {
      console.error(chalk.red('[ ✖ ] Error al inicializar modelo DETEC-NSFW:'), err?.message);
      ready = false;
    }
  })();
  return loading;
}

loadModel().catch(() => {});
const sharpCache = new Map();
async function bufferToTensor(buffer) {
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  if (sharpCache.has(hash)) return tf.tensor3d(sharpCache.get(hash), [224, 224, 3]);
  const rawPixels = await sharp(buffer).resize(224, 224, { fit: 'cover', position: 'centre', fastShrinkOnLoad: true }).removeAlpha().raw().toBuffer();
  const pixels = new Uint8Array(rawPixels);
  if (sharpCache.size >= 20) sharpCache.delete(sharpCache.keys().next().value);
  sharpCache.set(hash, pixels);
  return tf.tensor3d(pixels, [224, 224, 3]);
}

async function toProcessableBuffer(buffer, mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('video') || m.includes('mp4') || m.includes('3gp') || m.includes('mkv')) {
    return await extractVideoFrame(buffer) ?? null;
  }
  if (m.includes('webp') || m.includes('gif')) {
    return sharp(buffer).jpeg({ quality: 85 }).toBuffer();
  }
  return buffer;
}

async function extractVideoFrame(buffer) {
  try {
    const ff = (await import('fluent-ffmpeg')).default;
    const id = crypto.randomBytes(6).toString('hex');
    const tmpIn = path.join(os.tmpdir(), `nsfw_in_${id}.mp4`);
    const tmpOut = path.join(os.tmpdir(), `nsfw_out_${id}.jpg`);
    fs.writeFileSync(tmpIn, buffer);
    await new Promise((resolve, reject) => {
      ff(tmpIn).outputOptions(['-ss', '00:00:01', '-frames:v', '1', '-q:v', '2']).output(tmpOut).on('end', resolve).on('error', reject).run();
    });
    const frame = fs.readFileSync(tmpOut);
    try { fs.unlinkSync(tmpIn); } catch {}
    try { fs.unlinkSync(tmpOut); } catch {}
    return frame;
  } catch {
    return null;
  }
}

export async function downloadFromUrl(url) {
  const ext = url.split('?')[0].match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() || '';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const headerMime = res.headers.get('content-type') || '';
  const mimeType = extmimemap[ext] || headerMime.split(';')[0].trim() || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, mimeType };
}

export async function detectNSFW(buffer, mimeType) {
  const start = Date.now();
  if (!buffer || buffer.length < 512) {
    return { isNSFW: false, flag: 'SAFE', label: 'Empty', confidence: 0, processingMs: 0, allScores: [] };
  }
  if (!ready) await loadModel();
  if (!model || !tf) {
    return { isNSFW: false, flag: 'UNCERTAIN', label: 'MODEL_NOT_LOADED', confidence: 0, processingMs: Date.now() - start, allScores: [] };
  }
  let tensor = null;
  try {
    const processable = await toProcessableBuffer(buffer, mimeType || 'image/jpeg');
    if (!processable) {
      return { isNSFW: false, flag: 'UNCERTAIN', label: 'FRAME_ERROR', confidence: 0, processingMs: Date.now() - start, allScores: [] };
    }
    tensor = await bufferToTensor(processable);
    const predictions = await model.classify(tensor);
    const allScores = predictions.map(p => ({ label: p.className, score: Math.round(p.probability * 10000) / 100 }));
    let isNSFW = false;
    let topLabel = 'Neutral';
    let topScore = 0;
    for (const p of predictions) {
      const threshold = thresholds[p.className];
      if (threshold !== undefined && p.probability >= threshold && p.probability > topScore) {
        isNSFW = true;
        topLabel = p.className;
        topScore = p.probability;
      }
    }
    if (!isNSFW) {
      const top = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
      topLabel = top.className;
      topScore = top.probability;
    }
    return { isNSFW, flag: isNSFW ? 'NSFW' : 'SAFE', label: classlabels[topLabel] || topLabel, rawLabel: topLabel, confidence: Math.round(topScore * 10000) / 100, processingMs: Date.now() - start, allScores };
  } catch (err) {
    console.error(chalk.red('[ ✖ ] Error en análisis DETEC-NSFW:'), err?.message);
    return { isNSFW: false, flag: 'UNCERTAIN', label: 'ERROR', confidence: 0, processingMs: Date.now() - start, allScores: [] };
  } finally {
    try { tensor?.dispose(); } catch {}
  }
}

export function isModelReady() { return ready; }
export function warmup() { loadModel().catch(() => {}); }
