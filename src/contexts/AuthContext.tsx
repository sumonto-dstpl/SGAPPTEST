import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
  username: string;
  role: 'admin' | 'demo';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  loginDemo: () => void;
  logout: () => void;
}

const CREDENTIALS = [
  { username: 'admin', password: 'admin123', role: 'admin' as const },
  { username: 'Admin', password: 'admin123', role: 'admin' as const },
];

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
    const match = CREDENTIALS.find(c => c.username === username && c.password === password);
    if (!match) return false;
    persist({ username: match.username, role: match.role });
    return true;
  };

  const loginDemo = () => {
    persist({ username: 'Demo User', role: 'demo' });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
