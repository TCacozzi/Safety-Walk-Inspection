import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const dbEnabled = !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);

export const supabase = dbEnabled
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
  : null;

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    email: row.email ?? '',
    parentPassword: row.parent_password ?? '',
    approved: row.approved,
  };
}

function rowToSubject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    content: row.content ?? undefined,
    summary: row.summary ?? undefined,
    topics: row.topics ?? undefined,
    questions: row.questions ?? [],
    enabled: row.enabled,
    createdAt: row.created_at,
  };
}

// --- Users ---

export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(rowToUser);
}

export async function createUser({ id, username, password, email, parentPassword, approved }) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      username,
      password,
      email: email || null,
      parent_password: parentPassword || null,
      approved,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToUser(data);
}

export async function findUserByCredentials(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();
  if (error) throw error;
  return rowToUser(data);
}

export async function usernameExists(username) {
  const { data, error } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function findUserByEmail(email) {
  // email is not unique (only username is), so more than one account can
  // share an email address; pick the most recently created match.
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return rowToUser(data?.[0] ?? null);
}

export async function updateUserPassword(userId, password) {
  const { error } = await supabase.from('users').update({ password }).eq('id', userId);
  if (error) throw error;
}

export async function approveUserById(id) {
  const { data, error } = await supabase.from('users').update({ approved: true }).eq('id', id).select().single();
  if (error) throw error;
  return rowToUser(data);
}

export async function removeUserById(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

export async function validateParentPasswordFor(userId, password) {
  const { data, error } = await supabase.from('users').select('parent_password').eq('id', userId).maybeSingle();
  if (error) throw error;
  return !!data?.parent_password && data.parent_password === password;
}

// --- Admin passcode (app-wide config) ---

export async function getAdminPasscodeStatus() {
  const { data, error } = await supabase.from('app_config').select('value').eq('key', 'admin_passcode').maybeSingle();
  if (error) throw error;
  return { configured: !!data };
}

export async function validateAdminPasscode(passcode) {
  const { data, error } = await supabase.from('app_config').select('value').eq('key', 'admin_passcode').maybeSingle();
  if (error) throw error;
  if (!data) return { configured: false, valid: false };
  return { configured: true, valid: data.value === passcode };
}

export async function setAdminPasscode(passcode) {
  const { error } = await supabase
    .from('app_config')
    .upsert({ key: 'admin_passcode', value: passcode }, { onConflict: 'key' });
  if (error) throw error;
}

// --- Subjects ---

export async function getSubjects() {
  const { data, error } = await supabase.from('subjects').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(rowToSubject);
}

export async function createSubject({ id, name }) {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ id, name, questions: [], enabled: false })
    .select()
    .single();
  if (error) throw error;
  return rowToSubject(data);
}

export async function updateSubjectById(id, fields) {
  const update = {};
  if (fields.content !== undefined) update.content = fields.content;
  if (fields.summary !== undefined) update.summary = fields.summary;
  if (fields.topics !== undefined) update.topics = fields.topics;
  if (fields.questions !== undefined) update.questions = fields.questions;
  if (fields.enabled !== undefined) update.enabled = fields.enabled;
  if (fields.name !== undefined) update.name = fields.name;

  const { data, error } = await supabase.from('subjects').update(update).eq('id', id).select().single();
  if (error) throw error;
  return rowToSubject(data);
}

export async function removeSubjectById(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
}

// --- Student profiles ---

export async function getProfile(userId) {
  const { data, error } = await supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { name: data.name, grade: data.grade ?? '', school: data.school ?? '', photo: data.photo ?? '' };
}

export async function saveProfile(userId, profile) {
  const { error } = await supabase.from('student_profiles').upsert(
    {
      user_id: userId,
      name: profile.name,
      grade: profile.grade,
      school: profile.school,
      photo: profile.photo,
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

// --- User progress ---

export async function getProgress(userId) {
  const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) {
    return { userId, totalPoints: 0, subjectScores: {}, lastAccessed: null };
  }
  return {
    userId,
    totalPoints: data.total_points,
    subjectScores: data.subject_scores ?? {},
    lastAccessed: data.last_accessed,
  };
}

export async function saveProgress(userId, progress) {
  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      total_points: progress.totalPoints,
      subject_scores: progress.subjectScores ?? {},
      last_accessed: progress.lastAccessed ?? new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

// --- Quiz progress ---

export async function getQuizProgress(userId, subjectId) {
  const { data, error } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return { currentIndex: 0, answers: {}, results: [] };
  }
  return { currentIndex: data.current_index, answers: data.answers ?? {}, results: data.results ?? [] };
}

export async function saveQuizProgress(userId, subjectId, progress) {
  const { error } = await supabase.from('quiz_progress').upsert(
    {
      user_id: userId,
      subject_id: subjectId,
      current_index: progress.currentIndex,
      answers: progress.answers ?? {},
      results: progress.results ?? [],
    },
    { onConflict: 'user_id,subject_id' }
  );
  if (error) throw error;
}

export async function clearQuizProgress(userId, subjectId) {
  const { error } = await supabase.from('quiz_progress').delete().eq('user_id', userId).eq('subject_id', subjectId);
  if (error) throw error;
}

// --- Password reset tokens ---

export async function createPasswordResetToken(userId) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await supabase.from('password_reset_tokens').delete().eq('user_id', userId);
  const { error } = await supabase
    .from('password_reset_tokens')
    .insert({ token, user_id: userId, expires_at: expiresAt });
  if (error) throw error;

  return token;
}

export async function consumePasswordResetToken(token) {
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  await supabase.from('password_reset_tokens').delete().eq('token', token);

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  return { userId: data.user_id };
}
