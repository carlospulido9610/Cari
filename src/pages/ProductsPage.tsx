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
        <div className="min-h-screen bg-[#fdfdfd] pt-20 md:pt-24 relative overflow-hidden">
            {/* Background Decorative Elements for subtle branding */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#44b6da]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1e3857]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Page Header */}
                <div className="mb-4 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-1 md:mb-2 tracking-tight">Nuestro Catálogo</h1>
                    <p className="text-slate-500 text-sm md:text-lg">Explora nuestra selección de insumos textiles premium.</p>
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(true)}
                        className="w-full justify-center border-slate-200 text-slate-600 hover:border-[#44b6da] hover:text-[#44b6da]"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <span className="ml-2 bg-[#44b6da] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filter Panel */}
                    <div className="hidden lg:block w-72 flex-shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
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
                    <div className="flex-1">
                        {/* Results count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-slate-500 font-medium">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#44b6da]"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="group bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#1e3857]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                                        onClick={() => navigate(`/producto/${product.id}`)}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            {product.featured && (
                                                <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 backdrop-blur text-[9px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full text-slate-900 shadow-sm border border-slate-100">
                                                    Más Vendido
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 md:p-5 flex-1 flex flex-col">
                                            <div className="flex flex-col md:flex-row justify-between items-start mb-1.5 md:mb-2 gap-1 md:gap-4 flex-1">
                                                <h3 className="font-bold text-slate-900 group-hover:text-[#44b6da] transition-colors line-clamp-2 md:line-clamp-1 text-xs md:text-lg leading-tight w-full">{product.name}</h3>
                                                <span className="text-[10px] md:text-sm font-bold text-slate-500 whitespace-nowrap bg-slate-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded md:rounded-lg border border-slate-100 mt-1 md:mt-0">${product.price.toFixed(2)}</span>
                                            </div>
                                            <div className="mt-auto pt-1.5 md:pt-2">
                                                <span className="text-[9px] md:text-xs text-[#44b6da] font-medium uppercase tracking-wider block text-right md:text-left">Ver Detalles</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 mb-4">No se encontraron productos con los filtros seleccionados.</p>
                                <Button variant="outline" size="sm" onClick={clearFilters} className="hover:text-[#44b6da] hover:border-[#44b6da]">
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom spacing */}
            <div className="h-24"></div>

            {/* Mobile Filter Panel - Rendered at root level to avoid z-index trapping */}
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
