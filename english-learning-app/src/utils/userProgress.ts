import type { ExerciseResult, UserProgress } from '../types';

const progressKey = (userId: string) => `userProgress_${userId}`;

export function getUserProgress(userId: string): UserProgress {
  const saved = localStorage.getItem(progressKey(userId));
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fall through to default below
    }
  }

  // Migrate the old single-shared progress to the first user who claims it.
  const legacy = localStorage.getItem('lorenzoDynamicProgress');
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const migrated: UserProgress = { ...parsed, userId };
      saveUserProgress(userId, migrated);
      localStorage.removeItem('lorenzoDynamicProgress');
      return migrated;
    } catch {
      // fall through to default below
    }
  }

  return {
    userId,
    currentDay: 1,
    completedDays: [],
    scores: {},
    totalPoints: 0,
    lastAccessed: new Date(),
    subjectScores: {},
  };
}

export function saveUserProgress(userId: string, progress: UserProgress) {
  localStorage.setItem(progressKey(userId), JSON.stringify(progress));
}

interface SavedQuizProgress {
  currentIndex: number;
  answers: Record<string, string>;
  results: ExerciseResult[];
}

const quizProgressKey = (userId: string, subjectId: string) => `quizProgress_${userId}_${subjectId}`;

export function getQuizProgress(userId: string, subjectId: string): SavedQuizProgress {
  const key = quizProgressKey(userId, subjectId);
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        currentIndex: parsed.currentIndex ?? 0,
        answers: parsed.answers ?? {},
        results: parsed.results ?? [],
      };
    } catch {
      // fall through to default below
    }
  }

  // Migrate the old per-subject (not per-user) progress to the first user who opens it.
  const legacyKey = `quizProgress_${subjectId}`;
  const legacy = localStorage.getItem(legacyKey);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const migrated: SavedQuizProgress = {
        currentIndex: parsed.currentIndex ?? 0,
        answers: parsed.answers ?? {},
        results: parsed.results ?? [],
      };
      localStorage.setItem(key, JSON.stringify(migrated));
      localStorage.removeItem(legacyKey);
      return migrated;
    } catch {
      // fall through to default below
    }
  }

  return { currentIndex: 0, answers: {}, results: [] };
}

export function saveQuizProgress(userId: string, subjectId: string, progress: SavedQuizProgress) {
  localStorage.setItem(quizProgressKey(userId, subjectId), JSON.stringify(progress));
}

export function clearQuizProgress(userId: string, subjectId: string) {
  localStorage.removeItem(quizProgressKey(userId, subjectId));
}
