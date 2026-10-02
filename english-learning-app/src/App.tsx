import { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { SubjectSelector } from './components/SubjectSelector';
import { Lesson } from './components/Lesson';
import type { Subject, UserProgress, ExerciseResult, Lesson as LessonType } from './types';
import './App.css';

type Screen = 'admin' | 'selector' | 'lesson';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('selector');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Load subjects and progress from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('lorenzoDynamicSubjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }

    const savedProgress = localStorage.getItem('lorenzoDynamicProgress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      const newProgress: UserProgress = {
        userId: `lorenzo_${Date.now()}`,
        currentDay: 1,
        completedDays: [],
        scores: {},
        totalPoints: 0,
        lastAccessed: new Date(),
        subjectScores: {},
      };
      setProgress(newProgress);
      localStorage.setItem('lorenzoDynamicProgress', JSON.stringify(newProgress));
    }
  }, []);

  const handleAddSubject = (subject: Subject) => {
    const updated = [...subjects, subject];
    setSubjects(updated);
    localStorage.setItem('lorenzoDynamicSubjects', JSON.stringify(updated));
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    localStorage.setItem('lorenzoDynamicSubjects', JSON.stringify(updated));
  };

  const handleUpdateSubject = (updated: Subject) => {
    const newSubjects = subjects.map((s) => (s.id === updated.id ? updated : s));
    setSubjects(newSubjects);
    localStorage.setItem('lorenzoDynamicSubjects', JSON.stringify(newSubjects));
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentScreen('lesson');
  };

  const handleBackToSelector = () => {
    setCurrentScreen('selector');
  };

  const handleLessonComplete = (results: ExerciseResult[]) => {
    if (!progress || !selectedSubject) return;

    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const updatedProgress: UserProgress = {
      ...progress,
      totalPoints: progress.totalPoints + totalPoints,
      subjectScores: {
        ...progress.subjectScores,
        [selectedSubject.id]: (progress.subjectScores?.[selectedSubject.id] || 0) + totalPoints,
      },
      lastAccessed: new Date(),
    };

    setProgress(updatedProgress);
    localStorage.setItem('lorenzoDynamicProgress', JSON.stringify(updatedProgress));
    setCurrentScreen('selector');
  };

  const convertSubjectToLesson = (subject: Subject): LessonType => {
    return {
      id: subject.id,
      day: 1,
      title: subject.name,
      description: subject.description || '',
      content: subject.content || '',
      questions: subject.questions,
    };
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🚀 DYNAMIC SUBJECTS v2 - Lorenzo's Study App</h1>
          {progress && (
            <div className="header-stats">
              <span className="stat">📚 Matérias: {subjects.filter((s) => s.enabled).length}</span>
              <span className="stat">⭐ Pontos: {progress.totalPoints}</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentScreen === 'admin' && (
          <AdminPanel
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onUpdateSubject={handleUpdateSubject}
            onClose={() => setCurrentScreen('selector')}
          />
        )}

        {currentScreen === 'selector' && (
          <SubjectSelector
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onAdminClick={() => setCurrentScreen('admin')}
          />
        )}

        {currentScreen === 'lesson' && selectedSubject && (
          <Lesson
            lesson={convertSubjectToLesson(selectedSubject)}
            onBack={handleBackToSelector}
            onComplete={handleLessonComplete}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Personalized Study App for Lorenzo Cacozzi | Made with ❤️ by Claude
        </p>
      </footer>
    </div>
  );
}

export default App;
