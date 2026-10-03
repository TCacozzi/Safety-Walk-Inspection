import { useState } from 'react';
import { findUser, getUsers, addUser } from '../utils/userAccounts';
import { AdminUsersPanel } from './AdminUsersPanel';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleLogin = () => {
    const user = findUser(username.trim(), password);
    if (user) {
      setError('');
      onLoginSuccess(user.id);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleCreateAccount = () => {
    if (!username.trim() || !password) {
      setError('Preencha usuário e senha.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (getUsers().some((u) => u.username === username.trim())) {
      setError('Já existe uma conta com esse usuário.');
      return;
    }

    const updated = addUser(username.trim(), password, false);
    const newUser = updated[updated.length - 1];
    setError('');
    onLoginSuccess(newUser.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleCreateAccount();
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.webp" alt="Manda Bem!" className="login-logo" />
        </div>

        <div className="login-form-side">
          <h2 className="login-title">
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Vamos criar sua conta!'}
          </h2>

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
            {mode === 'create' && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Senha"
              />
            )}

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit">
              {mode === 'login' ? 'Entrar 🚀' : 'Criar Conta 🎉'}
            </button>
          </form>

          <button
            className="login-toggle-mode"
            onClick={() => {
              setMode(mode === 'login' ? 'create' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Criar uma nova conta' : 'Já tenho uma conta'}
          </button>

          <button className="login-admin-link" onClick={() => setShowAdminPanel(true)}>
            🔐 Acesso Administrador
          </button>
        </div>
      </div>

      {showAdminPanel && <AdminUsersPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  );
}
