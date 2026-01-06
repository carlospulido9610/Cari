export interface Category {
    id: string;
    created_at?: string;
    name: string;
    slug: string;
    parent_id?: string | null;
}

export interface Product {
    id: string;
    created_at?: string;
    name: string;
    description?: string;
    price: number;
    image_url: string;
    category_id: string;
    active: boolean;
    featured: boolean;
    stock?: number;
}
