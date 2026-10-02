export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'order-words' | 'true-false';
  context: string;
  question: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  points: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  content?: string;
  summary?: string;
  topics?: string[];
  questions: Question[];
  createdAt: Date;
  enabled: boolean;
}

export interface Lesson {
  id: string;
  day: number;
  title: string;
  description: string;
  content: string;
  summary?: string;
  topics?: string[];
  questions: Question[];
}

export interface StudentProfile {
  name: string;
  grade: string;
  school: string;
  photo: string;
}

export interface UserProgress {
  userId: string;
  currentDay: number;
  completedDays: number[];
  scores: Record<string, number>;
  totalPoints: number;
  lastAccessed: Date;
  subjectScores?: Record<string, number>;
}

export interface ExerciseResult {
  questionId: string;
  answered: boolean;
  userAnswer: string;
  correct: boolean;
  points: number;
}
