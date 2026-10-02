import type { Subject } from '../types';
import '../styles/SubjectSelector.css';

interface SubjectSelectorProps {
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  onAdminClick: () => void;
}

export function SubjectSelector({
  subjects,
  onSelectSubject,
  onAdminClick,
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
        <button className="btn-admin" onClick={onAdminClick} title="Configurações">
          ⚙️
        </button>
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
                  {enabledSubjects.map((subject) => (
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
                      <span className="badge">Pronto para estudar</span>
                    </button>
                  ))}
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
