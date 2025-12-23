import React, { useState } from 'react';
import { Category, Product } from '../types';
import { Button } from './Button';
import { Filter, ShoppingBag } from 'lucide-react';

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  onQuoteProduct: (product: Product) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ products, categories, isLoading, onQuoteProduct }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_id === activeCategory);

  return (
    <section id="products" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Colecciones Textiles Curadas</h2>
          <p className="text-slate-600 text-lg">Explora nuestra selección premium de materiales diseñados para durabilidad y estética.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            variant={activeCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className={activeCategory === 'all' ? '' : 'bg-slate-50'}
          >
            Todos
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? '' : 'bg-slate-50'}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {product.featured && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-900 shadow-sm">
                      Más Vendido
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-baseline mb-2 gap-2">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">{product.name}</h3>
                    <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">{product.description}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-auto border-slate-200 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"
                    onClick={() => onQuoteProduct(product)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Cotizar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
};