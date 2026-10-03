const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function sendAccountEmail(to: string, type: 'pending' | 'approved', username: string) {
  if (!to.trim()) return;

  try {
    await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, type, username }),
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}
