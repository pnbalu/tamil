import { supabase } from './supabase';

const QUESTION_COUNT_MAX = 50;

/** Normalize a DB row so the quiz screen gets question_en, question_ta, options, correctIndex. Exported for group quiz. */
export function normalizeQuestion(row, i) {
  if (!row || typeof row !== 'object') {
    return { id: `q-${i}`, question_en: 'Question', question_ta: '', options: [], correctIndex: 0 };
  }
  const questionEn = row.question_en ?? row.questionEn ?? '';
  const questionTa = row.question_ta ?? row.questionTa ?? '';
  const rawOpts = Array.isArray(row.options) ? row.options : [];
  const opts = rawOpts.slice(0, 4).map((o) => ({
    text_en: String(o?.text_en ?? o?.textEn ?? ''),
    text_ta: o?.text_ta ?? o?.textTa ?? undefined,
    correct: Boolean(o?.correct),
  }));
  // Prefer index from options (which option has correct: true); fallback to DB column (snake or camelCase)
  const fromOpts = opts.findIndex((o) => o.correct);
  const fromCol = Number(row.correct_index ?? row.correctIndex);
  const correctIndex =
    fromOpts >= 0 && fromOpts < 4
      ? fromOpts
      : Math.max(0, Math.min(3, Number.isFinite(fromCol) ? fromCol : 0));
  return {
    id: row.id ?? `q-${i}`,
    question_en: String(questionEn).trim() || 'Question',
    question_ta: questionTa ? String(questionTa).trim() : '',
    options: opts.length >= 2 ? opts : [
      { text_en: 'Option A', text_ta: null, correct: false },
      { text_en: 'Option B', text_ta: null, correct: true },
    ],
    correctIndex,
  };
}

/**
 * Fetch quiz questions from the database (random sample).
 * No AI; questions are stored in public.quiz_questions.
 * @param {{ count: number, level?: string, topic?: string }} opts
 * @returns {Promise<{ questions: Array, error?: string }>}
 */
export async function generateQuizQuestions(opts) {
  const count = Math.max(1, Math.min(QUESTION_COUNT_MAX, Number(opts?.count) || 10));
  const level = opts?.level || 'beginner';
  const topic = opts?.topic ? String(opts.topic).trim() : null;

  try {
    const { data: rows, error } = await supabase.rpc('get_random_quiz_questions', {
      p_count: count,
      p_level: level,
      p_topic: topic || null,
    });

    if (error) {
      return {
        questions: [],
        error: error.message || 'Failed to load questions. Run the quiz seed script to add questions.',
      };
    }
    if (!rows?.length) {
      return {
        questions: [],
        error: 'No questions found. Add questions to the database (e.g. run scripts/seed-quiz-questions.js).',
      };
    }
    const questions = rows.map(normalizeQuestion);
    return { questions, count: questions.length };
  } catch (e) {
    return {
      questions: [],
      error: e?.message || 'Failed to load questions.',
    };
  }
}
