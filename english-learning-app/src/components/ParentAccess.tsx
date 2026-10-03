import { useState } from 'react';
import type { Subject, UserAccount } from '../types';
import { getUsers, addUser, removeUser, approveUser } from '../utils/userAccounts';
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
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUnlock = () => {
    const savedPasscode = localStorage.getItem('parentPasscode');

    if (!savedPasscode) {
      setError('Nenhuma senha configurada ainda. Acesse ⚙️ Configurações para criar uma senha de 6 números.');
      return;
    }

    if (passcodeInput === savedPasscode) {
      setUnlocked(true);
      setError('');
      setUsers(getUsers());
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

  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword) {
      alert('Preencha usuário e senha.');
      return;
    }
    if (users.some((u) => u.username === newUsername.trim())) {
      alert('Já existe um usuário com esse nome.');
      return;
    }

    const updated = addUser(newUsername.trim(), newPassword, true);
    setUsers(updated);
    setNewUsername('');
    setNewPassword('');
  };

  const handleRemoveUser = (user: UserAccount) => {
    if (confirm(`Remover o acesso de "${user.username}"? O perfil dele também será apagado.`)) {
      const updated = removeUser(user.id);
      localStorage.removeItem(`studentProfile_${user.id}`);
      setUsers(updated);
    }
  };

  const handleApproveUser = (user: UserAccount) => {
    const updated = approveUser(user.id);
    setUsers(updated);
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
            <>
              <section className="users-section">
                <h3>👥 Usuários Cadastrados</h3>
                {users.length === 0 ? (
                  <p className="empty">Nenhum usuário cadastrado ainda</p>
                ) : (
                  <div className="users-list">
                    {users.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
                          <span className="user-name">{user.username}</span>
                          <span className={`user-status ${user.approved ? 'approved' : 'pending'}`}>
                            {user.approved ? '✅ Aprovado' : '⏳ Pendente'}
                          </span>
                        </div>
                        <div className="user-actions">
                          {!user.approved && (
                            <button className="btn-approve" onClick={() => handleApproveUser(user)}>
                              ✅ Aprovar
                            </button>
                          )}
                          <button className="btn-delete" onClick={() => handleRemoveUser(user)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="users-section">
                <h3>➕ Adicionar Novo Usuário</h3>
                <div className="add-user-form">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Novo usuário"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Senha"
                  />
                  <button className="btn-primary" onClick={handleAddUser}>
                    Adicionar
                  </button>
                </div>
              </section>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
