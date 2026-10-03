import { useState } from 'react';
import { findUser, getUsers } from '../utils/userAccounts';
import { AdminUsersPanel } from './AdminUsersPanel';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const hasUsers = getUsers().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasUsers) {
      setError('Nenhum usuário cadastrado. Peça ao seu responsável para criar seu acesso em "Acesso Administrador".');
      return;
    }

    const user = findUser(username.trim(), password);
    if (user) {
      setError('');
      onLoginSuccess(user.id);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.webp" alt="Manda Bem!" className="login-logo" />
        </div>

        <div className="login-form-side">
          <h2 className="login-title">Bem-vindo de volta!</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              Entrar 🚀
            </button>
          </form>

          <button className="login-admin-link" onClick={() => setShowAdminPanel(true)}>
            🔐 Acesso Administrador
          </button>
        </div>
      </div>

      {showAdminPanel && <AdminUsersPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  );
}
