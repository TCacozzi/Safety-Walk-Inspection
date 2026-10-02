import { useState } from 'react';
import type { Subject } from '../types';
import '../styles/ParentAccess.css';

interface ParentAccessProps {
  subjects: Subject[];
  onResetSubjectProgress: (subjectId: string) => void;
  onClose: () => void;
}

export function ParentAccess({ subjects, onResetSubjectProgress, onClose }: ParentAccessProps) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    const savedPasscode = localStorage.getItem('parentPasscode');

    if (!savedPasscode) {
      setError('Nenhuma senha configurada ainda. Acesse ⚙️ Configurações para criar uma senha de 6 números.');
      return;
    }

    if (passcodeInput === savedPasscode) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
    setPasscodeInput('');
  };

  const handleReset = (subject: Subject) => {
    if (confirm(`Resetar todo o progresso de "${subject.name}"? O aluno vai recomeçar do zero.`)) {
      onResetSubjectProgress(subject.id);
      alert(`Progresso de "${subject.name}" resetado!`);
    }
  };

  return (
    <div className="parent-access-overlay">
      <div className="parent-access-panel">
        <div className="parent-access-header">
          <h2>🔒 Área dos Pais</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="parent-access-content">
          {!unlocked ? (
            <div className="passcode-gate">
              <p>Digite a senha de 6 números para continuar:</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                Resetar uma matéria apaga as respostas e a pontuação do aluno, para que ele comece do zero. Os exercícios gerados continuam salvos.
              </p>
              {subjects.length === 0 ? (
                <p className="empty">Nenhuma matéria cadastrada ainda</p>
              ) : (
                subjects.map((subject) => (
                  <div key={subject.id} className="reset-item">
                    <div className="subject-info">
                      <h4>{subject.name}</h4>
                      <p className="subject-status">
                        {subject.enabled ? `${subject.questions.length} exercícios` : 'Sem conteúdo'}
                      </p>
                    </div>
                    <button
                      className="btn-reset"
                      onClick={() => handleReset(subject)}
                      disabled={!subject.enabled}
                    >
                      🔄 Resetar Progresso
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
