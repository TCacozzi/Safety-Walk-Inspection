import type { UserProgress } from '../types';
import '../styles/Home.css';

interface HomeProps {
  progress: UserProgress | null;
  onStartLesson: (day: number) => void;
}

export const Home: React.FC<HomeProps> = ({ progress, onStartLesson }) => {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🌟 English Boost! 🌟</h1>
        <p className="hero-subtitle">Learn English with Fun and Games!</p>
      </div>

      {progress && (
        <div className="progress-card">
          <h2>Your Progress</h2>
          <div className="progress-info">
            <div className="stat">
              <span className="stat-label">Days Completed</span>
              <span className="stat-value">{progress.completedDays.length}/7</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Points</span>
              <span className="stat-value">{progress.totalPoints}</span>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress.completedDays.length / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="lessons-grid">
        <h2>Choose a Lesson</h2>
        <div className="days-container">
          {days.map((day) => {
            const isCompleted = progress?.completedDays.includes(day);
            return (
              <button
                key={day}
                className={`day-button ${isCompleted ? 'completed' : ''}`}
                onClick={() => onStartLesson(day)}
              >
                <span className="day-number">Day {day}</span>
                {isCompleted && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="info-section">
        <h3>💡 How to Use:</h3>
        <ul>
          <li>Study 15-20 minutes per day</li>
          <li>Read the lessons carefully</li>
          <li>Answer all exercises</li>
          <li>Check your progress daily</li>
        </ul>
      </div>
    </div>
  );
};
