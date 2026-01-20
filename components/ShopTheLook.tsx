import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { Product } from '../types';

import { fetchLooks, fetchProducts } from '../services/supabaseClient';

// Remove hardcoded LOOKS_DATA and MOCK_PRODUCTS_LOOKUP

export const ShopTheLook: React.FC = () => {
    const navigate = useNavigate();
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
    const [currentLookIndex, setCurrentLookIndex] = useState(0);
    const [looks, setLooks] = useState<any[]>([]);
    const [products, setProducts] = useState<Record<string, Product>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            const [looksData, productsData] = await Promise.all([
                fetchLooks(),
                fetchProducts()
            ]);
            setLooks(looksData);

            // Map products for easy lookup
            const productMap: Record<string, Product> = {};
            productsData.forEach(p => {
                productMap[p.id] = p;
            });
            setProducts(productMap);
        };
        loadData();
    }, []);

    // Sync scroll position with dots
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth;
            const scrollLeft = scrollRef.current.scrollLeft;
            const clientWidth = scrollRef.current.clientWidth;
            const itemWidth = scrollRef.current.children[0]?.clientWidth || 350;
            const gap = window.innerWidth >= 768 ? 32 : 16;
            const index = Math.round(scrollLeft / (itemWidth + gap));
            if (!isNaN(index) && index >= 0 && index < looks.length) {
                setCurrentLookIndex(index);
            }
        }
    };

    // Scroll to index when dot is clicked
    const scrollToLook = (index: number) => {
        if (scrollRef.current) {
            const itemWidth = scrollRef.current.children[0].clientWidth;
            const gap = window.innerWidth >= 768 ? 32 : 16;
            scrollRef.current.scrollTo({
                left: index * (itemWidth + gap),
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveHotspot(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <section className="py-12 md:py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                <div className="relative group w-full">
                    {/* Horizontal Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-4 md:space-x-8 pb-4"
                        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
                    >
                        {looks.map((look) => (
                            <div
                                key={look.id}
                                className="relative flex-none w-[85vw] md:w-[350px] snap-center"
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[3/4] bg-brand-ivory group/img">
                                    <img
                                        src={look.image_url}
                                        alt={look.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                    />

                                    {/* Overlay Gradient for better visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                                    {/* Hotspots */}
                                    {look.hotspots.map((spot) => {
                                        const isActive = activeHotspot === spot.id;
                                        const isOnRightHalf = spot.x > 50;
                                        const isOnBottomHalf = spot.y > 50;

                                        return (
                                            <div
                                                key={spot.id}
                                                className="absolute z-40"
                                                style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => setActiveHotspot(isActive ? null : spot.id)}
                                                    className={`relative w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-300 border border-white/20 ${isActive ? 'bg-white text-brand-ink scale-125 shadow-xl' : 'bg-white/10 backdrop-blur-[2px] text-white/70 hover:bg-white hover:text-brand-ink shadow-sm'}`}
                                                    aria-label={isActive ? "Cerrar" : "Ver producto"}
                                                >
                                                    {isActive ? <X className="w-3 h-3" /> : <Plus className="w-2.5 h-2.5 opacity-50" />}
                                                    <div className={`absolute -inset-1.5 rounded-full border border-white/10 ${isActive ? '' : 'animate-pulse'}`} />
                                                </button>

                                                {/* Popover Product Card */}
                                                {isActive && (
                                                    <div
                                                        className={`absolute left-1/2 -translate-x-1/2 w-64 bg-white p-3 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 
                                                        ${isOnBottomHalf ? 'bottom-full mb-4' : 'top-full mt-4'}
                                                        hidden md:block`}
                                                    >
                                                        {/* Pointer arrow - flips up or down */}
                                                        <div className={`absolute left-1/2 -translate-x-1/2 border-8 border-transparent 
                                                            ${isOnBottomHalf ? 'top-full border-t-white' : 'bottom-full border-b-white'}`}
                                                        />

                                                        {(() => {
                                                            const product = products[spot.productId];
                                                            if (!product) return null;
                                                            return (
                                                                <div className="flex gap-3">
                                                                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-brand-ivory border border-gray-100">
                                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                                        <div>
                                                                            <p className="text-[9px] uppercase font-bold text-brand-gold tracking-tight truncate opacity-70">
                                                                                {product.category_id === '3' ? 'Herraje' : 'Insumo'}
                                                                            </p>
                                                                            <h4 className="text-[11px] font-bold text-brand-ink leading-tight line-clamp-2">{product.name}</h4>
                                                                        </div>
                                                                        <div className="flex items-center justify-between mt-1">
                                                                            <span className="text-[11px] font-bold text-brand-ink">${product.price?.toFixed(2)}</span>
                                                                            <button
                                                                                onClick={() => navigate(`/producto/${product.id}`)}
                                                                                className="text-[9px] font-bold uppercase tracking-widest text-brand-ink border-b border-brand-ink/20 hover:border-brand-ink transition-colors"
                                                                            >
                                                                                Ver
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}

                                                {/* Mobile Version: Overlay popover at bottom of card */}
                                                {isActive && (
                                                    <div className="md:hidden fixed inset-x-4 bottom-24 bg-white p-4 rounded-2xl shadow-2xl z-[60] animate-in slide-in-from-bottom-4 duration-300">
                                                        {(() => {
                                                            const product = products[spot.productId];
                                                            if (!product) return null;
                                                            return (
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-brand-ivory border border-gray-100">
                                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <p className="text-[10px] uppercase font-bold text-brand-gold tracking-wider">
                                                                                {product.category_id === '3' ? 'Herraje' : 'Insumo'}
                                                                            </p>
                                                                            <button onClick={() => setActiveHotspot(null)}>
                                                                                <X className="w-4 h-4 text-brand-ink/40" />
                                                                            </button>
                                                                        </div>
                                                                        <h4 className="text-sm font-bold text-brand-ink leading-tight mb-2 truncate">{product.name}</h4>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm font-black text-brand-ink">${product.price?.toFixed(2)}</span>
                                                                            <button
                                                                                onClick={() => navigate(`/producto/${product.id}`)}
                                                                                className="px-4 py-1.5 bg-brand-ink text-white text-[10px] font-bold uppercase tracking-widest rounded-full"
                                                                            >
                                                                                Ver Producto
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3 mt-8 md:hidden">
                        {looks.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToLook(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentLookIndex ? 'bg-brand-ink w-8 scale-110' : 'bg-brand-ink/20 hover:bg-brand-ink/40'}`}
                                aria-label={`Ir al look ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Desktop desktop label */}
                    <div className="hidden md:block mt-8 text-center">
                        <p className="text-[10px] font-bold text-brand-ink/30 tracking-[0.3em] uppercase">Desliza para explorar la colección</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
