import axios from 'axios';
import FormData from 'form-data';
import { existsSync } from 'fs';
import { basename } from 'path';

export type FareUploadResponse = {
    success: boolean;
    file: {
        code: string;
        filename: string;
        extension: string;
        mimetype: string;
        size: number;
        publicUrl: string;
        source: string;
    };
};
async function uploadToStellarWA(buffer: Buffer, filename: string): Promise<string> {
    const form = new FormData();
    form.append('file', buffer, { filename });

    const res = await axios.post<FareUploadResponse>('https://nube.stellarwa.xyz/upload', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity
    });

    if (!res.data?.success || !res.data?.file?.publicUrl) {
        throw new Error('Respuesta inválida del servidor');
    }

    return res.data.file.publicUrl;
}

async function uploadToCatbox(buffer: Buffer, filename: string): Promise<string> {
    const form = new FormData();
    form.append('userhash', 'cdc63d84aafd23061a73d96fb');
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename });

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity
    });

    const url = res.data?.trim();
    if (typeof url !== 'string' || !url.startsWith('https://')) {
        throw new Error('Catbox falló: ' + url);
    }
    return url;
}

const uploaders = [
    uploadToStellarWA,
    uploadToCatbox,
];

interface UploadResult {
    url: string;
    filename: string;
}

export async function upload(input: string | Buffer, filename?: string): Promise<UploadResult> {
    if (!input) throw new Error('Input vacío');

    let buffer: Buffer;
    let finalName = filename;

    if (Buffer.isBuffer(input)) {
        buffer = input;
        finalName = filename || 'file.bin';
    } else if (typeof input === 'string') {
        if (input.startsWith('http')) {
            const res = await axios.get(input, { responseType: 'arraybuffer' });
            buffer = Buffer.from(res.data);
            const ext = input.split('?')[0].split('.').pop()?.slice(0, 5) || 'bin';
            finalName = filename || `file.${ext}`;
        } else {
            if (!existsSync(input)) throw new Error('Archivo no encontrado: ' + input);
            const fs = await import('fs/promises');
            buffer = await fs.readFile(input);
            finalName = filename || basename(input);
        }
    } else {
        throw new Error('Input inválido — usa Buffer, ruta o URL');
    }

    const errors: string[] = [];
    for (const uploader of uploaders) {
        try {
            const url = await uploader(buffer, finalName);
            return { url, filename: finalName };
        } catch (e: any) {
            console.warn(`[upload] ${uploader.name} falló:`, e.message);
            errors.push(`${uploader.name}: ${e.message}`);
        }
    }

    throw new Error('Todos los servicios fallaron:\n' + errors.join('\n'));
}
