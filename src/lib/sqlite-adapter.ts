/**
 * Tauri SQLite adapter — active when the app runs as a Tauri desktop application.
 *
 * Uses @tauri-apps/plugin-sql to execute queries against the local SQLite file
 * (sqlite:pgms.db) that is created/migrated by the Rust side (tauri-plugin-sql).
 *
 * Column naming: DB uses snake_case; JS types use camelCase. This file handles
 * the mapping in both directions.
 */

import Database from '@tauri-apps/plugin-sql';
import { Market, Shop, Garage, Payment, BackupRecord } from '../types';
import { DatabaseAdapter, AllData } from './database';

// ─── Singleton DB connection ──────────────────────────────────────────────────

let _db: Database | null = null;

async function db(): Promise<Database> {
  if (!_db) {
    _db = await Database.load('sqlite:pgms.db');
  }
  return _db;
}

const uid = (): string => crypto.randomUUID();

// ─── Row → Type mappers ───────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function mapMarket(r: Row): Market {
  return {
    id: r.id as string,
    name: r.name as string,
    phoneNumber: r.phone_number as string,
    monthlyRent: r.monthly_rent as number,
    address: (r.address as string) || undefined,
    createdAt: r.created_at as string,
  };
}

function mapShop(r: Row): Shop {
  return {
    id: r.id as string,
    marketId: r.market_id as string,
    shopName: r.shop_name as string,
    tenantName: r.tenant_name as string,
    phoneNumber: r.phone_number as string,
    monthlyRent: r.monthly_rent as number,
    paidRent: r.paid_rent as number,
    currentDue: r.current_due as number,
    dueDate: r.due_date as string,
    paymentStatus: r.payment_status as Shop['paymentStatus'],
    shopType: r.shop_type as Shop['shopType'],
    startDate: r.start_date as string,
    endDate: r.end_date as string,
  };
}

function mapGarage(r: Row): Garage {
  return {
    id: r.id as string,
    garageNo: r.garage_no as string,
    ownerName: r.owner_name as string,
    mobileNumber: r.mobile_number as string,
    vehicleNumber: r.vehicle_number as string,
    vehicleType: r.vehicle_type as Garage['vehicleType'],
    monthlyRent: r.monthly_rent as number,
    paymentStatus: r.payment_status as Garage['paymentStatus'],
    currentDue: r.current_due as number,
    leaseEndDate: r.lease_end_date as string,
    leaseType: r.lease_type as Garage['leaseType'],
    address: (r.address as string) || undefined,
    startDate: r.start_date as string,
  };
}

function mapPayment(r: Row): Payment {
  return {
    id: r.id as string,
    date: r.payment_date as string,
    name: r.name as string,
    type: r.payment_type as Payment['type'],
    amount: r.amount as number,
    reference: r.reference as string,
  };
}

function mapBackup(r: Row): BackupRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    description: r.description as string,
    type: r.backup_type as BackupRecord['type'],
    createdAt: r.created_at_label as string,
    size: r.size_label as string,
    createdBy: r.created_by as string,
  };
}

// ─── Adapter implementation ───────────────────────────────────────────────────

export const sqliteAdapter: DatabaseAdapter = {
  // ── Load all ────────────────────────────────────────────────────────────────
  async loadAll(): Promise<AllData> {
    const conn = await db();
    const [markets, shops, garages, payments, backups] = await Promise.all([
      conn.select<Row[]>('SELECT * FROM markets ORDER BY name'),
      conn.select<Row[]>('SELECT * FROM shops ORDER BY shop_name'),
      conn.select<Row[]>('SELECT * FROM garages ORDER BY garage_no'),
      conn.select<Row[]>('SELECT * FROM payments ORDER BY created_at DESC'),
      conn.select<Row[]>('SELECT * FROM backups ORDER BY created_at DESC'),
    ]);
    return {
      markets: markets.map(mapMarket),
      shops:   shops.map(mapShop),
      garages: garages.map(mapGarage),
      payments: payments.map(mapPayment),
      backups: backups.map(mapBackup),
    };
  },

  // ── Markets ──────────────────────────────────────────────────────────────────
  async addMarket(data): Promise<Market> {
    const conn = await db();
    const id = uid();
    const today = new Date().toISOString().split('T')[0];
    await conn.execute(
      `INSERT INTO markets (id, name, phone_number, monthly_rent, address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, data.name, data.phoneNumber, data.monthlyRent, data.address ?? null, today],
    );
    return { id, name: data.name, phoneNumber: data.phoneNumber, monthlyRent: data.monthlyRent, address: data.address, createdAt: today };
  },

  async updateMarket(id, patch): Promise<Market> {
    const conn = await db();
    const parts: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (patch.name        !== undefined) { parts.push(`name=$${i++}`);         vals.push(patch.name); }
    if (patch.phoneNumber !== undefined) { parts.push(`phone_number=$${i++}`); vals.push(patch.phoneNumber); }
    if (patch.monthlyRent !== undefined) { parts.push(`monthly_rent=$${i++}`); vals.push(patch.monthlyRent); }
    if (patch.address     !== undefined) { parts.push(`address=$${i++}`);      vals.push(patch.address ?? null); }
    if (parts.length) {
      vals.push(id);
      await conn.execute(`UPDATE markets SET ${parts.join(', ')} WHERE id=$${i}`, vals);
    }
    const rows = await conn.select<Row[]>('SELECT * FROM markets WHERE id=$1', [id]);
    return mapMarket(rows[0]);
  },

  async deleteMarket(id): Promise<void> {
    const conn = await db();
    await conn.execute('DELETE FROM markets WHERE id=$1', [id]);
  },

  // ── Shops ────────────────────────────────────────────────────────────────────
  async addShop(data): Promise<Shop> {
    const conn = await db();
    const id = uid();
    await conn.execute(
      `INSERT INTO shops
         (id, market_id, shop_name, tenant_name, phone_number, monthly_rent,
          paid_rent, current_due, due_date, payment_status, shop_type, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, data.marketId, data.shopName, data.tenantName, data.phoneNumber,
       data.monthlyRent, data.paidRent, data.currentDue, data.dueDate,
       data.paymentStatus, data.shopType, data.startDate, data.endDate],
    );
    return { id, ...data };
  },

  async updateShop(id, patch): Promise<Shop> {
    const conn = await db();
    const map: Record<string, string> = {
      shopName: 'shop_name', tenantName: 'tenant_name', phoneNumber: 'phone_number',
      monthlyRent: 'monthly_rent', paidRent: 'paid_rent', currentDue: 'current_due',
      dueDate: 'due_date', paymentStatus: 'payment_status', shopType: 'shop_type',
      startDate: 'start_date', endDate: 'end_date',
    };
    const parts: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const [key, col] of Object.entries(map)) {
      if (patch[key as keyof typeof patch] !== undefined) {
        parts.push(`${col}=$${i++}`);
        vals.push(patch[key as keyof typeof patch]);
      }
    }
    if (parts.length) {
      vals.push(id);
      await conn.execute(`UPDATE shops SET ${parts.join(', ')} WHERE id=$${i}`, vals);
    }
    const rows = await conn.select<Row[]>('SELECT * FROM shops WHERE id=$1', [id]);
    return mapShop(rows[0]);
  },

  async deleteShop(id): Promise<void> {
    const conn = await db();
    await conn.execute('DELETE FROM shops WHERE id=$1', [id]);
  },

  // ── Garages ──────────────────────────────────────────────────────────────────
  async addGarage(data): Promise<Garage> {
    const conn = await db();
    const id = uid();
    await conn.execute(
      `INSERT INTO garages
         (id, garage_no, owner_name, mobile_number, vehicle_number, vehicle_type,
          monthly_rent, payment_status, current_due, lease_end_date, lease_type, address, start_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, data.garageNo, data.ownerName, data.mobileNumber, data.vehicleNumber,
       data.vehicleType, data.monthlyRent, data.paymentStatus, data.currentDue,
       data.leaseEndDate, data.leaseType, data.address ?? null, data.startDate],
    );
    return { id, ...data };
  },

  async updateGarage(id, patch): Promise<Garage> {
    const conn = await db();
    const map: Record<string, string> = {
      ownerName: 'owner_name', mobileNumber: 'mobile_number', vehicleNumber: 'vehicle_number',
      vehicleType: 'vehicle_type', monthlyRent: 'monthly_rent', paymentStatus: 'payment_status',
      currentDue: 'current_due', leaseEndDate: 'lease_end_date', leaseType: 'lease_type',
      address: 'address', startDate: 'start_date',
    };
    const parts: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const [key, col] of Object.entries(map)) {
      if (patch[key as keyof typeof patch] !== undefined) {
        parts.push(`${col}=$${i++}`);
        vals.push(patch[key as keyof typeof patch]);
      }
    }
    if (parts.length) {
      vals.push(id);
      await conn.execute(`UPDATE garages SET ${parts.join(', ')} WHERE id=$${i}`, vals);
    }
    const rows = await conn.select<Row[]>('SELECT * FROM garages WHERE id=$1', [id]);
    return mapGarage(rows[0]);
  },

  async deleteGarage(id): Promise<void> {
    const conn = await db();
    await conn.execute('DELETE FROM garages WHERE id=$1', [id]);
  },

  // ── Payments ─────────────────────────────────────────────────────────────────
  async addPayment(data): Promise<Payment> {
    const conn = await db();
    const id = uid();
    await conn.execute(
      `INSERT INTO payments (id, payment_date, name, payment_type, amount, reference)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, data.date, data.name, data.type, data.amount, data.reference],
    );
    return { id, ...data };
  },

  // ── Backups ───────────────────────────────────────────────────────────────────
  async addBackup(data): Promise<BackupRecord> {
    const conn = await db();
    const id = uid();
    await conn.execute(
      `INSERT INTO backups
         (id, name, description, backup_type, created_at_label, size_label, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, data.name, data.description, data.type, data.createdAt, data.size, data.createdBy],
    );
    return { id, ...data };
  },

  async deleteBackup(id): Promise<void> {
    const conn = await db();
    await conn.execute('DELETE FROM backups WHERE id=$1', [id]);
  },
};
