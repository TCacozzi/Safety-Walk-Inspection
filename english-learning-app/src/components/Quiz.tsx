import { useState } from 'react';
import type { Question, ExerciseResult } from '../types';
import '../styles/Quiz.css';

interface QuizProps {
  questions: Question[];
  onComplete: (results: ExerciseResult[]) => void;
  onBack: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const userAnswer = answers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.answer.toString();

  const handleAnswer = (value: string) => {
    if (!isAnswered) {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (!isAnswered) return;

    const isCorrect = userAnswer === currentQuestion.answer.toString();
    const result: ExerciseResult = {
      questionId: currentQuestion.id,
      answered: true,
      userAnswer,
      correct: isCorrect,
      points: isCorrect ? currentQuestion.points : 0,
    };

    results.push(result);
    setResults([...results]);
    setShowFeedback(currentQuestion.explanation);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowFeedback(null);
      } else {
        onComplete(results);
      }
    }, 2000);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Exercise Time!</h2>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-info">
        <span className="question-number">
          Question {currentIndex + 1} / {questions.length}
        </span>
        <span className="points">+{currentQuestion.points} points</span>
      </div>

      <div className="question-card">
        <h3 className="question-text">{currentQuestion.question}</h3>

        {currentQuestion.type === 'multiple-choice' && (
          <div className="options">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                className={`option-button ${
                  userAnswer === option ? 'selected' : ''
                } ${
                  showFeedback && userAnswer === option
                    ? isCorrect
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
              >
                {userAnswer === option && showFeedback ? (
                  isCorrect ? (
                    <span>✓ {option}</span>
                  ) : (
                    <span>✗ {option}</span>
                  )
                ) : (
                  option
                )}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'fill-blank' && (
          <div className="fill-blank">
            <input
              type="text"
              className="text-input"
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={isAnswered}
            />
          </div>
        )}

        {currentQuestion.type === 'true-false' && (
          <div className="true-false-options">
            <button
              className={`tf-button true ${
                userAnswer === 'true' ? 'selected' : ''
              } ${showFeedback && userAnswer === 'true' ? 'feedback' : ''}`}
              onClick={() => handleAnswer('true')}
              disabled={isAnswered}
            >
              True
            </button>
            <button
              className={`tf-button false ${
                userAnswer === 'false' ? 'selected' : ''
              } ${showFeedback && userAnswer === 'false' ? 'feedback' : ''}`}
              onClick={() => handleAnswer('false')}
              disabled={isAnswered}
            >
              False
            </button>
          </div>
        )}

        {currentQuestion.type === 'order-words' && (
          <div className="order-words">
            <input
              type="text"
              className="text-input"
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type the sentence in correct order..."
              disabled={isAnswered}
            />
          </div>
        )}

        {showFeedback && (
          <div
            className={`feedback ${
              userAnswer === currentQuestion.answer.toString()
                ? 'correct'
                : 'incorrect'
            }`}
          >
            <p>
              <strong>
                {userAnswer === currentQuestion.answer.toString()
                  ? '🎉 Correct!'
                  : '📚 Try again'}
              </strong>
            </p>
            <p className="explanation">{showFeedback}</p>
            {userAnswer !== currentQuestion.answer.toString() && (
              <p className="correct-answer">
                Correct answer: <strong>{currentQuestion.answer}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <button
        className="next-button"
        onClick={handleNext}
        disabled={!isAnswered}
      >
        {currentIndex < questions.length - 1 ? 'Next →' : 'Finish! 🎯'}
      </button>
    </div>
  );
};
