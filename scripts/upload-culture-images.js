/**
 * Upload culture images from local folders to Supabase Storage and set image_url in DB.
 *
 * Folder layout:
 *   scripts/culture-images/categories/<slug>.jpg   → culture_categories (slug = filename without ext)
 *   scripts/culture-images/items/<slug>.jpg        → culture_items (slug = filename without ext)
 *
 * Category slugs in DB: festivals, food-drink, family-home, nature, etc.
 * Item slugs in DB: e.g. diwali-0, pongal-1 (from seed-culture.js).
 *
 * Run: npm run upload:culture-images
 * Requires: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BUCKET = 'culture-images';
const DIR = path.join(__dirname, 'culture-images');
const CATEGORIES_DIR = path.join(DIR, 'categories');
const ITEMS_DIR = path.join(DIR, 'items');

const EXT = ['.jpg', '.jpeg', '.png', '.webp'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function slugFromFile(name) {
  const ext = path.extname(name).toLowerCase();
  return EXT.includes(ext) ? name.slice(0, -ext.length) : null;
}

function listLocalFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => EXT.includes(path.extname(f).toLowerCase()));
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets && buckets.some((b) => b.name === BUCKET)) return;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error) {
    console.error('Create bucket failed:', error.message);
    process.exit(1);
  }
  console.log('Bucket created:', BUCKET);
}

function getPublicUrl(pathInBucket) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(pathInBucket);
  return data.publicUrl;
}

async function uploadFile(localPath, storagePath) {
  const buf = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return getPublicUrl(storagePath);
}

async function main() {
  await ensureBucket();

  let updated = 0;

  if (fs.existsSync(CATEGORIES_DIR)) {
    const files = listLocalFiles(CATEGORIES_DIR);
    for (const file of files) {
      const slug = slugFromFile(file);
      if (!slug) continue;
      const localPath = path.join(CATEGORIES_DIR, file);
      const storagePath = `categories/${file}`;
      const url = await uploadFile(localPath, storagePath);
      const { error } = await supabase.from('culture_categories').update({ image_url: url }).eq('slug', slug);
      if (error) console.warn('Category update failed:', slug, error.message);
      else {
        console.log('Category:', slug, '→', url.slice(0, 50) + '…');
        updated++;
      }
    }
  } else {
    console.log('No folder:', CATEGORIES_DIR, '(create it and add images to upload)');
  }

  if (fs.existsSync(ITEMS_DIR)) {
    const files = listLocalFiles(ITEMS_DIR);
    for (const file of files) {
      const slug = slugFromFile(file);
      if (!slug) continue;
      const localPath = path.join(ITEMS_DIR, file);
      const storagePath = `items/${file}`;
      const url = await uploadFile(localPath, storagePath);
      const { error } = await supabase.from('culture_items').update({ image_url: url }).eq('slug', slug);
      if (error) console.warn('Item update failed:', slug, error.message);
      else {
        console.log('Item:', slug, '→', url.slice(0, 50) + '…');
        updated++;
      }
    }
  } else {
    console.log('No folder:', ITEMS_DIR, '(create it and add images to upload)');
  }

  console.log('Done. Updated', updated, 'image_url(s).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
