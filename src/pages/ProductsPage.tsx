import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, ShoppingBag } from 'lucide-react';
import { FilterPanel } from '../../components/FilterPanel';
import { Button } from '../../components/Button';
import { Product, Category } from '../../types';
import { fetchProducts, fetchCategories } from '../../services/supabaseClient';

export const ProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [fetchedProducts, fetchedCategories] = await Promise.all([
                    fetchProducts(),
                    fetchCategories()
                ]);
                setProducts(fetchedProducts);
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Error loading products page data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    // Sync URL params with state
    useEffect(() => {
        // Handle Category Slug
        const categorySlug = searchParams.get('categoria');
        if (categorySlug && categories.length > 0) {
            const category = categories.find(c => c.slug === categorySlug);
            if (category) {
                setSelectedCategory(category.id);
            }
        } else if (!categorySlug) {
            setSelectedCategory('all');
        }

        // Handle Search Query
        const searchParam = searchParams.get('search');
        if (searchParam) {
            setSearchQuery(searchParam);
        } else {
            // Optional: Only clear if not already set by user interaction? 
            // Better to respect URL as source of truth on load/navigation.
            setSearchQuery('');
        }
    }, [searchParams, categories]);

    const handleQuoteProduct = (product?: Product) => {
        if (product) {
            navigate(`/cotizar?productId=${product.id}`);
        } else {
            navigate('/cotizar');
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setPriceRange({ min: 0, max: 1000 });
        setShowFeaturedOnly(false);
    };

    // Apply filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Active filter (Hide inactive products from public view)
            if (product.active === false) return false;

            // Search filter
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Category filter
            if (selectedCategory !== 'all') {
                const productCategory = categories.find(c => c.id === product.category_id);
                if (!productCategory) return false;

                // 1. Direct match (product belongs to selected category)
                if (product.category_id === selectedCategory) return true;

                // 2. Parent match (product belongs to a subcategory of selected parent)
                // If selectedCategory is a parent, we need to check if productCategory.parent_id === selectedCategory
                if (productCategory.parent_id === selectedCategory) return true;

                return false;
            }
            // Price range filter
            if (product.price < priceRange.min || product.price > priceRange.max) {
                return false;
            }
            // Featured filter
            if (showFeaturedOnly && !product.featured) {
                return false;
            }
            return true;
        });
    }, [products, searchQuery, selectedCategory, priceRange, showFeaturedOnly]);

    const activeFilterCount = [
        searchQuery !== '',
        selectedCategory !== 'all',
        priceRange.min > 0 || priceRange.max < 1000,
        showFeaturedOnly
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-brand-ivory pt-32 md:pt-48 relative overflow-hidden">
            {/* Editorial Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-[10%] w-[40vw] h-[40vw] rounded-full border border-brand-ink/5 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 w-px h-full bg-brand-ink/5" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
                {/* Page Header */}
                <div className="mb-12 md:mb-20">

                    <h1 className="text-4xl md:text-6xl font-medium text-brand-ink mb-4 tracking-tight display-font opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
                        Nuestro <span className="font-bold">catálogo</span>
                    </h1>
                    <p className="text-brand-ink/60 text-lg md:text-xl max-w-2xl font-light opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
                        Una curaduría de insumos textiles diseñados para elevar la manufactura de piezas excepcionales.
                    </p>
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-10 opacity-0 animate-reveal" style={{ animationDelay: '0.4s' }}>
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(true)}
                        className="w-full justify-between border-brand-ink/10 text-brand-ink hover:bg-brand-ink/5 px-6 py-4 rounded-xl text-sm uppercase tracking-widest font-bold"
                    >
                        <span className="flex items-center">
                            <Filter className="w-4 h-4 mr-3 stroke-[1.5px]" />
                            Filtrar por
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="bg-brand-ink text-brand-ivory text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Filter Panel */}
                    <div className="hidden lg:block w-72 flex-shrink-0 opacity-0 animate-reveal" style={{ animationDelay: '0.4s' }}>
                        <div className="sticky top-32">
                            <FilterPanel
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                priceRange={priceRange}
                                onPriceRangeChange={setPriceRange}
                                showFeaturedOnly={showFeaturedOnly}
                                onFeaturedToggle={setShowFeaturedOnly}
                                onClearFilters={clearFilters}
                                isOpen={true}
                                onClose={() => { }}
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 opacity-0 animate-reveal" style={{ animationDelay: '0.5s' }}>
                        {/* Results count */}
                        <div className="mb-10 flex items-center justify-between border-b border-brand-ink/5 pb-6">
                            <p className="text-[11px] uppercase tracking-widest text-brand-ink/40 font-bold">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
                            </p>
                            <div className="hidden md:block h-px flex-1 mx-8 bg-brand-ink/5"></div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-[1px] border-brand-ink"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                                {filteredProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col cursor-pointer"
                                        style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                                        onClick={() => navigate(`/producto/${product.id}`)}
                                    >
                                        {/* Image Container with elegant frame */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-brand-ink/[0.02] mb-6 rounded-sm">
                                            <div className="absolute inset-0 border border-brand-ink/5 z-10 pointer-events-none group-hover:inset-3 transition-all duration-700" />
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                                                loading="lazy"
                                            />
                                            {product.featured && (
                                                <div className="absolute top-4 left-4 bg-brand-ink text-brand-ivory text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 z-20">
                                                    Featured
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-brand-ink transition-colors group-hover:text-brand-accent text-lg display-font leading-tight flex-1">
                                                    {product.name}
                                                </h3>
                                                <span className="text-sm font-bold text-brand-ink/40 ml-4 tabular-nums">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-xs uppercase tracking-widest text-brand-ink/30 font-bold group-hover:text-brand-ink/50 transition-colors">
                                                Ver Detalles
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-brand-ink/[0.01] rounded-2xl border border-brand-ink/5">
                                <Filter className="w-10 h-10 text-brand-ink/10 mx-auto mb-6 stroke-[1px]" />
                                <p className="text-brand-ink/40 font-light text-lg mb-8">No se encontraron productos coincidentes.</p>
                                <Button variant="outline" size="sm" onClick={clearFilters} className="border-brand-ink/20 text-brand-ink hover:bg-brand-ink/5 uppercase tracking-widest text-[10px] font-bold px-8">
                                    Limpiar todos los filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-32"></div>

            {/* Mobile Filter Panel */}
            <div className="lg:hidden">
                <FilterPanel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    showFeaturedOnly={showFeaturedOnly}
                    onFeaturedToggle={setShowFeaturedOnly}
                    onClearFilters={clearFilters}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                />
            </div>
        </div>
    );
};
