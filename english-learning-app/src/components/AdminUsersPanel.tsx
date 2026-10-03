import { useState } from 'react';
import type { UserAccount } from '../types';
import { getUsers, addUser, removeUser, approveUser } from '../utils/userAccounts';
import { sendAccountEmail } from '../utils/email';
import '../styles/AdminUsersPanel.css';

interface AdminUsersPanelProps {
  onClose: () => void;
}

export function AdminUsersPanel({ onClose }: AdminUsersPanelProps) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserAccount[]>([]);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('');

  const handleUnlock = () => {
    const savedPasscode = localStorage.getItem('parentPasscode');

    if (!savedPasscode) {
      setError('Nenhuma senha de administrador configurada ainda. Acesse ⚙️ Configurações, dentro do app, para criar uma senha de 6 números.');
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

  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword) {
      alert('Preencha usuário e senha.');
      return;
    }
    if (newParentPassword && !/^\d{6}$/.test(newParentPassword)) {
      alert('A senha dos pais deve ter exatamente 6 números.');
      return;
    }
    if (users.some((u) => u.username === newUsername.trim())) {
      alert('Já existe um usuário com esse nome.');
      return;
    }

    const updated = addUser(
      newUsername.trim(),
      newPassword,
      true,
      newEmail.trim(),
      newParentPassword
    );
    setUsers(updated);
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setNewParentPassword('');
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
    sendAccountEmail(user.email, 'approved', user.username);
  };

  return (
    <div className="admin-users-overlay">
      <div className="admin-users-panel">
        <div className="admin-users-header">
          <h2>🔐 Acesso Administrador</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-users-content">
          {!unlocked ? (
            <div className="passcode-gate">
              <p>Digite a senha de 6 números para gerenciar os usuários:</p>
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
                          {user.email && <span className="user-email">{user.email}</span>}
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
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="E-mail (opcional)"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={newParentPassword}
                    onChange={(e) => setNewParentPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Senha dos Pais (6 números)"
                  />
                  <button className="btn-primary" onClick={handleAddUser}>
                    Adicionar
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
