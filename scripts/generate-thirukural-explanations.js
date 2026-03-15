/**
 * Generate long explanations (1000–3000 words) for all 1330 Thirukural verses.
 * Writes to thirukural-explanations.json incrementally (resumable).
 *
 * No OpenAI key? Use a local LLM (Ollama) instead — no API key needed.
 *
 * Usage:
 *   npm run generate:thirukural-explanations
 *
 * Option 1 – OpenAI (needs API key in .env):
 *   OPENAI_API_KEY=sk-...
 *
 * Option 2 – Local Ollama (no API key):
 *   Install Ollama from https://ollama.com, then run: ollama pull llama3.2
 *   GEN_API_URL=http://localhost:11434/v1/chat/completions
 *   GEN_MODEL=llama3.2
 *   (Or leave GEN_API_URL unset; script will try Ollama at localhost:11434 by default if no key.)
 */
const fs = require('fs');
const path = require('path');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEN_API_URL = process.env.GEN_API_URL || '';
const GEN_MODEL = process.env.GEN_MODEL || 'llama3.2';
const KURAL_JSON_URL = process.env.THIRUKKURAL_JSON_URL || 'https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json';
const DEFAULT_OUTPUT = path.join(__dirname, 'data', 'thirukural-explanations.json');
const DELAY_MS = parseInt(process.env.GEN_DELAY_MS || '4000', 10);
const OLLAMA_DEFAULT = 'http://localhost:11434/v1/chat/completions';

function parseArgs() {
  const args = process.argv.slice(2);
  let start = 1;
  let end = 1330;
  let delay = DELAY_MS;
  let output = DEFAULT_OUTPUT;
  for (const a of args) {
    if (a.startsWith('--start=')) start = Math.max(1, parseInt(a.slice(8), 10));
    else if (a.startsWith('--end=')) end = Math.min(1330, parseInt(a.slice(6), 10));
    else if (a.startsWith('--delay=')) delay = Math.max(1000, parseInt(a.slice(8), 10));
    else if (a.startsWith('--output=')) output = a.slice(9);
  }
  return { start, end, delay, output };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchKuralList() {
  const res = await fetch(KURAL_JSON_URL);
  if (!res.ok) throw new Error(`Failed to fetch kurals: ${res.status}`);
  const data = await res.json();
  const list = data.kural || data;
  if (!Array.isArray(list) || list.length === 0) throw new Error('No kural array in JSON');
  const byId = {};
  for (const k of list) {
    const id = k.Number ?? k.number ?? 0;
    if (id >= 1 && id <= 1330) {
      byId[id] = {
        id,
        line1: (k.Line1 || k.line1 || '').trim(),
        line2: (k.Line2 || k.line2 || '').trim(),
        translation: (k.Translation || k.translation || k.meaning_en || '').trim(),
        explanation_short: (k.explanation || '').trim(),
      };
    }
  }
  return byId;
}

function loadExisting(outputPath) {
  if (!fs.existsSync(outputPath)) return {};
  const raw = fs.readFileSync(outputPath, 'utf8');
  try {
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null ? data : {};
  } catch {
    return {};
  }
}

function saveOutput(outputPath, data) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 0), 'utf8');
}

function buildPrompt(kural) {
  return `You are an expert on the Thirukural (Tirukkural), the classic Tamil work by Thiruvalluvar. Write a single, continuous long-form explanation in English for the following verse.

Thirukural verse number: ${kural.id}
Tamil line 1: ${kural.line1}
Tamil line 2: ${kural.line2}
English translation: ${kural.translation}
${kural.explanation_short ? `Short explanation (for context): ${kural.explanation_short}` : ''}

Requirements:
- Length: 1000 to 3000 words. Do not use bullet points or section headers; write in flowing prose.
- Explain the meaning, context, and moral or spiritual significance of the verse.
- Include how it fits into the Thirukural's overall structure (chapter theme when relevant) and Tamil/South Indian tradition.
- Use clear, formal English. No placeholders or meta-commentary.
- Output only the explanation text, no title or preamble.`;
}

function getLLMConfig() {
  if (OPENAI_API_KEY) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      maxTokens: 4096,
    };
  }
  const url = GEN_API_URL || OLLAMA_DEFAULT;
  return {
    url,
    headers: { 'Content-Type': 'application/json' },
    model: GEN_MODEL,
    maxTokens: 4096,
  };
}

async function callLLM(prompt, config) {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: 0.6,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) throw new Error('No content in API response');
  return choice.message.content.trim();
}

async function main() {
  const config = getLLMConfig();
  if (OPENAI_API_KEY) {
    console.log('Using OpenAI, model:', config.model);
  } else {
    console.log('Using local/no-key LLM:', config.url, 'model:', config.model);
    console.log('(Install Ollama from https://ollama.com and run: ollama pull', config.model + ')');
  }

  const { start, end, delay, output } = parseArgs();
  console.log('Fetching kural list from', KURAL_JSON_URL);
  const kuralById = await fetchKuralList();
  console.log('Loaded', Object.keys(kuralById).length, 'kurals');

  const out = loadExisting(output);
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let id = start; id <= end; id++) {
    if (out[String(id)] && out[String(id)].length > 500) {
      skipped++;
      if (skipped % 100 === 0) console.log('Skipped (already have):', skipped);
      continue;
    }
    const kural = kuralById[id];
    if (!kural) {
      console.warn('Kural', id, 'not in source list, skipping');
      continue;
    }
    try {
      const prompt = buildPrompt(kural);
      const text = await callLLM(prompt, config);
      if (text && text.length >= 400) {
        out[String(id)] = text;
        saveOutput(output, out);
        generated++;
        console.log('Generated', id, '(length', text.length, ') total:', generated);
      } else {
        console.warn('Kural', id, 'response too short, skipping');
        failed++;
      }
    } catch (e) {
      console.error('Kural', id, e.message);
      failed++;
      if (e.message && e.message.includes('rate limit')) {
        console.log('Rate limited; waiting 60s...');
        await sleep(60000);
        id--;
        continue;
      }
    }
    if (id < end) await sleep(delay);
  }

  console.log('Done. Generated:', generated, 'Skipped:', skipped, 'Failed:', failed);
  console.log('Output:', output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
