import type { Subject } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getSubjects(): Promise<Subject[]> {
  const res = await fetch(`${API_URL}/api/subjects`);
  if (!res.ok) throw new Error('Erro ao buscar matérias');
  return res.json();
}

export async function createSubject(name: string): Promise<Subject> {
  const res = await fetch(`${API_URL}/api/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Erro ao criar matéria');
  return res.json();
}

export async function updateSubject(id: string, fields: Partial<Subject>): Promise<Subject> {
  const res = await fetch(`${API_URL}/api/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error('Erro ao atualizar matéria');
  return res.json();
}

export async function deleteSubject(id: string): Promise<void> {
  await fetch(`${API_URL}/api/subjects/${id}`, { method: 'DELETE' });
}
