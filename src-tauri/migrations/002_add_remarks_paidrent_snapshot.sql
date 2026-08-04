-- Migration 002: Add paid_rent + due_date + remark to garages,
--               remark to shops, snapshot to backups.
-- Runs once (tracked by tauri-plugin-sql migration version).

ALTER TABLE garages ADD COLUMN paid_rent  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE garages ADD COLUMN due_date   TEXT    NOT NULL DEFAULT '';
ALTER TABLE garages ADD COLUMN remark     TEXT;

ALTER TABLE shops   ADD COLUMN remark     TEXT;

ALTER TABLE backups ADD COLUMN snapshot   TEXT;

-- Backfill paid_rent for existing garage rows
UPDATE garages SET paid_rent = monthly_rent WHERE payment_status = 'Paid' AND paid_rent = 0;
UPDATE garages SET paid_rent = 0             WHERE payment_status = 'Due'  AND paid_rent = 0;
