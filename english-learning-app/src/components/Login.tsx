import { useState } from 'react';
import type { LoginCredentials } from '../types';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const hasAccount = !!localStorage.getItem('loginCredentials');

  const [mode, setMode] = useState<'login' | 'create'>(hasAccount ? 'login' : 'create');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const saved = localStorage.getItem('loginCredentials');
    if (!saved) {
      setError('Nenhuma conta criada ainda.');
      return;
    }

    const credentials: LoginCredentials = JSON.parse(saved);
    if (username.trim() === credentials.username && password === credentials.password) {
      setError('');
      onLoginSuccess();
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

    const credentials: LoginCredentials = { username: username.trim(), password };
    localStorage.setItem('loginCredentials', JSON.stringify(credentials));
    setError('');
    onLoginSuccess();
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
        <img src="/logo.webp" alt="Manda Bem!" className="login-logo" />

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

        {hasAccount && (
          <button
            className="login-toggle-mode"
            onClick={() => {
              setMode(mode === 'login' ? 'create' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Criar uma nova conta' : 'Já tenho uma conta'}
          </button>
        )}
      </div>
    </div>
  );
}
