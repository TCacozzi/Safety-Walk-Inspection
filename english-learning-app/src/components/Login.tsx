import { useState } from 'react';
import type { Subject, StudentProfile } from '../types';
import { findUser, addUser, requestPasswordReset } from '../utils/userAccounts';
import { saveProfile } from '../utils/profile';
import { sendAccountEmail } from '../utils/email';
import { ProfileFields } from './ProfileFields';
import { AdminUsersPanel } from './AdminUsersPanel';
import { AdminPanel } from './AdminPanel';
import { ParentAccess } from './ParentAccess';
import '../styles/Login.css';

interface LoginProps {
  onLoginSuccess: (userId: string) => void;
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubject: (subject: Subject) => void;
  onResetSubjectProgress: (userId: string, subjectId: string) => void;
}

export function Login({
  onLoginSuccess,
  subjects,
  onAddSubject,
  onDeleteSubject,
  onUpdateSubject,
  onResetSubjectProgress,
}: LoginProps) {
  const [mode, setMode] = useState<'login' | 'create' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [profile, setProfile] = useState<StudentProfile>({ name: '', grade: '', school: '', photo: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSubjectsPanel, setShowSubjectsPanel] = useState(false);
  const [showParentAccess, setShowParentAccess] = useState(false);

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
    if (!profile.name.trim() || !profile.grade.trim() || !profile.school.trim()) {
      setError('Preencha nome, ano e escola do aluno.');
      return;
    }

    try {
      const newUser = await addUser(username.trim(), password, false, email.trim(), parentPassword);
      await saveProfile(newUser.id, {
        name: profile.name.trim(),
        grade: profile.grade.trim(),
        school: profile.school.trim(),
        photo: profile.photo,
      });
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

                  <div className="login-divider">Perfil do Aluno</div>

                  <ProfileFields
                    name={profile.name}
                    grade={profile.grade}
                    school={profile.school}
                    photo={profile.photo}
                    onNameChange={(name) => setProfile((p) => ({ ...p, name }))}
                    onGradeChange={(grade) => setProfile((p) => ({ ...p, grade }))}
                    onSchoolChange={(school) => setProfile((p) => ({ ...p, school }))}
                    onPhotoChange={(photo) => setProfile((p) => ({ ...p, photo }))}
                    idPrefix="login-create-account"
                  />
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

          <div className="login-admin-links">
            <button className="login-admin-link" onClick={() => setShowAdminPanel(true)}>
              🔐 Acesso Administrador
            </button>
            <button className="login-admin-link" onClick={() => setShowSubjectsPanel(true)}>
              ⚙️ Configurações
            </button>
            <button className="login-admin-link" onClick={() => setShowParentAccess(true)}>
              🔒 Área dos Pais
            </button>
          </div>
        </div>
      </div>

      {showAdminPanel && <AdminUsersPanel onClose={() => setShowAdminPanel(false)} />}

      {showSubjectsPanel && (
        <AdminPanel
          subjects={subjects}
          onAddSubject={onAddSubject}
          onDeleteSubject={onDeleteSubject}
          onUpdateSubject={onUpdateSubject}
          onClose={() => setShowSubjectsPanel(false)}
        />
      )}

      {showParentAccess && (
        <ParentAccess
          subjects={subjects}
          onResetSubjectProgress={onResetSubjectProgress}
          onClose={() => setShowParentAccess(false)}
        />
      )}
    </div>
  );
}
