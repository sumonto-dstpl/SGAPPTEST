-- Migration 006: Add shop_area + payment_date columns.
-- shop_area stores the shop area in sqft (user-entered text).
-- payment_date stores the date+time when a payment was collected.

ALTER TABLE shops   ADD COLUMN shop_area    TEXT;
ALTER TABLE shops   ADD COLUMN payment_date TEXT;
ALTER TABLE garages ADD COLUMN payment_date TEXT;
