-- Add paid_rent, due_date and remark columns to garages
ALTER TABLE garages ADD COLUMN paid_rent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE garages ADD COLUMN due_date TEXT NOT NULL DEFAULT '';
ALTER TABLE garages ADD COLUMN remark TEXT;

-- Add remark column to shops
ALTER TABLE shops ADD COLUMN remark TEXT;

-- Add snapshot column to backups (JSON blob of full data at backup time)
ALTER TABLE backups ADD COLUMN snapshot TEXT;

-- Backfill paid_rent for garages based on existing payment status
UPDATE garages SET paid_rent = monthly_rent - current_due WHERE payment_status = 'Paid' AND current_due = 0;
UPDATE garages SET paid_rent = 0 WHERE payment_status = 'Due';
