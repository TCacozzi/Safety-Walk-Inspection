const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function hasAdminPasscode(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/admin-passcode`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.configured;
}

export async function validateAdminPasscode(passcode: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/admin-passcode/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.valid;
}

export async function setAdminPasscode(passcode: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin-passcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Erro ao salvar senha');
  }
}
