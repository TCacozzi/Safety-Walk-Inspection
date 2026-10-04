import { useState } from 'react';
import { findUser, addUser, requestPasswordReset } from '../utils/userAccounts';
import { sendAccountEmail } from '../utils/email';
import { AdminUsersPanel } from './AdminUsersPanel';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'create' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleLogin = async () => {
    const user = await findUser(username.trim(), password);
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

    try {
      const newUser = await addUser(username.trim(), password, false, email.trim(), parentPassword);
      setError('');
      sendAccountEmail(newUser.email, 'pending', newUser.username);
      onLoginSuccess(newUser.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setError('Preencha o e-mail cadastrado na conta.');
      return;
    }

    try {
      await requestPasswordReset(forgotEmail.trim());
      setError('');
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar redefinição de senha.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else if (mode === 'create') {
      handleCreateAccount();
    } else {
      handleForgotPassword();
    }
  };

  const switchMode = (newMode: 'login' | 'create' | 'forgot') => {
    setMode(newMode);
    setError('');
    setForgotSent(false);
    setForgotEmail('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.webp" alt="Manda Bem!" className="login-logo" />
        </div>

        <div className="login-form-side">
          <h2 className="login-title">
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'create' && 'Vamos criar sua conta!'}
            {mode === 'forgot' && 'Esqueceu sua senha?'}
          </h2>

          {mode === 'forgot' ? (
            forgotSent ? (
              <p className="login-field-hint">
                Se esse e-mail estiver cadastrado, você vai receber um link para redefinir sua senha.
                Verifique também a caixa de spam.
              </p>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="E-mail cadastrado na conta"
                  autoFocus
                />

                {error && <p className="login-error">{error}</p>}

                <button type="submit" className="login-submit">
                  Enviar link de redefinição
                </button>
              </form>
            )
          ) : (
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
          )}

          {mode === 'login' && (
            <button className="login-toggle-mode" onClick={() => switchMode('forgot')}>
              Esqueci minha senha
            </button>
          )}

          <button
            className="login-toggle-mode"
            onClick={() => switchMode(mode === 'create' ? 'login' : mode === 'forgot' ? 'login' : 'create')}
          >
            {mode === 'create' || mode === 'forgot' ? 'Já tenho uma conta' : 'Criar uma nova conta'}
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
