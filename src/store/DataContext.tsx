import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Market, Shop, Garage, Payment, BackupRecord } from '../types';
import { DatabaseAdapter, createAdapter } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

// ─── Context type ─────────────────────────────────────────────────────────────

interface DataContextType {
  markets: Market[];
  shops: Shop[];
  garages: Garage[];
  payments: Payment[];
  backups: BackupRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  addMarket: (data: Omit<Market, 'id' | 'createdAt'>) => Promise<void>;
  updateMarket: (id: string, patch: Partial<Market>) => Promise<void>;
  deleteMarket: (id: string) => Promise<void>;

  addShop: (data: Omit<Shop, 'id'>) => Promise<void>;
  updateShop: (id: string, patch: Partial<Shop>) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;

  addGarage: (data: Omit<Garage, 'id'>) => Promise<void>;
  updateGarage: (id: string, patch: Partial<Garage>) => Promise<void>;
  deleteGarage: (id: string) => Promise<void>;

  addPayment: (data: Omit<Payment, 'id'>) => Promise<void>;
  addBackup: (data: Omit<BackupRecord, 'id'>) => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  restoreAll: (data: { markets: Market[]; shops: Shop[]; garages: Garage[]; payments: Payment[] }) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const adapterRef = useRef<DatabaseAdapter | null>(null);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [shops,   setShops]   = useState<Shop[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!adapterRef.current) {
        adapterRef.current = await createAdapter({
          username: user?.username ?? 'admin',
          role: user?.role ?? 'admin',
        });
      }
      const data = await adapterRef.current.loadAll();
      setMarkets(data.markets);
      setShops(data.shops);
      setGarages(data.garages);
      setPayments(data.payments);
      setBackups(data.backups);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Resolve the adapter (already initialized by loadAll)
  const adapter = async (): Promise<DatabaseAdapter> => {
    if (!adapterRef.current) adapterRef.current = await createAdapter({
      username: user?.username ?? 'admin',
      role: user?.role ?? 'admin',
    });
    return adapterRef.current;
  };

  // ── Auto-due: advance due date & set status to Due when due date has passed ─
  const applyAutoDue = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addInterval = (d: Date, leaseType: Garage['leaseType']): Date => {
      if (leaseType === 'Yearly') return new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
      return new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()); // Monthly default
    };
    const formatD = (d: Date) => d.toISOString().split('T')[0];

    const a = await adapter();

    for (const shop of shops) {
      if (!shop.dueDate) continue;
      const due = new Date(shop.dueDate);
      due.setHours(0, 0, 0, 0);
      if (today <= due) continue;
      const nextDue = addInterval(due, 'Monthly');
      const updated = await a.updateShop(shop.id, {
        paymentStatus: 'Due',
        currentDue: shop.monthlyRent,
        paidRent: 0,
        dueDate: formatD(nextDue),
      });
      setShops(prev => prev.map(x => x.id === shop.id ? updated : x));
    }

    for (const garage of garages) {
      if (!garage.dueDate) continue;
      const due = new Date(garage.dueDate);
      due.setHours(0, 0, 0, 0);
      if (today <= due) continue;
      const nextDue = addInterval(due, garage.leaseType === 'Long-term' ? 'Yearly' : garage.leaseType);
      const updated = await a.updateGarage(garage.id, {
        paymentStatus: 'Due',
        currentDue: garage.monthlyRent,
        dueDate: formatD(nextDue),
      });
      setGarages(prev => prev.map(x => x.id === garage.id ? updated : x));
    }
  }, [shops, garages]);

  const autoDueRan = useRef(false);
  useEffect(() => {
    if (loading || autoDueRan.current) return;
    autoDueRan.current = true;
    applyAutoDue();
  }, [loading, applyAutoDue]);

  // ── Markets ────────────────────────────────────────────────────────────────
  const addMarket = async (data: Omit<Market, 'id' | 'createdAt'>) => {
    const m = await (await adapter()).addMarket(data);
    setMarkets(prev => [...prev, m].sort((a, b) => a.name.localeCompare(b.name)));
  };
  const updateMarket = async (id: string, patch: Partial<Market>) => {
    const m = await (await adapter()).updateMarket(id, patch);
    setMarkets(prev => prev.map(x => x.id === id ? m : x));
  };
  const deleteMarket = async (id: string) => {
    await (await adapter()).deleteMarket(id);
    setMarkets(prev => prev.filter(x => x.id !== id));
    setShops(prev => prev.filter(s => s.marketId !== id));
  };

  // ── Shops ──────────────────────────────────────────────────────────────────
  const addShop = async (data: Omit<Shop, 'id'>) => {
    const s = await (await adapter()).addShop(data);
    setShops(prev => [...prev, s]);
  };
  const updateShop = async (id: string, patch: Partial<Shop>) => {
    const s = await (await adapter()).updateShop(id, patch);
    setShops(prev => prev.map(x => x.id === id ? s : x));
  };
  const deleteShop = async (id: string) => {
    await (await adapter()).deleteShop(id);
    setShops(prev => prev.filter(x => x.id !== id));
  };

  // ── Garages ────────────────────────────────────────────────────────────────
  const addGarage = async (data: Omit<Garage, 'id'>) => {
    const g = await (await adapter()).addGarage(data);
    setGarages(prev => [...prev, g]);
  };
  const updateGarage = async (id: string, patch: Partial<Garage>) => {
    const g = await (await adapter()).updateGarage(id, patch);
    setGarages(prev => prev.map(x => x.id === id ? g : x));
  };
  const deleteGarage = async (id: string) => {
    await (await adapter()).deleteGarage(id);
    setGarages(prev => prev.filter(x => x.id !== id));
  };

  // ── Payments / Backups ─────────────────────────────────────────────────────
  const addPayment = async (data: Omit<Payment, 'id'>) => {
    const p = await (await adapter()).addPayment(data);
    setPayments(prev => [p, ...prev]);
  };
  const addBackup = async (data: Omit<BackupRecord, 'id'>) => {
    const b = await (await adapter()).addBackup(data);
    setBackups(prev => [b, ...prev]);
  };
  const deleteBackup = async (id: string) => {
    await (await adapter()).deleteBackup(id);
    setBackups(prev => prev.filter(x => x.id !== id));
  };

  const restoreAll = async (data: { markets: Market[]; shops: Shop[]; garages: Garage[]; payments: Payment[] }) => {
    await (await adapter()).restoreAll({ ...data, backups: [] });
    setMarkets(data.markets);
    setShops(data.shops);
    setGarages(data.garages);
    setPayments(data.payments);
  };

  return (
    <DataContext.Provider value={{
      markets, shops, garages, payments, backups,
      loading, error, refresh: loadAll,
      addMarket, updateMarket, deleteMarket,
      addShop, updateShop, deleteShop,
      addGarage, updateGarage, deleteGarage,
      addPayment, addBackup, deleteBackup, restoreAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
