import { supabase } from './supabase';
import { normalizeQuestion } from './quizApi';

const CODE_LENGTH = 6;
const CODE_MAX = 10 ** CODE_LENGTH - 1;
const CODE_MIN = 10 ** (CODE_LENGTH - 1);

/** Generate a numeric room code (e.g. 6 digits) */
function generateRoomCode() {
  return String(Math.floor(CODE_MIN + Math.random() * (CODE_MAX - CODE_MIN + 1)));
}

/**
 * Create a group quiz room. Generates unique code and adds creator as first participant.
 * @param {{ creatorId: string, quizType: string, level: string, questionsCount: number, timePerQuestionSeconds: number }}
 * @returns {{ room?: object, code?: string, error?: string }}
 */
export async function createRoom(opts) {
  const creatorId = opts?.creatorId;
  const quizType = opts?.quizType ?? 'ta_to_en';
  const level = opts?.level ?? 'beginner';
  const count = Number(opts?.questionsCount ?? opts?.questions_count ?? 10);
  const questionsCount = Math.max(1, Math.min(50, count));
  const timePerQuestionSeconds = Math.max(10, Math.min(120, Number(opts?.timePerQuestionSeconds ?? opts?.time_per_question_seconds) || 30));

  if (!creatorId) return { error: 'Creator ID required' };

  let code = generateRoomCode();
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const insertPayload = {
      code,
      creator_id: creatorId,
      quiz_type: quizType,
      level,
      questions_count: questionsCount,
      time_per_question_seconds: timePerQuestionSeconds,
      status: 'waiting',
    };
    const { data: room, error } = await supabase
      .from('quiz_rooms')
      .insert(insertPayload)
      .select()
      .single();

    if (!error) {
      const { error: joinErr } = await supabase.from('quiz_room_participants').insert({
        room_id: room.id,
        user_id: creatorId,
      });
      if (joinErr) {
        await supabase.from('quiz_rooms').delete().eq('id', room.id);
        return { error: joinErr.message || 'Failed to add creator to room' };
      }
      return { room, code };
    }
    if (error.code === '23505') {
      code = generateRoomCode();
      continue;
    }
    return { error: error.message || 'Failed to create room' };
  }
  return { error: 'Could not generate unique code. Try again.' };
}

/**
 * Join a room by code.
 * @param {{ code: string, userId: string }}
 * @returns {{ room?: object, error?: string }}
 */
export async function joinRoom(code, userId) {
  const trimmed = String(code || '').trim();
  if (!trimmed) return { error: 'Enter the room code' };
  if (!userId) return { error: 'You must be signed in to join' };

  const { data: room, error: roomErr } = await supabase.rpc('get_quiz_room_by_code', { p_code: trimmed });
  if (roomErr || !room) return { error: roomErr?.message || 'Invalid or expired code. Ask your friend for the number.' };

  const { error: insertErr } = await supabase.from('quiz_room_participants').insert({
    room_id: room.id,
    user_id: userId,
  });
  if (insertErr) {
    if (insertErr.code === '23505') return { room, error: null };
    return { error: insertErr.message || 'Could not join room' };
  }
  return { room };
}

/**
 * Fetch room by id (for lobby).
 */
export async function getRoom(roomId) {
  const { data, error } = await supabase.from('quiz_rooms').select('*').eq('id', roomId).single();
  if (error) return { room: null, error: error.message };
  return { room: data };
}

/**
 * Fetch participants with profile names.
 */
export async function getParticipants(roomId) {
  const { data: rows, error } = await supabase
    .from('quiz_room_participants')
    .select('id, user_id, joined_at, score, total_questions, finished_at')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) return { participants: [], error: error.message };
  const userIds = [...new Set((rows || []).map((r) => r.user_id))];
  if (userIds.length === 0) return { participants: rows || [] };

  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
  const byId = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

  const participants = (rows || []).map((r) => ({
    ...r,
    displayName: byId[r.user_id]?.full_name || byId[r.user_id]?.email || 'Player',
  }));
  return { participants };
}

/**
 * Add an invite (store friend's phone). Does not send SMS.
 */
export async function addInvite(roomId, phoneNumber, invitedBy) {
  const phone = String(phoneNumber || '').trim().replace(/\s/g, '');
  if (!phone) return { error: 'Enter a phone number' };
  const { error } = await supabase.from('quiz_room_invites').insert({
    room_id: roomId,
    phone_number: phone,
    invited_by: invitedBy,
  });
  return { error: error?.message };
}

/**
 * List invites for a room.
 */
export async function getInvites(roomId) {
  const { data, error } = await supabase
    .from('quiz_room_invites')
    .select('id, phone_number, invited_at')
    .eq('room_id', roomId)
    .order('invited_at', { ascending: false });
  if (error) return { invites: [], error: error.message };
  return { invites: data || [] };
}

/**
 * Start the quiz (creator only). Assigns question_ids and sets status = in_progress.
 */
export async function startRoom(roomId) {
  const { data, error } = await supabase.rpc('start_quiz_room', { p_room_id: roomId });
  if (error) return { ok: false, error: error.message };
  const result = data && typeof data === 'object' ? data : {};
  if (result.error) return { ok: false, error: result.error };
  return { ok: true, questionIds: result.question_ids || [] };
}

/**
 * Load questions for a room (after start). Uses room's question_ids.
 */
export async function getQuestionsForRoom(roomId) {
  const { room, error: roomErr } = await getRoom(roomId);
  if (roomErr || !room) return { questions: [], error: roomErr || 'Room not found' };
  const ids = room.question_ids;
  if (!ids || !Array.isArray(ids) || ids.length === 0) return { questions: [], error: 'Quiz not started yet' };

  const { data: rows, error } = await supabase.rpc('get_quiz_questions_by_ids', { p_ids: ids });
  if (error) return { questions: [], error: error.message };
  const questions = (rows || []).map((row, i) => normalizeQuestion(row, i));
  return { questions };
}

/**
 * Submit score when user finishes the quiz.
 */
export async function submitScore(roomId, userId, { score, totalQuestions, timeTakenSeconds }) {
  const { error } = await supabase
    .from('quiz_room_participants')
    .update({
      score: score ?? 0,
      total_questions: totalQuestions ?? 0,
      time_taken_seconds: timeTakenSeconds ?? 0,
      finished_at: new Date().toISOString(),
    })
    .eq('room_id', roomId)
    .eq('user_id', userId);
  return { error: error?.message };
}

/**
 * Mark room as completed (e.g. when showing results).
 */
export async function completeRoom(roomId) {
  const { error } = await supabase
    .from('quiz_rooms')
    .update({ status: 'completed' })
    .eq('id', roomId);
  return { error: error?.message };
}

/**
 * Leaderboard for the room (participants with scores, ordered by score desc).
 */
export async function getLeaderboard(roomId) {
  const { data: rows, error } = await supabase
    .from('quiz_room_participants')
    .select('user_id, score, total_questions, time_taken_seconds, finished_at')
    .eq('room_id', roomId)
    .not('score', 'is', null)
    .order('score', { ascending: false });

  if (error) return { leaderboard: [], error: error.message };
  const userIds = [...new Set((rows || []).map((r) => r.user_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds);
  const byId = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

  const leaderboard = (rows || []).map((r, index) => ({
    rank: index + 1,
    userId: r.user_id,
    displayName: byId[r.user_id]?.full_name || byId[r.user_id]?.email || 'Player',
    score: r.score,
    totalQuestions: r.total_questions,
    timeTakenSeconds: r.time_taken_seconds,
  }));
  return { leaderboard };
}
