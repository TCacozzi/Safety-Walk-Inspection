import type { UserAccount } from '../types';

const STORAGE_KEY = 'registeredUsers';

export function getUsers(): UserAccount[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const users: UserAccount[] = JSON.parse(saved);
      // Accounts created before the approval field existed are already in use; grandfather them in as approved.
      return users.map((u) => ({ ...u, approved: u.approved ?? true }));
    } catch {
      return [];
    }
  }

  // Migrate from the old single-account format, if present.
  const legacy = localStorage.getItem('loginCredentials');
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const migrated: UserAccount[] = [
        { id: `user_${Date.now()}`, username: parsed.username, password: parsed.password, approved: true },
      ];
      saveUsers(migrated);
      localStorage.removeItem('loginCredentials');
      return migrated;
    } catch {
      return [];
    }
  }

  return [];
}

export function saveUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function addUser(username: string, password: string, approved: boolean): UserAccount[] {
  const users = getUsers();
  const newUser: UserAccount = { id: `user_${Date.now()}`, username, password, approved };
  const updated = [...users, newUser];
  saveUsers(updated);
  return updated;
}

export function removeUser(id: string): UserAccount[] {
  const updated = getUsers().filter((u) => u.id !== id);
  saveUsers(updated);
  return updated;
}

export function approveUser(id: string): UserAccount[] {
  const updated = getUsers().map((u) => (u.id === id ? { ...u, approved: true } : u));
  saveUsers(updated);
  return updated;
}

export function findUser(username: string, password: string): UserAccount | null {
  return getUsers().find((u) => u.username === username && u.password === password) ?? null;
}
