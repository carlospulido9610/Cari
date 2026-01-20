
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, Category } from '../../types';
import { fetchProductById, fetchProducts, fetchCategories } from '../services/supabaseClient';
import { Button } from '../../components/Button';
import { Star, Truck, Shield, ArrowRight, Share2, Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck, Phone, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductDetailsPageProps { }

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeColor, setActiveColor] = useState<string | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState<string>('');
    const { addToCart } = useCart();

    // Dynamic price based on selection
    const [displayPrice, setDisplayPrice] = useState<number>(0);
    const [displayStock, setDisplayStock] = useState<number>(0);
    const [displayImage, setDisplayImage] = useState<string>('');

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await fetchProductById(id);
                setProduct(data);

                // Initialize URL/State
                if (data) {
                    setDisplayPrice(data.price);
                    setDisplayStock(data.stock ?? 0);
                    setDisplayImage(data.image_url);

                    if (data.colors && data.colors.length > 0) {
                        setActiveColor(data.colors[0]);
                    }

                    if (data.has_variants && data.variants && data.variants.length > 0) {
                        const parentStock = data.stock ?? 0;
                        const firstActive = data.variants.find(v => {
                            if (!v.active) return false;
                            const effectiveStock = (v.stock !== undefined && v.stock !== null)
                                ? v.stock
                                : parentStock;
                            return effectiveStock > 0;
                        }) || data.variants.find(v => v.active);

                        if (firstActive) {
                            setSelectedVariant(firstActive);
                            setDisplayPrice(firstActive.price > 0 ? firstActive.price : data.price);
                            const variantStock = (firstActive.stock !== undefined && firstActive.stock !== null)
                                ? firstActive.stock
                                : (data.stock ?? 0);
                            setDisplayStock(variantStock);
                            if (firstActive.image_url) {
                                setDisplayImage(firstActive.image_url);
                            }
                        }
                    }

                    setQuantity(data.min_quantity || 1);
                }
            } catch (error) {
                console.error("Error loading product", error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    useEffect(() => {
        const loadRelatedAndCategory = async () => {
            if (!product) return;

            const allProducts = await fetchProducts();
            const related = allProducts
                .filter(p => p.category_id === product.category_id && p.id !== product.id && p.active !== false)
                .slice(0, 4);
            setRelatedProducts(related);

            const categories = await fetchCategories();
            const category = categories.find(c => c.id === product.category_id);
            if (category) {
                setCategoryName(category.name);
            }
        };
        loadRelatedAndCategory();
    }, [product]);

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        const price = variant.price > 0 ? variant.price : (product?.price || 0);
        setDisplayPrice(price);
        const variantStock = (variant.stock !== undefined && variant.stock !== null) ? variant.stock : (product?.stock ?? 0);
        setDisplayStock(variantStock);
        if (variant.image_url) {
            setDisplayImage(variant.image_url);
        } else if (product) {
            setDisplayImage(product.image_url);
        }
    };

    const handleAddToCart = () => {
        if (!product || isAdding) return;

        setIsAdding(true);

        addToCart({
            productId: product.id,
            productName: product.name,
            sku: selectedVariant?.sku || product.sku,
            image: product.image_url,
            price: displayPrice,
            quantity: quantity,
            min_quantity_unit: product.min_quantity_unit,
            selectedColor: activeColor || undefined,
            selectedVariant: selectedVariant ? {
                name: selectedVariant.name,
                price: selectedVariant.price,
                sku: selectedVariant.sku
            } : undefined
        });

        setTimeout(() => setIsAdding(false), 800);
    };

    const handleQuote = () => {
        handleAddToCart();
        navigate('/cotizar');
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-brand-ivory">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 text-center bg-brand-ivory">
                <h2 className="text-2xl font-bold text-brand-gold mb-4">Producto no encontrado</h2>
                <Button onClick={() => navigate('/productos')}>Volver al catálogo</Button>
            </div>
        );
    }

    const hasVariants = product.has_variants && product.variants && product.variants.length > 0;

    return (
        <div className="min-h-screen bg-brand-ivory pt-4 pb-12 md:pt-28 md:pb-32 relative overflow-hidden">
            {/* Minimal Background Geometry */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-px h-full bg-brand-ink/5" />
                <div className="absolute bottom-1/4 left-0 w-full h-px bg-brand-ink/5" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 relative z-10">

                {/* Breadcrumb / Back */}


                <div className="bg-transparent overflow-hidden">
                    {/* Mobile Back Button - Float above content */}
                    <div className="md:hidden mb-4 pl-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 text-brand-ink/60 hover:text-brand-ink transition-colors"
                        >
                            <div className="p-2 bg-white rounded-full shadow-sm border border-brand-ink/5">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium uppercase tracking-widest">Volver</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-24">

                        {/* Image Section - Hero Scale */}
                        <div className="lg:col-span-7 space-y-3 md:space-y-8 opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
                            <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-brand-ink/[0.02] rounded-xl md:rounded-2xl border border-brand-ink/5 group">
                                <div className="absolute inset-0 border border-brand-ink/5 z-10 pointer-events-none group-hover:inset-3 transition-all duration-700" />
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                                />
                                {product.featured && (
                                    <div className="absolute top-4 right-4 md:top-8 md:left-8 bg-brand-ink text-brand-ivory text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 z-20">
                                        Exclusivo
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery - Refined */}
                            {(() => {
                                const variantImages = product.variants?.map(v => v.image_url).filter(Boolean) as string[] || [];
                                const allImages = Array.from(new Set([
                                    product.image_url,
                                    ...(product.additional_images || []),
                                    ...variantImages
                                ])).filter(Boolean);
                                if (allImages.length > 0) {
                                    return (
                                        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-4 scrollbar-hide">
                                            {allImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setDisplayImage(img)}
                                                    className={`flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border transition-all ${displayImage === img ? 'border-brand-ink' : 'border-brand-ink/5 hover:border-brand-ink/20 opacity-60 hover:opacity-100'}`}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`${product.name} ${idx + 1} `}
                                                        className="w-full h-full object-cover bg-brand-ivory"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Info Section - Editorial Detail */}
                        <div className="lg:col-span-5 flex flex-col h-full opacity-0 animate-reveal" style={{ animationDelay: '0.3s' }}>
                            <div className="mb-auto space-y-4 md:space-y-8">
                                <div className="space-y-1 md:space-y-4">


                                    <h1 className="text-2xl md:text-5xl lg:text-6xl font-medium text-brand-ink tracking-tight display-font leading-none">
                                        {product.name}
                                    </h1>

                                    {product.sku && (
                                        <p className="text-[10px] uppercase tracking-widest text-brand-ink/30 font-bold">
                                            Ref. <span className="text-brand-ink/60 select-all">{product.sku}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="border-y border-brand-ink/5 py-4 md:py-8 space-y-2 md:space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl md:text-4xl font-medium text-brand-ink display-font tabular-nums">
                                            ${displayPrice.toFixed(2)}
                                        </span>
                                        {displayStock > 0 ? (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent px-3 py-1 bg-brand-accent/5 rounded-full border border-brand-accent/10">
                                                En Stock
                                            </span>
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-red-500/60 px-3 py-1 bg-red-500/5 rounded-full border border-red-500/10">
                                                No Disponible
                                            </span>
                                        )}
                                    </div>
                                    {product.min_quantity && product.min_quantity > 1 && (
                                        <p className="text-[11px] text-brand-ink/40 tracking-widest font-bold uppercase">
                                            Pedido Mínimo: {product.min_quantity} {product.min_quantity_unit || 'unidades'}
                                        </p>
                                    )}
                                </div>

                                {product.description && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/40">Descripción</h4>
                                        <p className="text-brand-ink/60 text-lg font-medium leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Variants Selection - Minimal Grid */}
                                {hasVariants && (
                                    <div className="space-y-6">
                                        <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/40">
                                            {product.variant_type || 'Opciones'}
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {product.variants?.filter(v => v.active).map((variant) => {
                                                const effectiveStock = (variant.stock !== undefined && variant.stock !== null)
                                                    ? variant.stock
                                                    : (product.stock ?? 0);
                                                const isOutOfStock = effectiveStock <= 0;

                                                return (
                                                    <button
                                                        key={variant.id}
                                                        onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                                                        disabled={isOutOfStock}
                                                        className={`
px-6 py-3 border text-[10px] uppercase tracking-widest font-bold font-sans transition-all duration-300 rounded-full
                                                        ${isOutOfStock
                                                                ? 'opacity-20 cursor-not-allowed grayscale'
                                                                : selectedVariant?.id === variant.id
                                                                    ? 'border-brand-ink bg-brand-ink text-brand-ivory'
                                                                    : 'border-brand-ink/10 text-brand-ink/60 hover:border-brand-ink/30'
                                                            }
`}
                                                    >
                                                        {variant.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selection - Simplified Dots */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/40">
                                            Atributo de Color: <span className="text-brand-ink font-bold ml-1">{activeColor}</span>
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setActiveColor(color)}
                                                    className={`
px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all duration-300 rounded-full
                                                        ${activeColor === color
                                                            ? 'border-brand-ink bg-brand-ink/5 text-brand-ink'
                                                            : 'border-brand-ink/5 text-brand-ink/40 hover:border-brand-ink/20'
                                                        }
`}
                                                    title={color}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector - Minimal */}
                                <div className="space-y-3 md:space-y-6">
                                    <h3 className="text-[11px] uppercase tracking-widest font-bold text-brand-ink/40">Cantidad</h3>
                                    <div className="flex items-center space-x-12">
                                        <div className="flex items-center space-x-8 border-b border-brand-ink/10 pb-2 min-w-[120px]">
                                            <button
                                                onClick={() => setQuantity(Math.max(product.min_quantity || 1, (typeof quantity === 'number' ? quantity : 1) - 1))}
                                                disabled={(typeof quantity === 'number' ? quantity : 1) <= (product.min_quantity || 1)}
                                                className="text-brand-ink/30 hover:text-brand-ink font-medium text-2xl transition-colors disabled:opacity-10"
                                            >
                                                &minus;
                                            </button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') { setQuantity('' as any); return; }
                                                    const num = parseInt(val);
                                                    if (!isNaN(num) && num >= 0) { setQuantity(num); }
                                                }}
                                                onBlur={() => {
                                                    let val = typeof quantity === 'number' ? quantity : parseInt(quantity as any) || 0;
                                                    const minQty = product.min_quantity || 1;
                                                    if (val < minQty) val = minQty;
                                                    if (displayStock > 0 && val > displayStock) val = displayStock;
                                                    if (val > 9999) val = 9999;
                                                    setQuantity(val);
                                                }}
                                                className="w-full text-center text-xl font-medium text-brand-ink bg-transparent outline-none display-font tabular-nums"
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(displayStock, (typeof quantity === 'number' ? quantity : 1) + 1))}
                                                disabled={(typeof quantity === 'number' ? quantity : 1) >= displayStock}
                                                className="text-brand-ink/30 hover:text-brand-ink font-medium text-2xl transition-colors disabled:opacity-10"
                                            >
                                                &#43;
                                            </button>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/30">
                                            {product.min_quantity_unit || 'unidades'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-6 md:mt-16 pt-6 md:pt-12 border-t border-brand-ink/5 flex flex-col gap-4 md:gap-6">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className={`w-full tracking-[0.2em] ${isAdding ? '!bg-brand-accent border-brand-accent' : ''}`}
                                    onClick={handleAddToCart}
                                    isLoading={isAdding}
                                    disabled={isAdding || displayStock === 0}
                                >
                                    {isAdding ? 'Agregado al Carrito' : displayStock === 0 ? 'Agotado Temporalmente' : 'Agregar al Carrito'}
                                </Button>

                                {product.is_customizable && (
                                    <div className="flex flex-col items-center justify-center p-6 bg-brand-ink/[0.02] border border-brand-ink/5 rounded-2xl space-y-2">
                                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/60">Servicio de Personalización</span>
                                        {product.customization_price && product.customization_price > 0 && (
                                            <span className="text-[10px] font-bold text-brand-accent">
                                                &plus; ${product.customization_price.toFixed(2)} / unidad
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Footer - Minimal Bar */}
                    <div className="mt-32 pt-16 border-t border-brand-ink/5">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { icon: Truck, title: "Logística Global", desc: "Envíos directos a todo el país" },
                                { icon: ShieldCheck, title: "Calidad Certificada", desc: "Garantía total en insumos premium" },
                                { icon: Phone, title: "Asesoría Técnica", desc: "Soporte experto especializado" },
                                { icon: Check, title: "Aliado Mayorista", desc: "Escalabilidad para grandes marcas" },
                            ].map((feature, idx) => (
                                <div key={idx} className="space-y-3">
                                    <feature.icon className="w-5 h-5 text-brand-ink/20 stroke-[1.5px]" />
                                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-brand-ink">{feature.title}</h4>
                                    <p className="text-xs text-brand-ink/40 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div >

                {/* Related Products - Asymmetric Grid */}
                {
                    relatedProducts.length > 0 && (
                        <div className="mt-20 opacity-0 animate-reveal" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center space-x-6 mb-8">
                                <h2 className="text-2xl md:text-3xl font-medium text-brand-ink display-font">Más opciones</h2>
                                <div className="h-px flex-1 bg-brand-ink/5"></div>
                            </div>

                            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-6 px-6">
                                {relatedProducts.map((related) => (
                                    <div
                                        key={related.id}
                                        onClick={() => {
                                            navigate(`/ producto / ${related.id} `);
                                            window.scrollTo(0, 0);
                                        }}
                                        className="group cursor-pointer flex-shrink-0 w-40 md:w-48 snap-start"
                                    >
                                        <div className="relative aspect-[4/5] overflow-hidden bg-brand-ink/[0.02] mb-3 rounded-xl">
                                            <img
                                                src={related.image_url}
                                                alt={related.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium text-brand-ink truncate group-hover:text-brand-accent transition-colors">{related.name}</h3>
                                        <span className="text-sm font-bold text-brand-ink/50 tabular-nums">${related.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};
