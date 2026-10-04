import { useState, useEffect } from 'react';
import type { Subject } from '../types';
import { getQuizProgress } from '../utils/userProgress';
import '../styles/SubjectSelector.css';

interface SubjectSelectorProps {
  subjects: Subject[];
  userId: string;
  isApproved: boolean;
  onSelectSubject: (subject: Subject) => void;
  onAdminClick: () => void;
  onParentClick: () => void;
}

interface SubjectProgressInfo {
  answeredCount: number;
  correctCount: number;
}

export function SubjectSelector({
  subjects,
  userId,
  isApproved,
  onSelectSubject,
  onAdminClick,
  onParentClick,
}: SubjectSelectorProps) {
  const enabledSubjects = subjects.filter((s) => s.enabled);
  const disabledSubjects = subjects.filter((s) => !s.enabled);

  const [progressBySubject, setProgressBySubject] = useState<Record<string, SubjectProgressInfo>>({});

  useEffect(() => {
    Promise.all(
      enabledSubjects.map((subject) =>
        getQuizProgress(userId, subject.id).then((progress) => [
          subject.id,
          {
            answeredCount: progress.results.length,
            correctCount: progress.results.filter((r) => r.correct).length,
          } satisfies SubjectProgressInfo,
        ] as const)
      )
    ).then((entries) => setProgressBySubject(Object.fromEntries(entries)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, subjects]);

  return (
    <div className="subject-selector">
      <div className="selector-header">
        <div className="header-title">
          <h2>📚 Escolha a Matéria</h2>
          <p className="subtitle">Bem-vindo!</p>
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

      {!isApproved ? (
        <div className="pending-approval">
          <div className="pending-icon">⏳</div>
          <h3>Aguardando aprovação do administrador</h3>
          <p>
            Seu cadastro foi criado com sucesso! Peça para seu responsável acessar
            "🔐 Acesso Administrador" na tela de login e aprovar seu acesso para
            liberar as matérias.
          </p>
        </div>
      ) : (
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
                    const info = progressBySubject[subject.id];
                    const answeredCount = info?.answeredCount ?? 0;
                    const correctCount = info?.correctCount ?? 0;
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
      )}
    </div>
  );
}
