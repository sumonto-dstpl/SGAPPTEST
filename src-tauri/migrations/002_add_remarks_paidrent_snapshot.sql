-- Migration 002: Add paid_rent + due_date + remark to garages,
--               remark to shops, snapshot to backups.
-- Uses IF NOT EXISTS so it is safe to re-run on existing databases.

ALTER TABLE garages ADD COLUMN IF NOT EXISTS paid_rent  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE garages ADD COLUMN IF NOT EXISTS due_date   TEXT    NOT NULL DEFAULT '';
ALTER TABLE garages ADD COLUMN IF NOT EXISTS remark     TEXT;

ALTER TABLE shops   ADD COLUMN IF NOT EXISTS remark     TEXT;

ALTER TABLE backups ADD COLUMN IF NOT EXISTS snapshot   TEXT;

-- Backfill paid_rent for existing garage rows
UPDATE garages SET paid_rent = monthly_rent WHERE payment_status = 'Paid'  AND paid_rent = 0;
UPDATE garages SET paid_rent = 0             WHERE payment_status = 'Due'  AND paid_rent = 0;
