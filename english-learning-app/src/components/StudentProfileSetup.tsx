import { useState } from 'react';
import type { StudentProfile } from '../types';
import '../styles/StudentProfileSetup.css';

interface StudentProfileSetupProps {
  profile: StudentProfile | null;
  onSave: (profile: StudentProfile) => void;
  onClose: () => void;
}

export function StudentProfileSetup({ profile, onSave, onClose }: StudentProfileSetupProps) {
  const [name, setName] = useState(profile?.name || '');
  const [grade, setGrade] = useState(profile?.grade || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [photo, setPhoto] = useState(profile?.photo || '');

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
          <h2>👤 Perfil do Aluno</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-setup-content">
          <div className="photo-upload">
            <div
              className="photo-preview"
              onClick={() => document.getElementById('student-photo-input')?.click()}
            >
              {photo ? (
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
