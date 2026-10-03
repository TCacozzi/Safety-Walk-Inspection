import { useState } from 'react';
import type { StudentProfile } from '../types';
import '../styles/StudentProfileSetup.css';

interface StudentProfileSetupProps {
  profile: StudentProfile | null;
  onSave: (profile: StudentProfile) => void;
  onClose: () => void;
  mandatory?: boolean;
}

const EMOJI_AVATARS: { emoji: string; color: string }[] = [
  { emoji: '🦁', color: '#ff8a00' },
  { emoji: '🐯', color: '#ffc107' },
  { emoji: '🐸', color: '#2ecc71' },
  { emoji: '🐼', color: '#475569' },
  { emoji: '🐵', color: '#8b5cf6' },
  { emoji: '🦊', color: '#ff6b9d' },
  { emoji: '🐨', color: '#00d1ff' },
  { emoji: '🦄', color: '#8b5cf6' },
  { emoji: '🐳', color: '#007bff' },
  { emoji: '🦋', color: '#ff6b9d' },
  { emoji: '🦉', color: '#00c2a8' },
  { emoji: '🐢', color: '#2ecc71' },
  { emoji: '🐰', color: '#ffc107' },
  { emoji: '🐶', color: '#ff8a00' },
  { emoji: '🐱', color: '#8b5cf6' },
  { emoji: '🦖', color: '#2ecc71' },
  { emoji: '🚀', color: '#007bff' },
  { emoji: '⚽', color: '#00c2a8' },
  { emoji: '🎨', color: '#ff5252' },
  { emoji: '🌟', color: '#ffc107' },
];

const isEmojiAvatar = (photo: string) => !!photo && !photo.startsWith('data:');

export function StudentProfileSetup({ profile, onSave, onClose, mandatory }: StudentProfileSetupProps) {
  const [name, setName] = useState(profile?.name || '');
  const [grade, setGrade] = useState(profile?.grade || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [photo, setPhoto] = useState(profile?.photo || '');
  const [tab, setTab] = useState<'photo' | 'emoji'>(
    profile?.photo && isEmojiAvatar(profile.photo) ? 'emoji' : 'photo'
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !grade.trim() || !school.trim()) {
      alert('Preencha nome, ano e escola.');
      return;
    }

    onSave({ name: name.trim(), grade: grade.trim(), school: school.trim(), photo });
    onClose();
  };

  return (
    <div className="profile-setup-overlay">
      <div className="profile-setup-panel">
        <div className="profile-setup-header">
          <h2>👤 {mandatory ? 'Vamos criar seu perfil!' : 'Perfil do Aluno'}</h2>
          {!mandatory && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <div className="profile-setup-content">
          {mandatory && (
            <p className="section-hint">
              Antes de começar a estudar, preencha seus dados e escolha uma foto ou um avatar.
            </p>
          )}

          <div className="avatar-tabs">
            <button
              className={`avatar-tab ${tab === 'photo' ? 'active' : ''}`}
              onClick={() => setTab('photo')}
            >
              📷 Enviar Foto
            </button>
            <button
              className={`avatar-tab ${tab === 'emoji' ? 'active' : ''}`}
              onClick={() => setTab('emoji')}
            >
              😀 Escolher Avatar
            </button>
          </div>

          {tab === 'photo' ? (
            <div className="photo-upload">
              <div
                className="photo-preview"
                onClick={() => document.getElementById('student-photo-input')?.click()}
              >
                {photo && !isEmojiAvatar(photo) ? (
                  <img src={photo} alt="Foto do aluno" />
                ) : (
                  <span className="photo-placeholder">📷 Clique para adicionar foto</span>
                )}
              </div>
              <input
                id="student-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="emoji-gallery">
              {EMOJI_AVATARS.map(({ emoji, color }) => (
                <button
                  key={emoji}
                  className={`emoji-option ${photo === emoji ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setPhoto(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="profile-field">
            <label>Nome do Aluno</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lorenzo Cacozzi"
            />
          </div>

          <div className="profile-field">
            <label>Ano que está cursando</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Ex: 3º Ano A"
            />
          </div>

          <div className="profile-field">
            <label>Escola</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Ex: Colégio ABC"
            />
          </div>

          <button className="btn-primary" onClick={handleSave}>
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
