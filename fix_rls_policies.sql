-- =======================================================
-- FORCE DROP ALL KNOWN POLICIES BY NAME
-- =======================================================
DROP POLICY IF EXISTS "policy_products_select_public" ON public.products;
DROP POLICY IF EXISTS "policy_products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "policy_products_update_admin" ON public.products;
DROP POLICY IF EXISTS "policy_products_delete_admin" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
DROP POLICY IF EXISTS "Admin All Products" ON public.products;
DROP POLICY IF EXISTS "Public Access Products" ON public.products;

DROP POLICY IF EXISTS "policy_categories_select_public" ON public.categories;
DROP POLICY IF EXISTS "policy_categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "policy_categories_update_admin" ON public.categories;
DROP POLICY IF EXISTS "policy_categories_delete_admin" ON public.categories;
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Insert Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Update Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Delete Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Access Categories" ON public.categories;

DROP POLICY IF EXISTS "policy_contacts_insert_public" ON public.contact_requests;
DROP POLICY IF EXISTS "policy_contacts_select_admin" ON public.contact_requests;
DROP POLICY IF EXISTS "policy_contacts_update_admin" ON public.contact_requests;
DROP POLICY IF EXISTS "policy_contacts_delete_admin" ON public.contact_requests;
DROP POLICY IF EXISTS "Public Insert Contacts" ON public.contact_requests;
DROP POLICY IF EXISTS "Admin View Contacts" ON public.contact_requests;
DROP POLICY IF EXISTS "Admin Update Contacts" ON public.contact_requests;
DROP POLICY IF EXISTS "Admin Delete Contacts" ON public.contact_requests;
DROP POLICY IF EXISTS "Admin Manage Contacts" ON public.contact_requests;
DROP POLICY IF EXISTS "Public Access Contacts" ON public.contact_requests;

DROP POLICY IF EXISTS "policy_quotes_insert_public" ON public.quotes;
DROP POLICY IF EXISTS "policy_quotes_select_admin" ON public.quotes;
DROP POLICY IF EXISTS "policy_quotes_update_admin" ON public.quotes;
DROP POLICY IF EXISTS "policy_quotes_delete_admin" ON public.quotes;
DROP POLICY IF EXISTS "Public Insert Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin View Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Update Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Delete Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin Manage Quotes" ON public.quotes;
DROP POLICY IF EXISTS "Public Access Quotes" ON public.quotes;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- CREATE OPTIMIZED POLICIES
-- =======================================================

-- PRODUCTS
CREATE POLICY "products_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- CATEGORIES
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "categories_update" ON public.categories FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "categories_delete" ON public.categories FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- CONTACT REQUESTS
CREATE POLICY "contacts_insert" ON public.contact_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "contacts_select" ON public.contact_requests FOR SELECT TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "contacts_update" ON public.contact_requests FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "contacts_delete" ON public.contact_requests FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- QUOTES
CREATE POLICY "quotes_insert" ON public.quotes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "quotes_select" ON public.quotes FOR SELECT TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "quotes_update" ON public.quotes FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "quotes_delete" ON public.quotes FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');
