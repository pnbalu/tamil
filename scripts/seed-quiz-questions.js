/**
 * Seed script: insert 5000 quiz questions into public.quiz_questions.
 * Run: node scripts/seed-quiz-questions.js
 * Requires: .env with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * Uses vocabulary.js (500 words × 10 questions = 5000).
 */

// Run with: npx dotenv -e .env -- node scripts/seed-quiz-questions.js
const { createClient } = require('@supabase/supabase-js');

const vocabulary = require('./vocabulary.js');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PHRASINGS = [
  (ta, en) => ({ en: `What does '${ta}' mean?`, ta: `${ta} என்றால் என்ன?` }),
  (ta, en) => ({ en: `What is the meaning of '${ta}'?`, ta: `'${ta}' இன் அர்த்தம் என்ன?` }),
  (ta, en) => ({ en: `Choose the correct meaning of '${ta}'.`, ta: `'${ta}' - சரியான அர்த்தத்தை தேர்ந்தெடு.` }),
  (ta, en) => ({ en: `Which word means "${en}"?`, ta: `"${en}" என்று எது?` }),
  (ta, en) => ({ en: `Select the meaning of '${ta}'.`, ta: `'${ta}' இன் அர்த்தத்தை தேர்ந்தெடு.` }),
  (ta, en) => ({ en: `'${ta}' means ___?`, ta: `'${ta}' என்றால் ___?` }),
  (ta, en) => ({ en: `Identify the meaning of '${ta}'.`, ta: `'${ta}' இன் அர்த்தத்தை கண்டறி.` }),
  (ta, en) => ({ en: `What does the word '${ta}' mean in English?`, ta: `'${ta}' ஆங்கிலத்தில் என்ன?` }),
  (ta, en) => ({ en: `Correct meaning of '${ta}'?`, ta: `'${ta}' - சரியான அர்த்தம்?` }),
  (ta, en) => ({ en: `Meaning of '${ta}' in English?`, ta: `'${ta}' ஆங்கில அர்த்தம்?` }),
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWrongOptions(correctEn, pool, count = 3) {
  const others = pool.filter((w) => w.en !== correctEn);
  const shuffled = shuffle(others);
  return shuffled.slice(0, count).map((w) => ({ text_en: w.en, text_ta: w.ta, correct: false }));
}

function buildQuestion(word, phrasingIndex, level = 'beginner', topic = 'vocabulary') {
  const { ta, en } = word;
  const phrasing = PHRASINGS[phrasingIndex % PHRASINGS.length](ta, en);
  const wrongOpts = pickWrongOptions(en, vocabulary);
  const correctOpt = { text_en: en, text_ta: ta, correct: true };
  const allOpts = shuffle([correctOpt, ...wrongOpts]);
  const correctIndex = allOpts.findIndex((o) => o.correct);

  return {
    question_en: phrasing.en,
    question_ta: phrasing.ta,
    options: allOpts,
    correct_index: correctIndex,
    topic,
    level,
  };
}

const TARGET_QUESTIONS = 5000;
const QUESTIONS_PER_WORD = 10;

function generateAllQuestions() {
  const questions = [];
  const words = vocabulary;
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error('vocabulary.js must export an array of { ta, en }');
  }
  const wordsToUse = words.slice(0, Math.ceil(TARGET_QUESTIONS / QUESTIONS_PER_WORD));
  for (let w = 0; w < wordsToUse.length && questions.length < TARGET_QUESTIONS; w++) {
    for (let p = 0; p < QUESTIONS_PER_WORD && questions.length < TARGET_QUESTIONS; p++) {
      questions.push(buildQuestion(wordsToUse[w], p));
    }
  }
  return questions.slice(0, TARGET_QUESTIONS);
}

const BATCH_SIZE = 100;

async function main() {
  console.log('Generating 5000 questions...');
  const questions = generateAllQuestions();
  console.log(`Generated ${questions.length} questions. Inserting in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('quiz_questions').insert(batch).select('id');
    if (error) {
      console.error('Insert error:', error.message);
      process.exit(1);
    }
    inserted += (data || []).length;
    console.log(`  Inserted ${inserted}/${questions.length}`);
  }

  console.log(`Done. Total rows in quiz_questions: ${inserted}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
