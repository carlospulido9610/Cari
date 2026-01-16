export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  subcategories?: Category[]; // for UI convenience if we process it
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price for reference
  stock: number; // Stock disponible
  category_id: string;
  image_url: string;
  additional_images?: string[]; // Gallery of additional product images
  featured?: boolean;
  active?: boolean; // Control de visibilidad/stock
  colors?: string[];
  hardware_color?: 'Dorado' | 'Plata' | 'GoldenRose' | 'Otros'; // Color para herrajes
  min_quantity?: number;
  min_quantity_unit?: string; // 'unidad', 'docena', 'ciento', 'millar', etc.
  is_customizable?: boolean;
  customization_price?: number;
  has_variants?: boolean;
  variant_price?: number;
  variant_type?: string; // Ej: "Tipo de Tela", "Material"
  variants?: ProductVariant[];
  sku?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number; // Stock específico de la variante
  active: boolean; // Si el precio/variante está activo
  image_url?: string; // URL de imagen específica para esta variante
  sku?: string; // Sku específico de la variante
}


export interface CartItem {
  productId: string;
  productName: string;
  sku?: string; // SKU del producto o variante
  image?: string;
  price: number;
  quantity: number;
  min_quantity_unit?: string; // Unidad de medida: 'docena', 'kg', 'metro', etc.
  selectedColor?: string;
  selectedVariant?: {
    name: string;
    price: number;
    sku?: string; // SKU de la variante específica
  };
}

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
}

export interface QuoteRequest {
  customer_name: string;
  email: string;
  phone: string;
  product_id?: string;
  product_name?: string; // For display/fallback
  service_name?: string;
  quantity: number;
  specifications: string;
  items?: CartItem[]; // Structured data for stock management
}

// ... (existing content)

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface ContactEntry extends ContactRequest {
  id: string;
  created_at: string;
  attended?: boolean; // New field to mark as handled
}

export interface QuoteEntry extends QuoteRequest {
  id: string;
  created_at: string;
  attended?: boolean; // New field to mark as handled
}