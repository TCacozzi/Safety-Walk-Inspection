import { useState } from 'react';
import type { Subject } from '../types';
import '../styles/AdminPanel.css';

interface AdminPanelProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSubject: (subject: Subject) => void;
  onClose: () => void;
}

export function AdminPanel({
  subjects,
  onAddSubject,
  onDeleteSubject,
  onUpdateSubject,
  onClose,
}: AdminPanelProps) {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('claudeApiKey') || '');
  const [loading, setLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [referenceText, setReferenceText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parentPasscode, setParentPasscode] = useState('');

  const extractJSON = (text: string) => {
    const withoutFences = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const start = withoutFences.indexOf('{');
    const end = withoutFences.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('Resposta da API não contém um JSON válido');
    }
    return JSON.parse(withoutFences.slice(start, end + 1));
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('claudeApiKey', apiKey);
      alert('API Key salva com sucesso!');
    }
  };

  const handleSaveParentPasscode = () => {
    if (!/^\d{6}$/.test(parentPasscode)) {
      alert('A senha deve ter exatamente 6 números.');
      return;
    }
    localStorage.setItem('parentPasscode', parentPasscode);
    setParentPasscode('');
    alert('Senha da Área dos Pais salva com sucesso!');
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      alert('Digite o nome da matéria');
      return;
    }

    const newSubject: Subject = {
      id: `subject_${Date.now()}`,
      name: newSubjectName,
      questions: [],
      createdAt: new Date(),
      enabled: false,
    };

    onAddSubject(newSubject);
    setNewSubjectName('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
      await generateExercisesFromImage(base64, ext);
    };
    reader.readAsDataURL(file);
  };

  const generateExercisesFromImage = async (base64: string, fileExt: string = 'jpeg') => {
    const savedApiKey = localStorage.getItem('claudeApiKey');
    if (!savedApiKey) {
      alert('Configure a API Key primeiro!');
      return;
    }

    if (!selectedSubjectId) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          fileExtension: fileExt,
          apiKey: savedApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      const parsed = extractJSON(content);
      const subject = subjects.find((s) => s.id === selectedSubjectId);

      if (subject) {
        const updatedSubject: Subject = {
          ...subject,
          content: imageFile?.name || 'Imagem',
          summary: parsed.summary || '',
          topics: parsed.topics || [],
          questions: parsed.questions,
          enabled: true,
        };
        onUpdateSubject(updatedSubject);
        alert(`${parsed.questions.length} exercícios gerados com sucesso!`);
        setImageFile(null);
        setReferenceText('');
      }
    } catch (error) {
      console.error('Erro ao gerar exercícios:', error);
      alert(`Erro ao gerar exercícios: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateExercisesFromText = async () => {
    const savedApiKey = localStorage.getItem('claudeApiKey');
    if (!savedApiKey) {
      alert('Configure a API Key primeiro!');
      return;
    }

    if (!selectedSubjectId || !referenceText.trim()) {
      alert('Selecione uma matéria e cole a referência!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textReference: referenceText,
          apiKey: savedApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      const parsed = extractJSON(content);
      const subject = subjects.find((s) => s.id === selectedSubjectId);

      if (subject) {
        const updatedSubject: Subject = {
          ...subject,
          content: referenceText,
          summary: parsed.summary || '',
          topics: parsed.topics || [],
          questions: parsed.questions,
          enabled: true,
        };
        onUpdateSubject(updatedSubject);
        alert(`${parsed.questions.length} exercícios gerados com sucesso!`);
        setReferenceText('');
      }
    } catch (error) {
      console.error('Erro ao gerar exercícios:', error);
      alert(`Erro ao gerar exercícios: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>⚙️ Painel do Admin - Lorenzo Cacozzi</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-content">
          <section className="admin-section">
            <h3>🔑 API Key Claude</h3>
            <div className="api-key-input">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui..."
              />
              <button onClick={handleSaveApiKey} className="btn-primary">
                Salvar API Key
              </button>
            </div>
            {localStorage.getItem('claudeApiKey') && (
              <p className="success">✅ API Key configurada</p>
            )}
          </section>

          <section className="admin-section">
            <h3>🔒 Senha da Área dos Pais</h3>
            <p className="section-hint">
              Use essa senha de 6 números para acessar a Área dos Pais e resetar o progresso de uma matéria.
            </p>
            <div className="api-key-input">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={parentPasscode}
                onChange={(e) => setParentPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Ex: 123456"
              />
              <button onClick={handleSaveParentPasscode} className="btn-primary">
                Salvar Senha
              </button>
            </div>
            {localStorage.getItem('parentPasscode') && (
              <p className="success">✅ Senha configurada</p>
            )}
          </section>

          <section className="admin-section">
            <h3>📚 Adicionar Nova Matéria</h3>
            <div className="add-subject">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Ex: Geografia, Ciências, História..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <button onClick={handleAddSubject} className="btn-primary">
                + Adicionar
              </button>
            </div>
          </section>

          <section className="admin-section">
            <h3>📖 Matérias Cadastradas</h3>
            <div className="subjects-list">
              {subjects.length === 0 ? (
                <p className="empty">Nenhuma matéria cadastrada ainda</p>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`subject-item ${
                      selectedSubjectId === subject.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedSubjectId(subject.id)}
                  >
                    <div className="subject-info">
                      <h4>{subject.name}</h4>
                      <p className="subject-status">
                        {subject.enabled ? (
                          <>
                            🟢 {subject.questions.length} exercícios
                          </>
                        ) : (
                          <>🔴 Sem conteúdo</>
                        )}
                      </p>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Deletar "${subject.name}"?`)) {
                          onDeleteSubject(subject.id);
                          if (selectedSubjectId === subject.id) {
                            setSelectedSubjectId(null);
                          }
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {selectedSubject && (
            <section className="admin-section">
              <h3>📝 Gerenciar: {selectedSubject.name}</h3>

              <div className="content-input">
                <label>Colar referência de texto:</label>
                <textarea
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  placeholder="Cole aqui o conteúdo, resumo ou referência da matéria..."
                  rows={6}
                />
                <button
                  onClick={generateExercisesFromText}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Gerando...' : '🤖 Gerar Exercícios'}
                </button>
              </div>

              <div className="divider">OU</div>

              <div className="image-input">
                <label>Fazer upload de foto do livro:</label>
                <div className="file-upload" onClick={() => document.getElementById(`file-input-${selectedSubjectId}`)?.click()}>
                  <input
                    id={`file-input-${selectedSubjectId}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                  <p>Clique para selecionar ou arraste uma foto</p>
                </div>
                {imageFile && (
                  <p className="file-name">📷 {imageFile.name}</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
