-- ==============================================================================
-- SCRIPT DE CORRECCIÓN DEFINITIVA V6 (CON CASCADE)
-- ==============================================================================

-- 1. ELIMINAR LA FUNCIÓN QUE BLOQUEA (CON CASCADE PARA BORRAR EL TRIGGER AUTOMÁTICAMENTE)
-- El error decía que el trigger se llama "check_category_before_delete".
-- Al usar CASCADE, borramos la función y cualquier trigger que dependa de ella.

DROP FUNCTION IF EXISTS public.prevent_delete_category_with_products() CASCADE;

-- Por seguridad, intentamos borrar el trigger explícitamente también si quedó algo
DROP TRIGGER IF EXISTS check_category_before_delete ON categories;
DROP TRIGGER IF EXISTS check_category_deletion ON categories; -- El nombre que adiviné antes

-- 2. LIMPIEZA DE POLÍTICAS DUPLICADAS (Igual que antes)

-- Categorías
DROP POLICY IF EXISTS "Lectura pública de categorías" ON categories;
DROP POLICY IF EXISTS "Permitir ver categorías" ON categories;
DROP POLICY IF EXISTS "Permitir crear categorías" ON categories;
DROP POLICY IF EXISTS "Permitir actualizar categorías" ON categories;
DROP POLICY IF EXISTS "Permitir eliminar categorías" ON categories;
DROP POLICY IF EXISTS "Acceso total a categorías" ON categories;
DROP POLICY IF EXISTS "Enable all access for everyone" ON categories;
DROP POLICY IF EXISTS "Public Access Categories" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;

-- Productos
DROP POLICY IF EXISTS "Lectura pública de productos" ON products;
DROP POLICY IF EXISTS "Permitir ver productos" ON products;
DROP POLICY IF EXISTS "Permitir crear productos" ON products;
DROP POLICY IF EXISTS "Permitir actualizar productos" ON products;
DROP POLICY IF EXISTS "Permitir eliminar productos" ON products;
DROP POLICY IF EXISTS "Acceso total a productos" ON products;
DROP POLICY IF EXISTS "Enable all access for everyone" ON products;
DROP POLICY IF EXISTS "Public Access Products" ON products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;

-- Contactos
DROP POLICY IF EXISTS "Lectura pública de contactos" ON contact_requests;
DROP POLICY IF EXISTS "Acceso total a contactos" ON contact_requests;
DROP POLICY IF EXISTS "Enable all access for everyone" ON contact_requests;
DROP POLICY IF EXISTS "Public Access Contacts" ON contact_requests;
DROP POLICY IF EXISTS "Public contact_requests are viewable by everyone" ON contact_requests;

-- Pedidos / Quotes
DROP POLICY IF EXISTS "Lectura pública de pedidos" ON quotes;
DROP POLICY IF EXISTS "Acceso total a pedidos" ON quotes;
DROP POLICY IF EXISTS "Enable all access for everyone" ON quotes;
DROP POLICY IF EXISTS "Public Access Quotes" ON quotes;
DROP POLICY IF EXISTS "Public quotes are viewable by everyone" ON quotes;

-- 3. HABILITAR RLS Y CREAR POLÍTICAS PÚBLICAS NUEVAS
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Contacts" ON contact_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);

-- 4. ARREGLAR FOREIGN KEYS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_category_id_fkey' AND table_name = 'products'
    ) THEN
        ALTER TABLE products DROP CONSTRAINT products_category_id_fkey;
    END IF;
END $$;

ALTER TABLE products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories (id) 
ON DELETE SET NULL;
