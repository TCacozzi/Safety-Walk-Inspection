import { useState } from 'react';
import '../styles/StudentProfileSetup.css';

export const EMOJI_AVATARS: { emoji: string; color: string }[] = [
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

export const isEmojiAvatar = (photo: string) => !!photo && !photo.startsWith('data:');

interface ProfileFieldsProps {
  name: string;
  grade: string;
  school: string;
  photo: string;
  onNameChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
  onPhotoChange: (value: string) => void;
  idPrefix?: string;
}

export function ProfileFields({
  name,
  grade,
  school,
  photo,
  onNameChange,
  onGradeChange,
  onSchoolChange,
  onPhotoChange,
  idPrefix = 'profile',
}: ProfileFieldsProps) {
  const [tab, setTab] = useState<'photo' | 'emoji'>(
    photo && isEmojiAvatar(photo) ? 'emoji' : 'photo'
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onPhotoChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="avatar-tabs">
        <button
          type="button"
          className={`avatar-tab ${tab === 'photo' ? 'active' : ''}`}
          onClick={() => setTab('photo')}
        >
          📷 Enviar Foto
        </button>
        <button
          type="button"
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
            onClick={() => document.getElementById(`${idPrefix}-photo-input`)?.click()}
          >
            {photo && !isEmojiAvatar(photo) ? (
              <img src={photo} alt="Foto do aluno" />
            ) : (
              <span className="photo-placeholder">📷 Clique para adicionar foto</span>
            )}
          </div>
          <input
            id={`${idPrefix}-photo-input`}
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
              type="button"
              className={`emoji-option ${photo === emoji ? 'selected' : ''}`}
              style={{ background: color }}
              onClick={() => onPhotoChange(emoji)}
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
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Lorenzo Cacozzi"
        />
      </div>

      <div className="profile-field">
        <label>Ano que está cursando</label>
        <input
          type="text"
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          placeholder="Ex: 3º Ano A"
        />
      </div>

      <div className="profile-field">
        <label>Escola</label>
        <input
          type="text"
          value={school}
          onChange={(e) => onSchoolChange(e.target.value)}
          placeholder="Ex: Colégio ABC"
        />
      </div>
    </>
  );
}
