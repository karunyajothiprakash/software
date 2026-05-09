-- NUCLEAR RESET SCRIPT (V3)
-- This script uses the CORRECT table names found in your code.

-- 1. Export & Logistics
DELETE FROM public.export_containers;
DELETE FROM public.export_shipments;
DELETE FROM public.export_orders;

-- 2. CRM & Sales
DELETE FROM public.leads;
DELETE FROM public.sales_orders;
DELETE FROM public.customers;
DELETE FROM public.quotations;

-- 3. Procurement & Supply Chain
DELETE FROM public.purchase_orders;
DELETE FROM public.suppliers;
DELETE FROM public.farmers;

-- 4. Inventory & Quality
DELETE FROM public.qc_inspections;
DELETE FROM public.inventory_batches;
DELETE FROM public.products;

-- Note: Profile and Role data is KEPT so you can still log in.
