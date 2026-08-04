-- Migration 005: Make garage_no unique per-owner instead of globally unique.
-- The global UNIQUE constraint on garage_no prevents different users from
-- having the same garage number (e.g. user1 cannot add "G-01" if admin has it).
-- Recreate the table without the column-level UNIQUE and add a composite
-- unique index on (garage_no, owner) instead.

CREATE TABLE garages_new (
  id             TEXT PRIMARY KEY,
  garage_no      TEXT NOT NULL,
  owner_name     TEXT NOT NULL,
  mobile_number  TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type   TEXT NOT NULL DEFAULT 'Car'
                 CHECK (vehicle_type IN ('Car', 'Bike', 'Truck', 'Other')),
  monthly_rent   INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Due'
                 CHECK (payment_status IN ('Paid', 'Due')),
  current_due    INTEGER NOT NULL DEFAULT 0,
  lease_end_date  TEXT NOT NULL DEFAULT '',
  lease_type     TEXT NOT NULL DEFAULT 'Monthly'
                 CHECK (lease_type IN ('Monthly', 'Yearly', 'Long-term')),
  address        TEXT,
  start_date     TEXT NOT NULL DEFAULT '',
  paid_rent      INTEGER NOT NULL DEFAULT 0,
  due_date       TEXT NOT NULL DEFAULT '',
  remark         TEXT,
  owner          TEXT NOT NULL DEFAULT 'admin'
);

INSERT INTO garages_new
  (id, garage_no, owner_name, mobile_number, vehicle_number, vehicle_type,
   monthly_rent, payment_status, current_due, lease_end_date, lease_type,
   address, start_date, paid_rent, due_date, remark, owner)
SELECT
  id, garage_no, owner_name, mobile_number, vehicle_number, vehicle_type,
  monthly_rent, payment_status, current_due, lease_end_date, lease_type,
  address, start_date, paid_rent, due_date, remark, owner
FROM garages;

DROP TABLE garages;
ALTER TABLE garages_new RENAME TO garages;

CREATE INDEX IF NOT EXISTS garages_payment_status_idx ON garages(payment_status);
CREATE INDEX IF NOT EXISTS garages_owner_idx           ON garages(owner);
CREATE UNIQUE INDEX IF NOT EXISTS garages_garage_no_owner_idx ON garages(garage_no, owner);
