import { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { SubjectSelector } from './components/SubjectSelector';
import { Lesson } from './components/Lesson';
import { ParentAccess } from './components/ParentAccess';
import { StudentProfileSetup } from './components/StudentProfileSetup';
import { ResetMyProgress } from './components/ResetMyProgress';
import { Login } from './components/Login';
import { ResetPassword } from './components/ResetPassword';
import { getUsers } from './utils/userAccounts';
import { getUserProgress, saveUserProgress, clearQuizProgress } from './utils/userProgress';
import { getSubjects, createSubject, updateSubject, deleteSubject } from './utils/subjects';
import { getProfile, saveProfile } from './utils/profile';
import type { Subject, UserProgress, ExerciseResult, Lesson as LessonType, StudentProfile, UserAccount } from './types';
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showResetMyProgress, setShowResetMyProgress] = useState(false);

  const refreshSubjects = () => {
    getSubjects()
      .then(setSubjects)
      .catch((error) => console.error('Erro ao buscar matérias:', error));
  };

  // Load subjects from the server
  useEffect(() => {
    refreshSubjects();
  }, []);

  // Load the logged-in user's own profile, progress and account whenever the user changes
  useEffect(() => {
    if (!currentUserId) {
      setStudentProfile(null);
      setProfileLoaded(true);
      setProgress(null);
      setCurrentUser(null);
      return;
    }

    setProfileLoaded(false);
    getProfile(currentUserId)
      .then((profile) => {
        setStudentProfile(profile);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));

    getUserProgress(currentUserId)
      .then(setProgress)
      .catch((error) => console.error('Erro ao buscar progresso:', error));

    getUsers()
      .then((users) => setCurrentUser(users.find((u) => u.id === currentUserId) ?? null))
      .catch((error) => console.error('Erro ao buscar usuário:', error));
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
    saveProfile(currentUserId, profile).catch((error) =>
      console.error('Erro ao salvar perfil:', error)
    );
  };

  const handleAddSubject = (name: string) => {
    createSubject(name)
      .then(() => refreshSubjects())
      .catch((error) => alert(`Erro ao criar matéria: ${error.message}`));
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id)
      .then(() => refreshSubjects())
      .catch((error) => alert(`Erro ao deletar matéria: ${error.message}`));
  };

  const handleUpdateSubject = (updated: Subject) => {
    updateSubject(updated.id, updated)
      .then(() => refreshSubjects())
      .catch((error) => alert(`Erro ao atualizar matéria: ${error.message}`));
  };

  const handleResetSubjectProgress = async (userId: string, subjectId: string) => {
    await clearQuizProgress(userId, subjectId);

    const userProgress = await getUserProgress(userId);
    const removedPoints = userProgress.subjectScores?.[subjectId] || 0;
    const updatedProgress: UserProgress = {
      ...userProgress,
      totalPoints: userProgress.totalPoints - removedPoints,
      subjectScores: {
        ...userProgress.subjectScores,
        [subjectId]: 0,
      },
    };
    await saveUserProgress(userId, updatedProgress);

    if (userId === currentUserId) {
      setProgress(updatedProgress);
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    if (!currentUser?.approved) return;
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
    saveUserProgress(currentUserId, updatedProgress).catch((error) =>
      console.error('Erro ao salvar progresso:', error)
    );
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

  const resetToken = new URLSearchParams(window.location.search).get('reset_token');
  if (resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, '', window.location.pathname);
          window.location.reload();
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (!profileLoaded) {
    return null;
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
            <button
              className="logout-button"
              onClick={() => setShowResetMyProgress(true)}
              title="Resetar Meu Progresso"
            >
              🔄
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

      {showResetMyProgress && currentUserId && (
        <ResetMyProgress
          userId={currentUserId}
          subjects={subjects}
          onResetSubjectProgress={handleResetSubjectProgress}
          onClose={() => setShowResetMyProgress(false)}
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
