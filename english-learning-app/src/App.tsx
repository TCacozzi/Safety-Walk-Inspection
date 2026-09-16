import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Lesson } from './components/Lesson';
import type { UserProgress, ExerciseResult } from './types';
import { lessons } from './data/lessons';
import './App.css';

type Screen = 'home' | 'lesson';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('englishBoostProgress');
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const newProgress: UserProgress = {
        userId: `user_${Date.now()}`,
        currentDay: 1,
        completedDays: [],
        scores: {},
        totalPoints: 0,
        lastAccessed: new Date(),
      };
      setProgress(newProgress);
      localStorage.setItem('englishBoostProgress', JSON.stringify(newProgress));
    }
  }, []);

  const handleStartLesson = (day: number) => {
    setSelectedDay(day);
    setCurrentScreen('lesson');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleLessonComplete = (day: number, results: ExerciseResult[]) => {
    if (!progress) return;

    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const updatedProgress: UserProgress = {
      ...progress,
      completedDays: [...new Set([...progress.completedDays, day])],
      scores: { ...progress.scores, [`day_${day}`]: totalPoints },
      totalPoints: progress.totalPoints + totalPoints,
      lastAccessed: new Date(),
    };

    setProgress(updatedProgress);
    localStorage.setItem('englishBoostProgress', JSON.stringify(updatedProgress));
    setCurrentScreen('home');
  };

  const currentLesson = lessons.find((l) => l.day === selectedDay);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📚 English Boost!</h1>
          {progress && (
            <div className="header-stats">
              <span className="stat">Days: {progress.completedDays.length}/7</span>
              <span className="stat">Points: {progress.totalPoints}</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentScreen === 'home' && (
          <Home progress={progress} onStartLesson={handleStartLesson} />
        )}

        {currentScreen === 'lesson' && currentLesson && (
          <Lesson
            lesson={currentLesson}
            onBack={handleBackToHome}
            onComplete={handleLessonComplete}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Made with ❤️ for English learners | © 2024 English Boost
        </p>
      </footer>
    </div>
  );
}

export default App;
