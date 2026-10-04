import { useState } from 'react';
import { resetPassword } from '../utils/userAccounts';
import '../styles/Login.css';

interface ResetPasswordProps {
  token: string;
  onDone: () => void;
}

export function ResetPassword({ token, onDone }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setError('Digite a nova senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setError('');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/logo.webp" alt="Manda Bem!" className="login-logo" />
        </div>

        <div className="login-form-side">
          <h2 className="login-title">Escolha sua nova senha</h2>

          {done ? (
            <>
              <p className="login-field-hint">Senha redefinida com sucesso! Agora é só entrar com ela.</p>
              <button className="login-submit" onClick={onDone}>
                Ir para o login
              </button>
            </>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha"
                autoFocus
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova senha"
              />

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-submit">
                Salvar nova senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
