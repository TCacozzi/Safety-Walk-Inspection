import { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { SubjectSelector } from './components/SubjectSelector';
import { Lesson } from './components/Lesson';
import { ParentAccess } from './components/ParentAccess';
import { StudentProfileSetup } from './components/StudentProfileSetup';
import { Login } from './components/Login';
import { getUsers } from './utils/userAccounts';
import { getUserProgress, saveUserProgress, clearQuizProgress } from './utils/userProgress';
import type { Subject, UserProgress, ExerciseResult, Lesson as LessonType, StudentProfile } from './types';
import './App.css';

type Screen = 'admin' | 'selector' | 'lesson' | 'parent';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isLoggedIn') === 'true'
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => localStorage.getItem('currentUserId')
  );
  const [currentScreen, setCurrentScreen] = useState<Screen>('selector');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Load subjects from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('lorenzoDynamicSubjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  // Load the logged-in user's own profile and progress whenever the user changes
  useEffect(() => {
    if (!currentUserId) {
      setStudentProfile(null);
      setProgress(null);
      return;
    }

    const savedProfile = localStorage.getItem(`studentProfile_${currentUserId}`);
    setStudentProfile(savedProfile ? JSON.parse(savedProfile) : null);
    setProgress(getUserProgress(currentUserId));
  }, [currentUserId]);

  // Sessions from before multi-user accounts existed may have isLoggedIn set
  // without a currentUserId; force a fresh login so the account is known.
  useEffect(() => {
    if (isAuthenticated && !currentUserId) {
      handleLogout();
    }
  }, [isAuthenticated, currentUserId]);

  const handleLoginSuccess = (userId: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', userId);
    setCurrentUserId(userId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setCurrentScreen('selector');
  };

  const handleSaveProfile = (profile: StudentProfile) => {
    if (!currentUserId) return;
    setStudentProfile(profile);
    localStorage.setItem(`studentProfile_${currentUserId}`, JSON.stringify(profile));
  };

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

  const handleResetSubjectProgress = (userId: string, subjectId: string) => {
    clearQuizProgress(userId, subjectId);

    const userProgress = getUserProgress(userId);
    const removedPoints = userProgress.subjectScores?.[subjectId] || 0;
    const updatedProgress: UserProgress = {
      ...userProgress,
      totalPoints: userProgress.totalPoints - removedPoints,
      subjectScores: {
        ...userProgress.subjectScores,
        [subjectId]: 0,
      },
    };
    saveUserProgress(userId, updatedProgress);

    if (userId === currentUserId) {
      setProgress(updatedProgress);
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    const user = getUsers().find((u) => u.id === currentUserId);
    if (!user?.approved) return;
    setSelectedSubject(subject);
    setCurrentScreen('lesson');
  };

  const handleBackToSelector = () => {
    setCurrentScreen('selector');
  };

  const handleLessonComplete = (_day: number, results: ExerciseResult[]) => {
    if (!progress || !selectedSubject || !currentUserId) return;

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
    saveUserProgress(currentUserId, updatedProgress);
    setCurrentScreen('selector');
  };

  const convertSubjectToLesson = (subject: Subject): LessonType => {
    return {
      id: subject.id,
      day: 1,
      title: subject.name,
      description: subject.description || '',
      content: subject.content || '',
      summary: subject.summary,
      topics: subject.topics,
      questions: subject.questions,
    };
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!studentProfile) {
    return (
      <StudentProfileSetup
        profile={null}
        onSave={handleSaveProfile}
        onClose={() => {}}
        mandatory
      />
    );
  }

  const currentUser = getUsers().find((u) => u.id === currentUserId);
  const isApproved = currentUser?.approved ?? false;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-brand">
              <img src="/logo.webp" alt="Manda Bem!" className="app-logo" />
              <h1 className="app-title">Manda Bem!</h1>
            </div>
            {studentProfile && (studentProfile.school || studentProfile.grade) && (
              <p className="header-school-info">
                {studentProfile.school}
                {studentProfile.school && studentProfile.grade ? ' • ' : ''}
                {studentProfile.grade}
              </p>
            )}
          </div>

          <div className="header-right">
            {progress && (
              <div className="header-stats">
                <span className="stat">📚 Matérias: {subjects.filter((s) => s.enabled).length}</span>
                <span className="stat">⭐ Pontos: {progress.totalPoints}</span>
              </div>
            )}
            <button className="student-avatar" onClick={() => setShowProfileSetup(true)}>
              {studentProfile?.photo?.startsWith('data:') ? (
                <img src={studentProfile.photo} alt={studentProfile.name} />
              ) : (
                <span className="avatar-placeholder">{studentProfile?.photo || '👤'}</span>
              )}
              <span className="student-name">
                {studentProfile?.name || 'Configurar Perfil'}
              </span>
            </button>
            <button className="logout-button" onClick={handleLogout} title="Sair">
              🚪
            </button>
          </div>
        </div>
      </header>

      {showProfileSetup && (
        <StudentProfileSetup
          profile={studentProfile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileSetup(false)}
        />
      )}

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

        {currentScreen === 'selector' && currentUserId && (
          <SubjectSelector
            subjects={subjects}
            userId={currentUserId}
            isApproved={isApproved}
            onSelectSubject={handleSelectSubject}
            onAdminClick={() => setCurrentScreen('admin')}
            onParentClick={() => setCurrentScreen('parent')}
          />
        )}

        {currentScreen === 'parent' && (
          <ParentAccess
            subjects={subjects}
            onResetSubjectProgress={handleResetSubjectProgress}
            onClose={() => setCurrentScreen('selector')}
          />
        )}

        {currentScreen === 'lesson' && selectedSubject && currentUserId && (
          <Lesson
            lesson={convertSubjectToLesson(selectedSubject)}
            userId={currentUserId}
            onBack={handleBackToSelector}
            onComplete={handleLessonComplete}
            onExitToMenu={handleBackToSelector}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Manda Bem! | Personalized Study App for Lorenzo Cacozzi
        </p>
      </footer>
    </div>
  );
}

export default App;
