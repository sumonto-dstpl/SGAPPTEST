import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
  username: string;
  role: 'admin' | 'demo' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  loginDemo: () => void;
  logout: () => void;
  changePassword: (current: string, next: string) => { ok: boolean; message?: string };
  verifyPassword: (password: string) => boolean;
}

const CREDENTIALS_KEY = 'mullick_fintech_credentials';

const DEFAULT_CREDENTIALS = [
  { username: 'admin', password: 'admin123', role: 'admin' as const },
  { username: 'Admin', password: 'admin123', role: 'admin' as const },
  { username: 'user1', password: 'user@123', role: 'user' as const },
  { username: 'user2', password: 'user@123', role: 'user' as const },
];

function loadCredentials(): typeof DEFAULT_CREDENTIALS {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(DEFAULT_CREDENTIALS));
  return DEFAULT_CREDENTIALS;
}

function saveCredentials(list: typeof DEFAULT_CREDENTIALS): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(list));
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem('pgms_user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) sessionStorage.setItem('pgms_user', JSON.stringify(u));
    else sessionStorage.removeItem('pgms_user');
  };

  const login = (username: string, password: string): boolean => {
    const creds = loadCredentials();
    const match = creds.find(c => c.username === username && c.password === password);
    if (!match) return false;
    persist({ username: match.username, role: match.role });
    return true;
  };

  const verifyPassword = (password: string): boolean => {
    const creds = loadCredentials();
    const u = user?.username ?? 'admin';
    return creds.some(c => c.username === u && c.password === password);
  };

  const changePassword = (current: string, next: string): { ok: boolean; message?: string } => {
    if (!next || next.length < 6) return { ok: false, message: 'New password must be at least 6 characters' };
    const creds = loadCredentials();
    const u = user?.username ?? 'admin';
    const idx = creds.findIndex(c => c.username === u && c.password === current);
    if (idx === -1) return { ok: false, message: 'Current password is incorrect' };
    creds[idx] = { ...creds[idx], password: next };
    saveCredentials(creds);
    return { ok: true };
  };

  const loginDemo = () => {
    persist({ username: 'Demo User', role: 'demo' });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout, changePassword, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
