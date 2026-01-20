import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { fetchLooks, fetchProducts } from '../services/supabaseClient';

export const ShopTheLook: React.FC = () => {
    const navigate = useNavigate();
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
    const [looks, setLooks] = useState<any[]>([]);
    const [products, setProducts] = useState<Record<string, Product>>({});

    // Carousel State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Swipe State
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const minSwipeDistance = 50;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const [looksData, productsData] = await Promise.all([
                fetchLooks(),
                fetchProducts()
            ]);
            setLooks(looksData);

            const productMap: Record<string, Product> = {};
            productsData.forEach(p => {
                productMap[p.id] = p;
            });
            setProducts(productMap);
        };
        loadData();
    }, []);

    // Configuration
    const itemsPerView = isMobile ? 1 : 3;
    const maxIndex = Math.ceil(looks.length / itemsPerView) - 1;

    // Auto-play Logic
    useEffect(() => {
        startAutoPlay();
        return () => stopAutoPlay();
    }, [maxIndex, currentIndex]);

    const startAutoPlay = () => {
        stopAutoPlay();
        if (maxIndex > 0) {
            autoPlayRef.current = setTimeout(() => {
                nextSlide();
            }, 6000);
        }
    };

    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    };

    const nextSlide = () => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        stopAutoPlay();
    };

    // Swipe Handlers
    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = 0;
        touchStartX.current = e.targetTouches[0].clientX;
        stopAutoPlay();
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveHotspot(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    if (looks.length === 0) return null;

    return (
        <section className="relative w-full max-w-full bg-brand-ivory pt-10 md:pt-12 -mt-10 md:-mt-12">
            <div className="relative max-w-7xl mx-auto px-4 md:px-12">

                <div className="relative group/carousel w-full">

                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-700 ease-in-out touch-pan-y"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`,
                            }}
                        >
                            {looks.map((look) => (
                                <div
                                    key={look.id}
                                    className={`flex-shrink-0 px-2 md:px-4 box-border
                                        ${isMobile ? 'w-full' : 'w-1/3'}`}
                                >
                                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-white group/img shadow-sm hover:shadow-xl transition-all duration-500">
                                        <img
                                            src={look.image_url}
                                            alt={look.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        {look.hotspots.map((spot: any) => {
                                            const isActive = activeHotspot === spot.id;
                                            const product = products[spot.productId];

                                            if (!product) return null;

                                            return (
                                                <div
                                                    key={spot.id}
                                                    className="absolute z-40"
                                                    style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setActiveHotspot(isActive ? null : spot.id);
                                                            stopAutoPlay();
                                                        }}
                                                        className={`relative w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-300 border border-white/40 
                                                            ${isActive
                                                                ? 'bg-white text-brand-ink scale-110 shadow-lg'
                                                                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-brand-ink'}`}
                                                    >
                                                        {isActive ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                    </button>

                                                    {isActive && (
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 bg-white p-3 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="flex gap-3 items-center">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-brand-ivory">
                                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[10px] uppercase font-bold text-brand-gold truncate">
                                                                        {product.category_id === '3' ? 'Herraje' : 'Insumo'}
                                                                    </p>
                                                                    <p className="text-[11px] font-bold text-brand-ink line-clamp-1 leading-tight">{product.name}</p>
                                                                    <button
                                                                        onClick={() => navigate(`/producto/${product.id}`)}
                                                                        className="mt-1 text-[9px] font-bold uppercase tracking-wider text-brand-ink/60 hover:text-brand-ink transition-colors"
                                                                    >
                                                                        Ver Detalle
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 text-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                                        <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/80">{look.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-1.5 mt-8 pb-4">
                        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className="p-1 group/dot focus:outline-none"
                                aria-label={`Ir al grupo ${index + 1}`}
                            >
                                <div className={`rounded-full transition-all duration-300 
                                    ${index === currentIndex ? 'bg-brand-gold w-6 h-1.5' : 'bg-brand-gold/30 w-1.5 h-1.5 group-hover/dot:bg-brand-gold/50'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
