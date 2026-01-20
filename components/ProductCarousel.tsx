import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchProducts } from '../services/supabaseClient';
import { Button } from './Button';

export const ProductCarousel: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                // Fetch all products or a specific "featured" set
                const allProducts = await fetchProducts();
                // Filter active products and take top 8 for carousel
                const displayProducts = allProducts
                    .filter(p => p.active !== false)
                    .slice(0, 10);
                setProducts(displayProducts);
            } catch (error) {
                console.error("Error loading carousel products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = direction === 'left' ? -300 : 300;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="py-24 bg-brand-ivory flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-[1px] border-brand-ink"></div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-24 bg-brand-ivory relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-brand-gold text-xs uppercase tracking-[0.3em] font-bold mb-3">Colección Destacada</p>
                    <h2 className="text-3xl md:text-5xl font-medium text-brand-ink display-font">
                        Nuestros <span className="font-bold">Favoritos</span>
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => scroll('left')}
                        className="p-3 rounded-full border border-brand-ink/10 text-brand-ink hover:bg-brand-ink hover:text-white transition-all duration-300 disabled:opacity-30"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-3 rounded-full border border-brand-ink/10 text-brand-ink hover:bg-brand-ink hover:text-white transition-all duration-300"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-12 px-6 lg:px-12 hide-scrollbar snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="min-w-[280px] md:min-w-[340px] snap-start group cursor-pointer"
                            onClick={() => navigate(`/producto/${product.id}`)}
                        >
                            <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 rounded-xl border border-brand-ink/5">
                                <div className="absolute inset-0 border border-brand-ink/5 z-10 pointer-events-none group-hover:inset-2 transition-all duration-500" />
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                                    <span className="block w-full text-center bg-white/95 backdrop-blur-sm text-brand-ink text-[10px] uppercase font-bold tracking-widest py-3 hover:bg-brand-ink hover:text-white transition-colors">
                                        Ver Producto
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-brand-ink group-hover:text-brand-gold transition-colors display-font mb-1">{product.name}</h3>
                                    <p className="text-xs text-brand-ink/40 uppercase tracking-wider font-bold">{product.category_id === '1' ? 'Tela' : product.category_id === '2' ? 'Mercería' : 'Insumo'}</p>
                                </div>
                                <span className="text-sm font-bold text-brand-ink tabular-nums">${product.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}

                    {/* "See All" Card */}
                    <div className="min-w-[280px] md:min-w-[340px] snap-start flex flex-col h-auto">
                        <div className="flex-1 rounded-xl border-2 border-dashed border-brand-ink/10 flex flex-col items-center justify-center p-8 text-center hover:border-brand-ink/30 hover:bg-brand-ink/[0.02] transition-all cursor-pointer aspect-[3/4]" onClick={() => navigate('/productos')}>
                            <div className="w-16 h-16 rounded-full bg-brand-ink/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-6 h-6 text-brand-ink" />
                            </div>
                            <h3 className="text-xl font-medium text-brand-ink mb-2">Ver Todo el Catálogo</h3>
                            <p className="text-sm text-brand-ink/60 max-w-[200px]">Explora nuestra colección completa de insumos textiles de alta gama.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <Button
                    variant="outline"
                    onClick={() => navigate('/productos')}
                    className="border-brand-ink/20 text-brand-ink hover:bg-brand-ink hover:text-white uppercase tracking-widest text-xs font-bold px-8 py-3"
                >
                    Explorar Catálogo Completo
                </Button>
            </div>
        </section>
    );
};
