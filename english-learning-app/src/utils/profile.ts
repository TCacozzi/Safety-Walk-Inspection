import type { StudentProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function getProfile(userId: string): Promise<StudentProfile | null> {
  const res = await fetch(`${API_URL}/api/profiles/${userId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function saveProfile(userId: string, profile: StudentProfile): Promise<void> {
  await fetch(`${API_URL}/api/profiles/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
}
