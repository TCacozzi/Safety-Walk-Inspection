import { useState } from 'react';
import type { Lesson as LessonType, ExerciseResult } from '../types';
import { Quiz } from './Quiz';
import '../styles/Lesson.css';

interface LessonProps {
  lesson: LessonType;
  onBack: () => void;
  onComplete: (day: number, results: ExerciseResult[]) => void;
}

export const Lesson: React.FC<LessonProps> = ({
  lesson,
  onBack,
  onComplete,
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
        questions={lesson.questions}
        onComplete={handleQuizComplete}
        onBack={() => setShowQuiz(false)}
      />
    );
  }

  const totalPoints = quizResults.reduce((sum, r) => sum + r.points, 0);
  const maxPoints = lesson.questions.reduce((sum, q) => sum + q.points, 0);
  const correctAnswers = quizResults.filter((r) => r.correct).length;

  return (
    <div className="lesson-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="lesson-header">
        <h1>
          Day {lesson.day}: {lesson.title}
        </h1>
        <p className="lesson-description">{lesson.description}</p>
      </div>

      <div className="lesson-content">
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>

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
          Start Exercise! 🚀
        </button>
      )}
    </div>
  );
};
