import { useState } from 'react';
import { findUser, getUsers, addUser } from '../utils/userAccounts';
import { sendAccountEmail } from '../utils/email';
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
  const [email, setEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
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

  const handleCreateAccount = async () => {
    if (!username.trim() || !password || !email.trim()) {
      setError('Preencha usuário, senha e e-mail.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (!/^\d{6}$/.test(parentPassword)) {
      setError('A senha dos pais deve ter exatamente 6 números.');
      return;
    }
    if (getUsers().some((u) => u.username === username.trim())) {
      setError('Já existe uma conta com esse usuário.');
      return;
    }

    const updated = addUser(username.trim(), password, false, email.trim(), parentPassword);
    const newUser = updated[updated.length - 1];
    setError('');

    sendAccountEmail(newUser.email, 'pending', newUser.username);

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
              <>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar Senha"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail do responsável"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Senha dos Pais (6 números)"
                />
                <p className="login-field-hint">
                  A senha dos pais serve para resetar o progresso deste aluno depois, sem precisar da senha do administrador.
                </p>
              </>
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
