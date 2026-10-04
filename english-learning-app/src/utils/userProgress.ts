import type { ExerciseResult, UserProgress } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getUserProgress(userId: string): Promise<UserProgress> {
  const res = await fetch(`${API_URL}/api/progress/${userId}`);
  if (!res.ok) throw new Error('Erro ao buscar progresso');
  const data = await res.json();
  return {
    userId,
    currentDay: 1,
    completedDays: [],
    scores: {},
    totalPoints: data.totalPoints ?? 0,
    lastAccessed: data.lastAccessed ? new Date(data.lastAccessed) : new Date(),
    subjectScores: data.subjectScores ?? {},
  };
}

export async function saveUserProgress(userId: string, progress: UserProgress): Promise<void> {
  await fetch(`${API_URL}/api/progress/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      totalPoints: progress.totalPoints,
      subjectScores: progress.subjectScores ?? {},
      lastAccessed: progress.lastAccessed,
    }),
  });
}

interface SavedQuizProgress {
  currentIndex: number;
  answers: Record<string, string>;
  results: ExerciseResult[];
}

export async function getQuizProgress(userId: string, subjectId: string): Promise<SavedQuizProgress> {
  const res = await fetch(`${API_URL}/api/quiz-progress/${userId}/${subjectId}`);
  if (!res.ok) return { currentIndex: 0, answers: {}, results: [] };
  const data = await res.json();
  return {
    currentIndex: data.currentIndex ?? 0,
    answers: data.answers ?? {},
    results: data.results ?? [],
  };
}

export async function saveQuizProgress(
  userId: string,
  subjectId: string,
  progress: SavedQuizProgress
): Promise<void> {
  await fetch(`${API_URL}/api/quiz-progress/${userId}/${subjectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  });
}

export async function clearQuizProgress(userId: string, subjectId: string): Promise<void> {
  await fetch(`${API_URL}/api/quiz-progress/${userId}/${subjectId}`, { method: 'DELETE' });
}
