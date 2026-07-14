/**
 * Local Storage adapter — fully offline, no network required.
 * Data is persisted in localStorage under namespaced keys.
 * On first launch the tables are seeded with demo data.
 */

import { Market, Shop, Garage, Payment, BackupRecord } from '../types';
import { DatabaseAdapter, AllData } from './database';

// ─── Seed data (embedded to keep adapter self-contained) ─────────────────────

const SEED_MARKETS: Market[] = [
  { id: 'ma-001', name: 'Market A', phoneNumber: '9876543210', monthlyRent: 5000, address: '12 Main Street',    createdAt: '2024-01-01' },
  { id: 'ma-002', name: 'Market B', phoneNumber: '9812345678', monthlyRent: 5000, address: '45 Park Avenue',    createdAt: '2024-01-15' },
  { id: 'ma-003', name: 'Market C', phoneNumber: '9834567890', monthlyRent: 6000, address: '78 Lake Road',      createdAt: '2024-02-01' },
  { id: 'ma-004', name: 'Market D', phoneNumber: '9123456780', monthlyRent: 4500, address: '23 Hill View',      createdAt: '2024-02-15' },
  { id: 'ma-005', name: 'Market E', phoneNumber: '9900556677', monthlyRent: 3800, address: '56 Garden Lane',    createdAt: '2024-03-01' },
  { id: 'ma-006', name: 'Market F', phoneNumber: '9871112233', monthlyRent: 5500, address: '89 Station Road',   createdAt: '2024-03-15' },
  { id: 'ma-007', name: 'Market G', phoneNumber: '9811223344', monthlyRent: 4700, address: '34 College Street', createdAt: '2024-04-01' },
  { id: 'ma-008', name: 'Market H', phoneNumber: '9898765432', monthlyRent: 3600, address: '67 Temple Road',    createdAt: '2024-04-15' },
  { id: 'ma-009', name: 'Market I', phoneNumber: '9867001122', monthlyRent: 4200, address: '90 Market Place',   createdAt: '2024-05-01' },
  { id: 'ma-010', name: 'Market J', phoneNumber: '9878123400', monthlyRent: 4800, address: '12 Commerce Street',createdAt: '2024-05-15' },
  { id: 'ma-011', name: 'Market K', phoneNumber: '9823001234', monthlyRent: 5200, address: '45 Bazaar Lane',    createdAt: '2024-06-01' },
  { id: 'ma-012', name: 'Market L', phoneNumber: '9845678901', monthlyRent: 4100, address: '78 Trade Road',     createdAt: '2024-06-15' },
];

const SEED_SHOPS: Shop[] = [
  { id: 'sh-001', marketId: 'ma-001', shopName: 'Shop A-01', tenantName: 'Mr. Roy',    phoneNumber: '9876543210', monthlyRent: 5000, paidRent: 5000, currentDue: 0,    dueDate: '2026-06-10', paymentStatus: 'Paid', shopType: 'Rented', startDate: '2024-01-01', endDate: '2026-12-31' },
  { id: 'sh-002', marketId: 'ma-001', shopName: 'Shop A-02', tenantName: 'Mr. Das',    phoneNumber: '9812345678', monthlyRent: 5000, paidRent: 0,    currentDue: 5000, dueDate: '2026-06-15', paymentStatus: 'Due',  shopType: 'Rented', startDate: '2024-01-15', endDate: '2026-12-31' },
  { id: 'sh-003', marketId: 'ma-001', shopName: 'Shop A-03', tenantName: 'Mr. Khan',   phoneNumber: '9834567890', monthlyRent: 6000, paidRent: 6000, currentDue: 0,    dueDate: '2026-06-20', paymentStatus: 'Paid', shopType: 'Rented', startDate: '2024-02-01', endDate: '2027-01-31' },
  { id: 'sh-004', marketId: 'ma-001', shopName: 'Shop A-04', tenantName: 'Mr. Ali',    phoneNumber: '9123456780', monthlyRent: 4500, paidRent: 0,    currentDue: 4500, dueDate: '2026-06-25', paymentStatus: 'Due',  shopType: 'Rented', startDate: '2024-02-15', endDate: '2026-11-30' },
  { id: 'sh-005', marketId: 'ma-001', shopName: 'Shop A-05', tenantName: 'Mr. Paul',   phoneNumber: '9900556677', monthlyRent: 5500, paidRent: 5500, currentDue: 0,    dueDate: '2026-07-05', paymentStatus: 'Paid', shopType: 'Rented', startDate: '2024-03-01', endDate: '2027-02-28' },
  { id: 'sh-006', marketId: 'ma-001', shopName: 'Shop A-06', tenantName: 'Mr. Sen',    phoneNumber: '9871112233', monthlyRent: 7000, paidRent: 7000, currentDue: 0,    dueDate: '2026-07-10', paymentStatus: 'Paid', shopType: 'Leased', startDate: '2024-03-15', endDate: '2028-03-14' },
  { id: 'sh-007', marketId: 'ma-001', shopName: 'Shop A-07', tenantName: 'Mr. Yadav',  phoneNumber: '9811223344', monthlyRent: 6000, paidRent: 0,    currentDue: 6000, dueDate: '2026-07-15', paymentStatus: 'Due',  shopType: 'Leased', startDate: '2024-04-01', endDate: '2027-03-31' },
  { id: 'sh-008', marketId: 'ma-001', shopName: 'Shop A-08', tenantName: 'Mr. Sharma', phoneNumber: '9122334455', monthlyRent: 5500, paidRent: 5500, currentDue: 0,    dueDate: '2026-07-20', paymentStatus: 'Paid', shopType: 'Leased', startDate: '2024-04-15', endDate: '2027-04-14' },
  { id: 'sh-009', marketId: 'ma-002', shopName: 'Shop B-01', tenantName: 'Mr. Gupta',  phoneNumber: '9876000001', monthlyRent: 5000, paidRent: 5000, currentDue: 0,    dueDate: '2026-06-10', paymentStatus: 'Paid', shopType: 'Rented', startDate: '2024-01-01', endDate: '2026-12-31' },
  { id: 'sh-010', marketId: 'ma-002', shopName: 'Shop B-02', tenantName: 'Mr. Verma',  phoneNumber: '9876000002', monthlyRent: 5000, paidRent: 0,    currentDue: 5000, dueDate: '2026-06-15', paymentStatus: 'Due',  shopType: 'Rented', startDate: '2024-01-15', endDate: '2026-12-31' },
  { id: 'sh-011', marketId: 'ma-003', shopName: 'Shop C-01', tenantName: 'Mr. Jain',   phoneNumber: '9876000003', monthlyRent: 6000, paidRent: 6000, currentDue: 0,    dueDate: '2026-06-20', paymentStatus: 'Paid', shopType: 'Rented', startDate: '2024-02-01', endDate: '2027-01-31' },
  { id: 'sh-012', marketId: 'ma-003', shopName: 'Shop C-02', tenantName: 'Mr. Bose',   phoneNumber: '9876000004', monthlyRent: 4500, paidRent: 0,    currentDue: 4500, dueDate: '2026-06-25', paymentStatus: 'Due',  shopType: 'Leased', startDate: '2024-02-15', endDate: '2026-11-30' },
];

const SEED_GARAGES: Garage[] = [
  { id: 'ga-001', garageNo: 'G-01', ownerName: 'Mr. Arnab Roy',     mobileNumber: '9876543210', vehicleNumber: 'WB 02 AB 1234', vehicleType: 'Car',   monthlyRent: 5000, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2028-12-31', dueDate: '2024-02-01', leaseType: 'Long-term', startDate: '2024-01-01' },
  { id: 'ga-002', garageNo: 'G-02', ownerName: 'Mr. Subhajit Das',  mobileNumber: '9812345678', vehicleNumber: 'WB 06 CD 5678', vehicleType: 'Car',   monthlyRent: 5000, paymentStatus: 'Due',  currentDue: 5000, leaseEndDate: '2029-01-31', dueDate: '2025-01-15', leaseType: 'Yearly',    startDate: '2024-01-15' },
  { id: 'ga-003', garageNo: 'G-03', ownerName: 'Mr. Rajesh Khan',   mobileNumber: '9834567890', vehicleNumber: 'WB 02 EF 9012', vehicleType: 'Car',   monthlyRent: 6000, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2029-03-14', dueDate: '2024-03-01', leaseType: 'Long-term', startDate: '2024-02-01' },
  { id: 'ga-004', garageNo: 'G-04', ownerName: 'Mr. Imran Ali',     mobileNumber: '9123456780', vehicleNumber: 'WB 04 GH 3456', vehicleType: 'Bike',  monthlyRent: 4500, paymentStatus: 'Due',  currentDue: 4500, leaseEndDate: '2028-03-31', dueDate: '2024-03-15', leaseType: 'Monthly',   startDate: '2024-02-15' },
  { id: 'ga-005', garageNo: 'G-05', ownerName: 'Mr. Pritam Paul',   mobileNumber: '9900556677', vehicleNumber: 'WB 02 IJ 7890', vehicleType: 'Car',   monthlyRent: 5000, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2029-04-30', dueDate: '2025-04-01', leaseType: 'Yearly',    startDate: '2024-03-01' },
  { id: 'ga-006', garageNo: 'G-06', ownerName: 'Mr. Suman Sen',     mobileNumber: '9871112233', vehicleNumber: 'WB 06 KL 2345', vehicleType: 'Truck', monthlyRent: 7000, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2029-05-31', dueDate: '2024-04-15', leaseType: 'Long-term', startDate: '2024-03-15' },
  { id: 'ga-007', garageNo: 'G-07', ownerName: 'Mr. Arindam Yadav', mobileNumber: '9811223344', vehicleNumber: 'WB 02 MN 6789', vehicleType: 'Car',   monthlyRent: 6000, paymentStatus: 'Due',  currentDue: 6000, leaseEndDate: '2028-05-31', dueDate: '2024-05-01', leaseType: 'Monthly',   startDate: '2024-04-01' },
  { id: 'ga-008', garageNo: 'G-08', ownerName: 'Mr. Rakesh Sharma', mobileNumber: '9122334455', vehicleNumber: 'WB 04 OP 1357', vehicleType: 'Car',   monthlyRent: 5500, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2029-06-30', dueDate: '2025-04-15', leaseType: 'Yearly',    startDate: '2024-04-15' },
  { id: 'ga-009', garageNo: 'G-09', ownerName: 'Mr. Sourav Ghosh',  mobileNumber: '9900112233', vehicleNumber: 'WB 05 QR 2468', vehicleType: 'Bike',  monthlyRent: 3500, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2028-07-31', dueDate: '2024-06-01', leaseType: 'Monthly',   startDate: '2024-05-01' },
  { id: 'ga-010', garageNo: 'G-10', ownerName: 'Mr. Biplab Dey',    mobileNumber: '9875432100', vehicleNumber: 'WB 03 ST 1357', vehicleType: 'Car',   monthlyRent: 5000, paymentStatus: 'Due',  currentDue: 5000, leaseEndDate: '2029-08-31', dueDate: '2025-05-15', leaseType: 'Yearly',    startDate: '2024-05-15' },
  { id: 'ga-011', garageNo: 'G-11', ownerName: 'Mr. Kamal Nath',    mobileNumber: '9862341100', vehicleNumber: 'WB 07 UV 9876', vehicleType: 'Car',   monthlyRent: 6500, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2029-09-30', dueDate: '2024-07-01', leaseType: 'Long-term', startDate: '2024-06-01' },
  { id: 'ga-012', garageNo: 'G-12', ownerName: 'Mr. Tapan Saha',    mobileNumber: '9845001122', vehicleNumber: 'WB 01 WX 5432', vehicleType: 'Truck', monthlyRent: 8000, paymentStatus: 'Paid', currentDue: 0,    leaseEndDate: '2030-06-30', dueDate: '2024-07-15', leaseType: 'Long-term', startDate: '2024-06-15' },
];

const SEED_PAYMENTS: Payment[] = [
  { id: 'py-001', date: '2026-06-10', name: 'Mr. Roy (S-01)',       type: 'Shop',   amount: 5000, reference: 'PAY-001' },
  { id: 'py-002', date: '2026-06-10', name: 'Rahul Das (G-02)',     type: 'Garage', amount: 3000, reference: 'PAY-002' },
  { id: 'py-003', date: '2026-06-10', name: 'Mr. Khan (S-03)',      type: 'Shop',   amount: 6000, reference: 'PAY-003' },
  { id: 'py-004', date: '2026-06-09', name: 'Pradip Mondal (G-05)', type: 'Garage', amount: 3000, reference: 'PAY-004' },
  { id: 'py-005', date: '2026-06-09', name: 'Mr. Paul (S-05)',      type: 'Shop',   amount: 5000, reference: 'PAY-005' },
  { id: 'py-006', date: '2026-06-08', name: 'Mr. Sen (S-06)',       type: 'Shop',   amount: 7000, reference: 'PAY-006' },
  { id: 'py-007', date: '2026-06-07', name: 'Mr. Arnab Roy (G-01)',type: 'Garage', amount: 5000, reference: 'PAY-007' },
];

const SEED_BACKUPS: BackupRecord[] = [
  { id: 'bk-001', name: 'Backup_10_06_2026_11_30_AM', description: 'Manual backup on 10 June 2026', type: 'Full Backup', createdAt: '10-Jun-2026 11:30 AM', size: '25.4 MB', createdBy: 'Admin' },
  { id: 'bk-002', name: 'Backup_09_06_2026_11_00_PM', description: 'Daily automated backup',        type: 'Full Backup', createdAt: '09-Jun-2026 11:00 PM', size: '24.8 MB', createdBy: 'System' },
  { id: 'bk-003', name: 'Backup_08_06_2026_11_00_PM', description: 'Daily automated backup',        type: 'Full Backup', createdAt: '08-Jun-2026 11:00 PM', size: '24.1 MB', createdBy: 'System' },
  { id: 'bk-004', name: 'Backup_07_06_2026_11_00_PM', description: 'Daily automated backup',        type: 'Full Backup', createdAt: '07-Jun-2026 11:00 PM', size: '23.7 MB', createdBy: 'System' },
  { id: 'bk-005', name: 'Backup_06_06_2026_11_00_PM', description: 'Daily automated backup',        type: 'Full Backup', createdAt: '06-Jun-2026 11:00 PM', size: '23.2 MB', createdBy: 'System' },
];

// ─── Storage keys ─────────────────────────────────────────────────────────────

const K = {
  markets:  'pgms_v2_markets',
  shops:    'pgms_v2_shops',
  garages:  'pgms_v2_garages',
  payments: 'pgms_v2_payments',
  backups:  'pgms_v2_backups',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed; }
    return JSON.parse(raw) as T[];
  } catch { return seed; }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const uid = (): string => crypto.randomUUID();

// ─── Adapter ─────────────────────────────────────────────────────────────────

export const localAdapter: DatabaseAdapter = {
  async loadAll(): Promise<AllData> {
    return {
      markets:  load(K.markets,  SEED_MARKETS),
      shops:    load(K.shops,    SEED_SHOPS),
      garages:  load(K.garages,  SEED_GARAGES),
      payments: load(K.payments, SEED_PAYMENTS),
      backups:  load(K.backups,  SEED_BACKUPS),
    };
  },

  // ── Markets ──────────────────────────────────────────────────────────────
  async addMarket(data): Promise<Market> {
    const list = load<Market>(K.markets, SEED_MARKETS);
    const m: Market = { id: uid(), ...data, createdAt: new Date().toISOString().split('T')[0] };
    save(K.markets, [...list, m]);
    return m;
  },
  async updateMarket(id, patch): Promise<Market> {
    const list = load<Market>(K.markets, SEED_MARKETS).map(m => m.id === id ? { ...m, ...patch } : m);
    save(K.markets, list);
    return list.find(m => m.id === id)!;
  },
  async deleteMarket(id): Promise<void> {
    save(K.markets, load<Market>(K.markets, SEED_MARKETS).filter(m => m.id !== id));
    save(K.shops,   load<Shop>(K.shops, SEED_SHOPS).filter(s => s.marketId !== id));
  },

  // ── Shops ────────────────────────────────────────────────────────────────
  async addShop(data): Promise<Shop> {
    const list = load<Shop>(K.shops, SEED_SHOPS);
    const s: Shop = { id: uid(), ...data };
    save(K.shops, [...list, s]);
    return s;
  },
  async updateShop(id, patch): Promise<Shop> {
    const list = load<Shop>(K.shops, SEED_SHOPS).map(s => s.id === id ? { ...s, ...patch } : s);
    save(K.shops, list);
    return list.find(s => s.id === id)!;
  },
  async deleteShop(id): Promise<void> {
    save(K.shops, load<Shop>(K.shops, SEED_SHOPS).filter(s => s.id !== id));
  },

  // ── Garages ──────────────────────────────────────────────────────────────
  async addGarage(data): Promise<Garage> {
    const list = load<Garage>(K.garages, SEED_GARAGES);
    const g: Garage = { id: uid(), ...data };
    save(K.garages, [...list, g]);
    return g;
  },
  async updateGarage(id, patch): Promise<Garage> {
    const list = load<Garage>(K.garages, SEED_GARAGES).map(g => g.id === id ? { ...g, ...patch } : g);
    save(K.garages, list);
    return list.find(g => g.id === id)!;
  },
  async deleteGarage(id): Promise<void> {
    save(K.garages, load<Garage>(K.garages, SEED_GARAGES).filter(g => g.id !== id));
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  async addPayment(data): Promise<Payment> {
    const list = load<Payment>(K.payments, SEED_PAYMENTS);
    const p: Payment = { id: uid(), ...data };
    save(K.payments, [p, ...list]);
    return p;
  },

  // ── Backups ───────────────────────────────────────────────────────────────
  async addBackup(data): Promise<BackupRecord> {
    const list = load<BackupRecord>(K.backups, SEED_BACKUPS);
    const b: BackupRecord = { id: uid(), ...data };
    save(K.backups, [b, ...list]);
    return b;
  },
  async deleteBackup(id): Promise<void> {
    save(K.backups, load<BackupRecord>(K.backups, SEED_BACKUPS).filter(b => b.id !== id));
  },
};

// ─── Public helper: get raw data for Excel export ─────────────────────────────
export function getRawData() {
  return {
    markets:  load<Market>(K.markets, SEED_MARKETS),
    shops:    load<Shop>(K.shops, SEED_SHOPS),
    garages:  load<Garage>(K.garages, SEED_GARAGES),
    payments: load<Payment>(K.payments, SEED_PAYMENTS),
  };
}
