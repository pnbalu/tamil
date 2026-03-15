import { supabase } from './supabase';

/**
 * Fetch all 109 Aathichudi verses (by Avvaiyar), ordered by id.
 */
export async function getAllVerses() {
  const { data, error } = await supabase
    .from('aathichudi')
    .select('id, line_ta, meaning_en, explanation_en, sort_order')
    .order('sort_order', { ascending: true });
  if (error) return { verses: [], error: error.message };
  return { verses: data || [] };
}

/**
 * Fetch a single verse by id (1–109).
 */
export async function getVerseById(verseId) {
  const { data, error } = await supabase
    .from('aathichudi')
    .select('id, line_ta, meaning_en, explanation_en, sort_order')
    .eq('id', verseId)
    .single();
  if (error) return { verse: null, error: error.message };
  return { verse: data };
}

/**
 * Fetch random verses for quiz. difficulty: easy (1 word), medium (2), hard (3).
 */
export async function getRandomVersesForPlay(count = 10) {
  const { data: list, error } = await supabase
    .from('aathichudi')
    .select('id, line_ta, meaning_en')
    .order('id');
  if (error || !list?.length) return { verses: [], error: error?.message || 'No verses' };
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return { verses: shuffled.slice(0, Math.min(count, list.length)) };
}

/** Get words from a line (split on spaces). */
export function getWordsFromLine(line) {
  if (!line || typeof line !== 'string') return [];
  return line.trim().split(/\s+/).filter((w) => w.length > 0);
}

/**
 * Build display parts and blanks for a line. wordsToHide: 1 | 2 | 3.
 */
export function buildBlanksForLine(line, wordsToHide, seed = 0) {
  const words = getWordsFromLine(line);
  if (words.length === 0) return { displayParts: [], blanks: [] };
  if (wordsToHide >= words.length) wordsToHide = Math.max(1, words.length - 1);
  const indices = [...Array(words.length).keys()];
  const rng = (i) => ((seed + i) * 9301 + 49297) % 233280;
  for (let i = indices.length - 1; i > 0; i--) {
    const j = rng(i) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const blankIndices = indices.slice(0, wordsToHide).sort((a, b) => a - b);
  const displayParts = [];
  const blanks = [];
  let last = 0;
  for (const idx of blankIndices) {
    if (idx > last) displayParts.push({ type: 'text', value: words.slice(last, idx).join(' ') });
    displayParts.push({ type: 'blank', blankIndex: blanks.length });
    blanks.push({ correctWord: words[idx], position: idx });
    last = idx + 1;
  }
  if (last < words.length) displayParts.push({ type: 'text', value: words.slice(last).join(' ') });
  return { displayParts, blanks };
}

/** Word pool for wrong options (from other verses). */
export async function getWordPoolForOptions(limit = 60, excludeWords = []) {
  const excludeSet = new Set(excludeWords.map((w) => (w || '').trim()));
  const { data } = await supabase.from('aathichudi').select('line_ta').limit(150);
  const words = new Set();
  (data || []).forEach((row) => {
    getWordsFromLine(row.line_ta).forEach((w) => {
      if (!excludeSet.has(w)) words.add(w);
    });
  });
  return [...words].sort(() => Math.random() - 0.5).slice(0, limit);
}
