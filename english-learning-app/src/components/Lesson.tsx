import { useState } from 'react';
import type { Lesson as LessonType, ExerciseResult } from '../types';
import { Quiz } from './Quiz';
import '../styles/Lesson.css';

interface LessonProps {
  lesson: LessonType;
  onBack: () => void;
  onComplete: (day: number, results: ExerciseResult[]) => void;
  onExitToMenu: () => void;
}

interface SavedQuizProgress {
  currentIndex: number;
  results: ExerciseResult[];
}

const loadSavedProgress = (subjectId: string): SavedQuizProgress | null => {
  const saved = localStorage.getItem(`quizProgress_${subjectId}`);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return {
      currentIndex: parsed.currentIndex ?? 0,
      results: parsed.results ?? [],
    };
  } catch {
    return null;
  }
};

export const Lesson: React.FC<LessonProps> = ({
  lesson,
  onBack,
  onComplete,
  onExitToMenu,
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState<ExerciseResult[]>([]);

  const handleQuizComplete = (results: ExerciseResult[]) => {
    setQuizResults(results);
    setQuizComplete(true);
  };

  const handleContinue = () => {
    onComplete(lesson.day, quizResults);
  };

  if (showQuiz && !quizComplete) {
    return (
      <Quiz
        subjectId={lesson.id}
        questions={lesson.questions}
        onComplete={handleQuizComplete}
        onBack={() => setShowQuiz(false)}
        onExit={onExitToMenu}
      />
    );
  }

  const totalPoints = quizResults.reduce((sum, r) => sum + r.points, 0);
  const maxPoints = lesson.questions.reduce((sum, q) => sum + q.points, 0);
  const correctAnswers = quizResults.filter((r) => r.correct).length;

  const savedProgress = quizComplete ? null : loadSavedProgress(lesson.id);
  const answeredCount = savedProgress?.results.length ?? 0;
  const correctCount = savedProgress?.results.filter((r) => r.correct).length ?? 0;
  const accuracyPercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="lesson-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="lesson-header">
        <h1>📘 Guia de Estudos: {lesson.title}</h1>
        {lesson.description && <p className="lesson-description">{lesson.description}</p>}
      </div>

      {lesson.topics && lesson.topics.length > 0 && (
        <div className="lesson-content">
          <h3>Temas que vamos estudar:</h3>
          <ul>
            {lesson.topics.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}

      {!quizComplete && answeredCount > 0 && (
        <div className="progress-summary">
          <span className="progress-summary-label">
            📊 {answeredCount}/{lesson.questions.length} respondidas
          </span>
          <span className="progress-summary-label">
            ✅ {accuracyPercent}% de acertos
          </span>
        </div>
      )}

      {quizComplete ? (
        <div className="results-card">
          <h2>🎉 Quiz Complete!</h2>
          <div className="results-stats">
            <div className="stat">
              <span className="label">Correct Answers</span>
              <span className="value">
                {correctAnswers}/{lesson.questions.length}
              </span>
            </div>
            <div className="stat">
              <span className="label">Points Earned</span>
              <span className="value">
                {totalPoints}/{maxPoints}
              </span>
            </div>
            <div className="stat">
              <span className="label">Percentage</span>
              <span className="value">
                {Math.round((correctAnswers / lesson.questions.length) * 100)}%
              </span>
            </div>
          </div>

          <div className="feedback">
            {correctAnswers === lesson.questions.length && (
              <p className="excellent">
                🌟 Perfect! You're doing great!
              </p>
            )}
            {correctAnswers >= lesson.questions.length * 0.7 && correctAnswers < lesson.questions.length && (
              <p className="good">
                ✨ Good job! Review the mistakes and try again tomorrow.
              </p>
            )}
            {correctAnswers < lesson.questions.length * 0.7 && (
              <p className="needs-review">
                📚 Keep practicing! Review the lesson and try again.
              </p>
            )}
          </div>

          <button className="continue-button" onClick={handleContinue}>
            Continue to Next Day →
          </button>
        </div>
      ) : (
        <button className="start-quiz-button" onClick={() => setShowQuiz(true)}>
          {answeredCount > 0 ? 'Continuar de Onde Parou ▶️' : 'Start Exercise! 🚀'}
        </button>
      )}
    </div>
  );
};
