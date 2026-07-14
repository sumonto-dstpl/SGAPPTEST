import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SnackType = 'success' | 'error' | 'warning' | 'info';

interface Snack {
  id: string;
  message: string;
  type: SnackType;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be inside SnackbarProvider');
  return ctx;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<SnackType, { icon: ReactNode; bg: string; text: string; bar: string }> = {
  success: { icon: <CheckCircle size={18} />, bg: 'bg-white border-l-4 border-green-500', text: 'text-gray-800', bar: 'bg-green-500' },
  error:   { icon: <XCircle size={18} />,     bg: 'bg-white border-l-4 border-red-500',   text: 'text-gray-800', bar: 'bg-red-500' },
  warning: { icon: <AlertTriangle size={18} />,bg: 'bg-white border-l-4 border-amber-500',text: 'text-gray-800', bar: 'bg-amber-500' },
  info:    { icon: <Info size={18} />,         bg: 'bg-white border-l-4 border-blue-500', text: 'text-gray-800', bar: 'bg-blue-500' },
};

const ICON_COLOR: Record<SnackType, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  const remove = useCallback((id: string) => {
    setSnacks(prev => prev.filter(s => s.id !== id));
  }, []);

  const showSnackbar = useCallback((message: string, type: SnackType = 'info') => {
    const id = crypto.randomUUID();
    setSnacks(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {snacks.map(snack => {
          const c = CONFIG[snack.type];
          return (
            <div
              key={snack.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm ${c.bg} animate-slide-in`}
            >
              <span className={`flex-shrink-0 mt-0.5 ${ICON_COLOR[snack.type]}`}>{c.icon}</span>
              <p className={`flex-1 text-sm font-medium leading-snug ${c.text}`}>{snack.message}</p>
              <button
                onClick={() => remove(snack.id)}
                className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
}
