-- Migration 003: Add remark column to payments table.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS remark TEXT;
