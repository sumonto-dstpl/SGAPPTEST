import { Market, Shop, Garage, Payment, BackupRecord } from '../types';

// ─── Shared Data Bundle ──────────────────────────────────────────────────────

export interface AllData {
  markets: Market[];
  shops: Shop[];
  garages: Garage[];
  payments: Payment[];
  backups: BackupRecord[];
}

// ─── Adapter Interface ───────────────────────────────────────────────────────

export interface DatabaseAdapter {
  loadAll(): Promise<AllData>;

  addMarket(data: Omit<Market, 'id' | 'createdAt'>): Promise<Market>;
  updateMarket(id: string, patch: Partial<Market>): Promise<Market>;
  deleteMarket(id: string): Promise<void>;

  addShop(data: Omit<Shop, 'id'>): Promise<Shop>;
  updateShop(id: string, patch: Partial<Shop>): Promise<Shop>;
  deleteShop(id: string): Promise<void>;

  addGarage(data: Omit<Garage, 'id'>): Promise<Garage>;
  updateGarage(id: string, patch: Partial<Garage>): Promise<Garage>;
  deleteGarage(id: string): Promise<void>;

  addPayment(data: Omit<Payment, 'id'>): Promise<Payment>;

  addBackup(data: Omit<BackupRecord, 'id'>): Promise<BackupRecord>;
  deleteBackup(id: string): Promise<void>;
}

// ─── Environment Detection ───────────────────────────────────────────────────
// When running inside Tauri, use the SQLite adapter.
// Otherwise (web preview, development) use localStorage.

export function isTauriContext(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// ─── Adapter Factory ─────────────────────────────────────────────────────────

export async function createAdapter(): Promise<DatabaseAdapter> {
  if (isTauriContext()) {
    const { sqliteAdapter } = await import('./sqlite-adapter');
    return sqliteAdapter;
  }
  const { localAdapter } = await import('./local-adapter');
  return localAdapter;
}
