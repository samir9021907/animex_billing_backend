-- ─────────────────────────────────────────────────────────────────────────────
-- ANIMEX SQL QUERY: ADD QUANTITY COLUMN TO PRODUCT TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Alters medical_products and products tables to add quantity column
ALTER TABLE medical_products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;

-- 2. Scoped query used in service/controller to update quantity
-- UPDATE medical_products SET quantity = :quantity, updated_at = NOW() WHERE id = :id AND client_id = :clientId;
