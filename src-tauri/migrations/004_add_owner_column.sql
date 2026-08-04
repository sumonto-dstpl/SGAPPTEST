-- Migration 004: Add owner column to all tables for per-user data isolation.
-- Seed data (from migration 001) gets owner='admin' via the DEFAULT.
-- user1/user2 see only their own data; admin/demo share admin's data.

ALTER TABLE markets  ADD COLUMN owner TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE shops    ADD COLUMN owner TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE garages  ADD COLUMN owner TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE payments ADD COLUMN owner TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE backups  ADD COLUMN owner TEXT NOT NULL DEFAULT 'admin';

-- Explicit backfill (in case DEFAULT didn't apply to pre-existing rows)
UPDATE markets  SET owner = 'admin' WHERE owner IS NULL OR owner = '';
UPDATE shops    SET owner = 'admin' WHERE owner IS NULL OR owner = '';
UPDATE garages  SET owner = 'admin' WHERE owner IS NULL OR owner = '';
UPDATE payments SET owner = 'admin' WHERE owner IS NULL OR owner = '';
UPDATE backups  SET owner = 'admin' WHERE owner IS NULL OR owner = '';

CREATE INDEX IF NOT EXISTS markets_owner_idx  ON markets(owner);
CREATE INDEX IF NOT EXISTS shops_owner_idx    ON shops(owner);
CREATE INDEX IF NOT EXISTS garages_owner_idx  ON garages(owner);
CREATE INDEX IF NOT EXISTS payments_owner_idx ON payments(owner);
CREATE INDEX IF NOT EXISTS backups_owner_idx  ON backups(owner);
