import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Category, Product, ContactRequest, QuoteRequest, ContactEntry, QuoteEntry } from '../types';
import { productCategories } from '../data/productCategories';

// NOTE: Ideally, these would be in a .env file.
// If not provided, the app will fall back to mock data for demonstration.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  console.log('[Supabase] Initializing client with URL:', SUPABASE_URL);
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn('[Supabase] Credentials not found. URL exists?', !!SUPABASE_URL, 'Key exists?', !!SUPABASE_KEY);
  console.warn('Using mock data.');
}

// --- Mock Data for Demo Purposes ---
// Flatten the hierarchical category structure into a flat array with parent_id references
const DEFAULT_CATEGORIES: Category[] = [];
productCategories.forEach(parent => {
  // Add parent category
  DEFAULT_CATEGORIES.push({
    id: parent.id,
    name: parent.name,
    slug: parent.slug,
    parent_id: undefined
  });

  // Add subcategories with parent_id reference
  if (parent.subcategories) {
    parent.subcategories.forEach(sub => {
      DEFAULT_CATEGORIES.push({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        parent_id: parent.id
      });
    });
  }
});

let MOCK_CATEGORIES: Category[] = [];

const DEFAULT_PRODUCTS: Product[] = [
  { id: '101', name: 'Algodón Premium', sku: 'TEL-ALG-1001', description: 'Tela de algodón 100% de alta calidad.', price: 15.50, stock: 50, category_id: '1', image_url: 'https://images.unsplash.com/photo-1598463994356-91e77742bc54?auto=format&fit=crop&q=80&w=600' },
  { id: '102', name: 'Botones Dorados', sku: 'MER-BOT-2002', description: 'Set de botones metálicos dorados.', price: 5.00, stock: 200, category_id: '2', image_url: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&q=80&w=600', featured: true, colors: ['Dorado', 'Plateado', 'Bronce'] },
  { id: '103', name: 'Hebilla Metálica', sku: 'HER-HEB-3003', description: 'Hebilla resistente para cinturones.', price: 3.25, stock: 150, category_id: '3', image_url: 'https://images.unsplash.com/photo-1549480665-276ceb243462?auto=format&fit=crop&q=80&w=600', colors: ['Negro', 'Níquel', 'Oro Viejo'] },
  { id: '104', name: 'Etiquetas Personalizadas', sku: 'INS-ETQ-4004', description: 'Etiquetas tejidas para ropa.', price: 0.50, stock: 1000, category_id: '4', image_url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=600' },
  { id: '105', name: 'Tijeras de Corte', sku: 'HER-TIJ-5005', description: 'Tijeras profesionales para tela.', price: 25.00, stock: 15, category_id: '5', image_url: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?auto=format&fit=crop&q=80&w=600' },
  { id: '106', name: 'Lino Natural', sku: 'TEL-LIN-6006', description: 'Lino 100% natural, ideal para verano.', price: 18.00, stock: 30, category_id: '1', image_url: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=600' },
];

let MOCK_PRODUCTS: Product[] = [];

// Initialize Mock Data from LocalStorage if available
if (!supabase) {
  // Products
  const storedProducts = localStorage.getItem('mock_products');
  if (storedProducts) {
    MOCK_PRODUCTS = JSON.parse(storedProducts);
  } else {
    MOCK_PRODUCTS = [...DEFAULT_PRODUCTS];
    localStorage.setItem('mock_products', JSON.stringify(MOCK_PRODUCTS));
  }

  // Categories
  const storedCategories = localStorage.getItem('mock_categories');
  if (storedCategories) {
    MOCK_CATEGORIES = JSON.parse(storedCategories);
  } else {
    MOCK_CATEGORIES = [...DEFAULT_CATEGORIES];
    localStorage.setItem('mock_categories', JSON.stringify(MOCK_CATEGORIES));
  }
}

const saveMockProducts = () => {
  localStorage.setItem('mock_products', JSON.stringify(MOCK_PRODUCTS));
};

const saveMockCategories = () => {
  localStorage.setItem('mock_categories', JSON.stringify(MOCK_CATEGORIES));
};

// --- API Functions ---

export const fetchCategories = async (): Promise<Category[]> => {
  if (!supabase) return new Promise(resolve => setTimeout(() => resolve([...MOCK_CATEGORIES]), 500));

  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error fetching categories:', error);
    return MOCK_CATEGORIES; // Fallback on error
  }
  return data as Category[];
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (!supabase) return new Promise(resolve => setTimeout(() => resolve([...MOCK_PRODUCTS]), 800));

  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return MOCK_PRODUCTS; // Fallback
  }
  return data as Product[];
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!supabase) {
    return new Promise(resolve => {
      setTimeout(() => {
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        resolve(product || null);
      }, 500);
    });
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
  return data as Product;
};

// ... imports
import { sendToWebhook } from './webhookService';

// ... (existing code)

export const submitContactRequest = async (request: ContactRequest): Promise<boolean> => {
  // Trigger Webhook (Fire and forget, or await if critical)
  // We don't want to block the UI if the webhook is slow, but we want to ensure it triggers.
  // Let's await it but ignore errors so the user still gets a success message if the main DB (or mock) works.
  try {
    void sendToWebhook('contact', request);
  } catch (e) {
    console.error("Webhook trigger failed", e);
  }

  if (!supabase) {
    console.log('Mock Contact Submit:', request);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  const { error } = await supabase.from('contact_requests').insert([request]);
  if (error) {
    console.error('Error submitting contact:', error);
    return false;
  }
  return true;
};

export const submitQuoteRequest = async (request: QuoteRequest): Promise<boolean> => {
  try {
    void sendToWebhook('quote', request);
  } catch (e) {
    console.error("Webhook trigger failed", e);
  }

  if (!supabase) {
    console.log('Mock Quote Submit:', request);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  const { error } = await supabase.from('quotes').insert([request]);
  if (error) {
    console.error('Error submitting quote:', error);
    return false;
  }
  return true;
};

// --- Product Management (Admin) ---

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  if (!supabase) {
    // Mock create
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    MOCK_PRODUCTS.push(newProduct);
    saveMockProducts();
    return newProduct;
  }

  const { data, error } = await supabase.from('products').insert([product]).select().single();
  if (error) {
    console.error('Error creating product:', JSON.stringify(error, null, 2));
    console.error('Data attempting to insert:', product);
    return null;
  }
  return data;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  if (!supabase) {
    // Mock update
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index === -1) return null;

    MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updates };
    saveMockProducts();
    return MOCK_PRODUCTS[index];
  }

  console.log('[updateProduct] Requesting update for id:', id, 'Updates:', updates);
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('[updateProduct] Supabase error:', JSON.stringify(error, null, 2));
    (window as any).lastSupabaseError = error;
    return null;
  }
  console.log('[updateProduct] Update successful:', data);
  return data;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.log('[deleteProduct] Using mock data. id:', id);
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);

    if (index === -1) {
      console.error('[deleteProduct] Mock Product not found with id:', id);
      return false;
    }

    MOCK_PRODUCTS.splice(index, 1);
    saveMockProducts();
    return true;
  }

  console.log('[deleteProduct] Attempting Supabase delete for id:', id);
  const { error, count } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('[deleteProduct] Supabase error:', error);
    // Explicitly return the error message for the UI to show
    (window as any).lastSupabaseError = error;
    return false;
  }

  console.log('[deleteProduct] Supabase delete successful.');
  return true;
};

// --- Category Management (Admin) ---

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
  console.log('[createCategory] Called with category:', category);

  if (!supabase) {
    // Mock create
    console.log('[createCategory] Using mock data');
    console.log('[createCategory] Current MOCK_CATEGORIES length:', MOCK_CATEGORIES.length);
    const newCategory = { ...category, id: Math.random().toString(36).substr(2, 9) };
    console.log('[createCategory] New category created:', newCategory);

    MOCK_CATEGORIES.push(newCategory);
    console.log('[createCategory] Category added, new length:', MOCK_CATEGORIES.length);

    saveMockCategories();
    console.log('[createCategory] Mock data saved to localStorage');

    return newCategory;
  }

  // Generate UUID for the category since the table requires it and doesn't auto-generate
  const newId = crypto.randomUUID();
  const categoryWithId = { ...category, id: newId };

  console.log('[createCategory] Inserting into Supabase with ID:', newId);

  const { data, error } = await supabase.from('categories').insert([categoryWithId]).select().single();
  if (error) {
    console.error('Error creating category:', error);
    return null;
  }

  console.log('[createCategory] Successfully created in Supabase:', data);
  return data;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  if (!supabase) {
    // Mock update
    const index = MOCK_CATEGORIES.findIndex(c => c.id === id);
    if (index === -1) return null;

    MOCK_CATEGORIES[index] = { ...MOCK_CATEGORIES[index], ...updates };
    saveMockCategories();
    return MOCK_CATEGORIES[index];
  }

  console.log('[updateCategory] Requesting update for id:', id, 'Updates:', updates);
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) {
    console.error('[updateCategory] Supabase error:', error);
    (window as any).lastSupabaseError = error;
    return null;
  }
  return data;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.log('[deleteCategory] Using mock data. id:', id);
    const index = MOCK_CATEGORIES.findIndex(c => c.id === id);
    if (index === -1) return false;

    const hasProducts = MOCK_PRODUCTS.some(p => p.category_id === id);
    if (hasProducts) {
      console.error('[deleteCategory] Cannot delete category with products (mock check)');
      return false;
    }

    MOCK_CATEGORIES.splice(index, 1);
    saveMockCategories();
    return true;
  }

  console.log('[deleteCategory] Attempting Supabase delete for id:', id);
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    console.error('[deleteCategory] Supabase error:', error);
    (window as any).lastSupabaseError = error;
    return false;
  }
  console.log('[deleteCategory] Supabase delete successful.');
  return true;
};

// --- Image Upload (Supabase Storage) ---

export const uploadProductImage = async (file: File): Promise<string | null> => {
  if (!supabase) {
    // Mock upload - return a placeholder URL
    console.log('Mock image upload:', file.name);
    return `https://via.placeholder.com/600x400?text=${encodeURIComponent(file.name)}`;
  }

  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
      return null;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      console.error('File too large. Maximum size is 5MB.');
      return null;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop();
    const filename = `product_${timestamp}_${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error during image upload:', error);
    return null;
  }
};
// --- Admin: View Requests ---

export const fetchContacts = async (): Promise<ContactEntry[]> => {
  if (!supabase) {
    // Mock Data
    return [
      { id: '1', name: 'Juan Demo', email: 'juan@demo.com', phone: '555-0101', message: 'Me interesa cotizar telas al por mayor.', created_at: new Date().toISOString(), company: 'Textil Demo', attended: false }
    ];
  }

  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data as ContactEntry[];
};

export const fetchQuotes = async (): Promise<QuoteEntry[]> => {
  if (!supabase) {
    return [
      { id: '1', customer_name: 'Maria Tienda', email: 'maria@tienda.com', phone: '999-8888', product_name: 'Botones Dorados', quantity: 500, specifications: 'Necesito que sean de 2cm de diámetro.', created_at: new Date().toISOString(), attended: false }
    ];
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
  return data as QuoteEntry[];
};

export const deleteContact = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.log('[deleteContact] Mock delete contact:', id);
    return true;
  }

  console.log('[deleteContact] Attempting Supabase delete for id:', id);
  const { error } = await supabase.from('contact_requests').delete().eq('id', id);
  if (error) {
    console.error('[deleteContact] Supabase error:', error);
    (window as any).lastSupabaseError = error;
    return false;
  }
  console.log('[deleteContact] Supabase delete successful.');
  return true;
};

export const deleteQuote = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.log('[deleteQuote] Mock delete quote:', id);
    return true;
  }

  console.log('[deleteQuote] Attempting Supabase delete for id:', id);
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) {
    console.error('[deleteQuote] Supabase error:', error);
    (window as any).lastSupabaseError = error;
    return false;
  }
  console.log('[deleteQuote] Supabase delete successful.');
  return true;
};

export const updateContact = async (id: string, updates: Partial<ContactEntry>): Promise<boolean> => {
  if (!supabase) {
    console.log('Mock update contact:', id, updates);
    return true;
  }

  const { error } = await supabase.from('contact_requests').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating contact:', error);
    return false;
  }
  return true;
};

export const updateQuote = async (id: string, updates: Partial<QuoteEntry>): Promise<boolean> => {
  if (!supabase) {
    console.log('Mock update quote:', id, updates);
    return true;
  }

  const { error } = await supabase.from('quotes').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating quote:', error);
    return false;
  }
  return true;
};