import { useState } from 'react';
import type { StudentProfile } from '../types';
import { ProfileFields } from './ProfileFields';
import '../styles/StudentProfileSetup.css';

interface StudentProfileSetupProps {
  profile: StudentProfile | null;
  onSave: (profile: StudentProfile) => void;
  onClose: () => void;
  mandatory?: boolean;
}

export function StudentProfileSetup({ profile, onSave, onClose, mandatory }: StudentProfileSetupProps) {
  const [name, setName] = useState(profile?.name || '');
  const [grade, setGrade] = useState(profile?.grade || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [photo, setPhoto] = useState(profile?.photo || '');

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

          <ProfileFields
            name={name}
            grade={grade}
            school={school}
            photo={photo}
            onNameChange={setName}
            onGradeChange={setGrade}
            onSchoolChange={setSchool}
            onPhotoChange={setPhoto}
            idPrefix="student-profile-setup"
          />

          <button className="btn-primary" onClick={handleSave}>
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
