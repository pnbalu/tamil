/**
 * Import long explanations (1000–3000 words each) for 1330 kurals into the DB.
 * Updates thirukural.explanation_en from a JSON file.
 *
 * JSON format (object):  { "1": "long text for kural 1...", "2": "...", ... }
 * Or (array):           [ { "id": 1, "explanation_en": "..." }, ... ]
 *
 * Usage:
 *   node scripts/import-thirukural-explanations.js [path/to/explanations.json]
 *   Default path: scripts/data/thirukural-explanations.json
 *
 * Requires: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DEFAULT_PATH = path.join(__dirname, 'data', 'thirukural-explanations.json');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function loadExplanations(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    return data.reduce((acc, row) => {
      const id = row.id ?? row.kural_id;
      const text = row.explanation_en ?? row.explanation;
      if (id != null && text) acc[String(id)] = text;
      return acc;
    }, {});
  }
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  throw new Error('JSON must be an object (id -> text) or array of { id, explanation_en }');
}

async function main() {
  const filePath = process.argv[2] || DEFAULT_PATH;
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    console.error('Create a JSON file with keys "1".."1330" and values = 1000–3000 word explanation per kural.');
    process.exit(1);
  }

  const explanations = loadExplanations(filePath);
  const ids = Object.keys(explanations).map((k) => parseInt(k, 10)).filter((n) => n >= 1 && n <= 1330);
  console.log('Loaded', ids.length, 'explanations. Updating DB...');

  let updated = 0;
  let failed = 0;
  const BATCH = 50;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    for (const id of chunk) {
      const text = explanations[String(id)];
      if (!text || typeof text !== 'string') continue;
      const { error } = await supabase
        .from('thirukural')
        .update({ explanation_en: text.trim() })
        .eq('id', id);
      if (error) {
        console.error('Kural', id, error.message);
        failed++;
      } else {
        updated++;
      }
    }
    if ((i + BATCH) % 200 === 0 || i + BATCH >= ids.length) {
      console.log('Progress:', Math.min(i + BATCH, ids.length), '/', ids.length);
    }
  }

  console.log('Done. Updated:', updated, 'Failed:', failed);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
