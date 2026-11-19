import nextEnv from '@next/env';
import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

nextEnv.loadEnvConfig(process.cwd());
const app = initializeApp({
  credential: process.env.FIREBASE_ADMIN_CREDENTIALS
    ? cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)) : applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = getStorage(app).bucket();
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.vtt': 'text/vtt' };
const manifestPath = 'src/lib/media/assets.json';
let manifest = {};
try { manifest = JSON.parse(await readFile(manifestPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }

async function upload(path, url) {
  const bytes = await readFile(path);
  const type = types[extname(path)];
  if (!type) throw new Error(`Unsupported media: ${path}`);
  const hash = createHash('sha256').update(bytes).digest('hex');
  const object = `site/assets/${hash}${extname(path)}`;
  const file = bucket.file(object);
  try {
    await file.save(bytes, { resumable: bytes.length > 5_000_000, contentType: type,
      preconditionOpts: { ifGenerationMatch: 0 },
      metadata: { cacheControl: 'private, max-age=3600', metadata: { sha256: hash } } });
  } catch (error) { if (error.code !== 412) throw error; }
  const [metadata] = await file.getMetadata();
  if (Number(metadata.size) !== bytes.length || metadata.metadata?.sha256 !== hash)
    throw new Error(`Cloud verification failed: ${url}`);
  manifest[url] = { object, type, size: bytes.length, sha256: hash };
  console.log(`Verified ${url}: ${bytes.length} bytes`);
}

async function walk(root, prefix = '/assets') {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(root, entry.name), url = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await walk(path, url);
    else if (entry.isFile()) await upload(path, url);
  }
}

// Optional source directory lets archived originals be rechecked without shipping them.
await walk(process.argv[2] ?? 'public/assets');
for (const name of ['icon.png', 'apple-icon.png']) {
  try { await upload(`src/app/${name}`, `/${name}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
// This original was already migrated before the asset library was introduced.
const [oral] = await bucket.file('site/oral-appliance-demo-original.mp4').getMetadata();
manifest['/assets/videos/oral-appliance-demo-original.mp4'] = {
  object: 'site/oral-appliance-demo-original.mp4', type: 'video/mp4', size: Number(oral.size),
};
await mkdir('src/lib/media', { recursive: true });
await writeFile(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n');
console.log(`Cloud media registry: ${Object.keys(manifest).length} verified files.`);
