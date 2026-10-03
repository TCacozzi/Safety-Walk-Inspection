import type { ExerciseResult, Subject } from '../types';
import '../styles/SubjectSelector.css';

interface SubjectSelectorProps {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  onAdminClick: () => void;
  onParentClick: () => void;
}

interface SavedQuizProgress {
  results: ExerciseResult[];
}

function getSubjectProgress(subjectId: string): SavedQuizProgress | null {
  const saved = localStorage.getItem(`quizProgress_${subjectId}`);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return { results: parsed.results ?? [] };
  } catch {
    return null;
  }
}

export function SubjectSelector({
  subjects,
  onSelectSubject,
  onAdminClick,
  onParentClick,
}: SubjectSelectorProps) {
  const enabledSubjects = subjects.filter((s) => s.enabled);
  const disabledSubjects = subjects.filter((s) => !s.enabled);

  return (
    <div className="subject-selector">
      <div className="selector-header">
        <div className="header-title">
          <h2>📚 Escolha a Matéria</h2>
          <p className="subtitle">Bem-vindo, Lorenzo Cacozzi!</p>
        </div>
        <div className="header-actions">
          <button className="btn-admin" onClick={onParentClick} title="Área dos Pais">
            🔒
          </button>
          <button className="btn-admin" onClick={onAdminClick} title="Configurações">
            ⚙️
          </button>
        </div>
      </div>

      <div className="subjects-grid">
        {enabledSubjects.length === 0 && disabledSubjects.length === 0 ? (
          <div className="empty-state">
            <p>😴 Nenhuma matéria cadastrada ainda</p>
            <p>Clique em ⚙️ para adicionar matérias!</p>
          </div>
        ) : (
          <>
            {enabledSubjects.length > 0 && (
              <div className="subjects-section">
                <h3 className="section-title">📖 Matérias Disponíveis</h3>
                <div className="grid">
                  {enabledSubjects.map((subject) => {
                    const progress = getSubjectProgress(subject.id);
                    const answeredCount = progress?.results.length ?? 0;
                    const correctCount = progress?.results.filter((r) => r.correct).length ?? 0;
                    const accuracyPercent =
                      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
                    const inProgress = answeredCount > 0;

                    return (
                      <button
                        key={subject.id}
                        className="subject-card enabled"
                        onClick={() => onSelectSubject(subject)}
                      >
                        <div className="card-icon">📚</div>
                        <h3>{subject.name}</h3>
                        <p className="card-info">
                          {subject.questions.length} exercícios
                        </p>
                        {inProgress && (
                          <div className="card-progress">
                            <span>
                              📊 {answeredCount}/{subject.questions.length} respondidas
                            </span>
                            <span>✅ {accuracyPercent}% de acertos</span>
                          </div>
                        )}
                        <span className="badge">
                          {inProgress ? 'Continuar Estudando' : 'Pronto para estudar'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {disabledSubjects.length > 0 && (
              <div className="subjects-section">
                <h3 className="section-title">🔒 Matérias Bloqueadas</h3>
                <p className="section-info">
                  Peça ao seu responsável para adicionar conteúdo a essas matérias
                </p>
                <div className="grid">
                  {disabledSubjects.map((subject) => (
                    <div key={subject.id} className="subject-card disabled">
                      <div className="card-icon">🔒</div>
                      <h3>{subject.name}</h3>
                      <p className="card-info">Sem conteúdo</p>
                      <span className="badge">Bloqueado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
