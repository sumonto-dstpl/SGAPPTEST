-- Migration 003: Add remark column to payments table.
-- Runs once (tracked by tauri-plugin-sql migration version).

ALTER TABLE payments ADD COLUMN remark TEXT;
