import { useState, useEffect } from 'react';
import type { Subject } from '../types';
import { validateParentPassword } from '../utils/userAccounts';
import { getQuizProgress } from '../utils/userProgress';
import '../styles/ResetMyProgress.css';

interface ResetMyProgressProps {
  userId: string;
  subjects: Subject[];
  onResetSubjectProgress: (userId: string, subjectId: string) => void;
  onClose: () => void;
}

export function ResetMyProgress({ userId, subjects, onResetSubjectProgress, onClose }: ResetMyProgressProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [answeredCounts, setAnsweredCounts] = useState<Record<string, number>>({});

  const enabledSubjects = subjects.filter((s) => s.enabled);

  useEffect(() => {
    if (!unlocked) return;

    Promise.all(
      enabledSubjects.map((subject) =>
        getQuizProgress(userId, subject.id).then((progress) => [subject.id, progress.results.length] as const)
      )
    ).then((entries) => setAnsweredCounts(Object.fromEntries(entries)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, userId]);

  const handleUnlock = async () => {
    const valid = await validateParentPassword(userId, passwordInput);
    if (valid) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Senha dos pais incorreta, ou ela ainda não foi configurada para esta conta.');
    }
    setPasswordInput('');
  };

  const handleReset = (subject: Subject) => {
    if (confirm(`Resetar seu progresso em "${subject.name}"? Você vai recomeçar do zero.`)) {
      onResetSubjectProgress(userId, subject.id);
      alert(`Progresso de "${subject.name}" resetado!`);
    }
  };

  return (
    <div className="reset-my-progress-overlay">
      <div className="reset-my-progress-panel">
        <div className="reset-my-progress-header">
          <h2>🔄 Resetar Meu Progresso</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="reset-my-progress-content">
          {!unlocked ? (
            <div className="passcode-gate">
              <p>Digite a senha dos pais (6 números) definida no cadastro desta conta:</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="••••••"
                className="passcode-input"
                autoFocus
              />
              <button className="btn-primary" onClick={handleUnlock}>
                Entrar
              </button>
              {error && <p className="error-text">{error}</p>}
            </div>
          ) : (
            <div className="reset-list">
              <p className="section-hint">
                Escolha a matéria para apagar suas respostas e pontuação e recomeçar do zero.
              </p>
              {enabledSubjects.length === 0 ? (
                <p className="empty">Nenhuma matéria disponível ainda</p>
              ) : (
                enabledSubjects.map((subject) => {
                  const answeredCount = answeredCounts[subject.id] ?? 0;

                  return (
                    <div key={subject.id} className="reset-item">
                      <div className="subject-info">
                        <h4>{subject.name}</h4>
                        <p className="subject-status">
                          {subject.questions.length} exercícios
                          {answeredCount > 0 && ` • ${answeredCount} respondidas`}
                        </p>
                      </div>
                      <button className="btn-reset" onClick={() => handleReset(subject)}>
                        🔄 Resetar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
