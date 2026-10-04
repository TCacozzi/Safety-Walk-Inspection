import type { UserAccount } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function parseErrorOr(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.error || fallback);
}

export async function getUsers(): Promise<UserAccount[]> {
  const res = await fetch(`${API_URL}/api/users`);
  if (!res.ok) return parseErrorOr(res, 'Erro ao buscar usuários');
  return res.json();
}

export async function addUser(
  username: string,
  password: string,
  approved: boolean,
  email: string = '',
  parentPassword: string = ''
): Promise<UserAccount> {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, parentPassword, approved }),
  });
  if (!res.ok) return parseErrorOr(res, 'Erro ao criar usuário');
  return res.json();
}

export async function removeUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) return parseErrorOr(res, 'Erro ao remover usuário');
}

export async function approveUser(id: string): Promise<UserAccount> {
  const res = await fetch(`${API_URL}/api/users/${id}/approve`, { method: 'POST' });
  if (!res.ok) return parseErrorOr(res, 'Erro ao aprovar usuário');
  return res.json();
}

export async function findUser(username: string, password: string): Promise<UserAccount | null> {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function validateParentPassword(userId: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/users/${userId}/validate-parent-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.valid;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) return parseErrorOr(res, 'Erro ao solicitar redefinição de senha');
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) return parseErrorOr(res, 'Erro ao redefinir senha');
}
