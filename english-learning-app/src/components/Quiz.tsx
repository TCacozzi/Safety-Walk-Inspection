import { useState } from 'react';
import type { Question, ExerciseResult } from '../types';
import '../styles/Quiz.css';

interface QuizProgress {
  currentIndex: number;
  answers: Record<string, string>;
  results: ExerciseResult[];
}

interface QuizProps {
  subjectId: string;
  questions: Question[];
  onComplete: (results: ExerciseResult[]) => void;
  onBack: () => void;
  onExit: () => void;
}

const getStorageKey = (subjectId: string) => `quizProgress_${subjectId}`;

const loadProgress = (subjectId: string): QuizProgress => {
  const saved = localStorage.getItem(getStorageKey(subjectId));
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        currentIndex: parsed.currentIndex ?? 0,
        answers: parsed.answers ?? {},
        results: parsed.results ?? [],
      };
    } catch {
      return { currentIndex: 0, answers: {}, results: [] };
    }
  }
  return { currentIndex: 0, answers: {}, results: [] };
};

export const Quiz: React.FC<QuizProps> = ({
  subjectId,
  questions,
  onComplete,
  onBack,
  onExit,
}) => {
  const initialProgress = loadProgress(subjectId);

  const [currentIndex, setCurrentIndex] = useState(initialProgress.currentIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(initialProgress.answers);
  const [results, setResults] = useState<ExerciseResult[]>(initialProgress.results);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const userAnswer = answers[currentQuestion.id];
  const isCorrect = userAnswer === currentQuestion.answer.toString();

  const saveProgress = (next: QuizProgress) => {
    localStorage.setItem(getStorageKey(subjectId), JSON.stringify(next));
  };

  const handleExit = () => {
    saveProgress({ currentIndex, answers, results });
    onExit();
  };

  const handleAnswer = (value: string) => {
    if (!isAnswered) {
      const updatedAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(updatedAnswers);
      saveProgress({ currentIndex, answers: updatedAnswers, results });
    }
  };

  const handleNext = () => {
    if (!isAnswered) return;

    const isCorrectAnswer = userAnswer === currentQuestion.answer.toString();
    const result: ExerciseResult = {
      questionId: currentQuestion.id,
      answered: true,
      userAnswer,
      correct: isCorrectAnswer,
      points: isCorrectAnswer ? currentQuestion.points : 0,
    };

    const updatedResults = [...results, result];
    setResults(updatedResults);
    setShowFeedback(currentQuestion.explanation);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setShowFeedback(null);
        setShowQuestion(false);
        saveProgress({ currentIndex: nextIndex, answers, results: updatedResults });
      } else {
        localStorage.removeItem(getStorageKey(subjectId));
        onComplete(updatedResults);
      }
    }, 2000);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (!showQuestion && currentQuestion.context) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h2>Exercise Time!</h2>
          <button className="exit-button" onClick={handleExit}>
            Sair e Salvar 💾
          </button>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="question-info">
          <span className="question-number">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="context-card">
          <h3>📘 Antes de responder...</h3>
          <p className="context-text">{currentQuestion.context}</p>
          <button className="next-button" onClick={() => setShowQuestion(true)}>
            Ver Pergunta →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>Exercise Time!</h2>
        <button className="exit-button" onClick={handleExit}>
          Sair e Salvar 💾
        </button>
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
