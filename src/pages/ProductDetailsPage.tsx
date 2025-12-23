import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, ProductVariant, Category } from '../../types';
import { fetchProductById, fetchProducts, fetchCategories } from '../../services/supabaseClient';
import { Button } from '../../components/Button';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Phone, Check, AlertCircle } from 'lucide-react';
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
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center bg-[#fdfdfd]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#44b6da]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 text-center bg-[#fdfdfd]">
                <h2 className="text-2xl font-bold text-[#1e3857] mb-4">Producto no encontrado</h2>
                <Button onClick={() => navigate('/productos')}>Volver al catálogo</Button>
            </div>
        );
    }

    const hasVariants = product.has_variants && product.variants && product.variants.length > 0;

    return (
        <div className="min-h-screen pt-20 pb-10 md:pt-28 md:pb-16 bg-[#fdfdfd] relative overflow-hidden">
            {/* Ambient Background Elements - Light Theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#44b6da]/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1e3857]/5 rounded-full blur-[120px] animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Breadcrumb / Back */}
                <div className="mb-4 md:mb-8">
                    <Link to="/productos" className="inline-flex items-center text-slate-500 hover:text-[#44b6da] transition-colors font-bold text-xs md:text-sm uppercase tracking-wide">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Productos
                    </Link>
                </div>

                <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl md:shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* Image Section with Gallery */}
                        <div className="bg-white relative flex flex-col p-4 md:p-6 lg:p-8">
                            {/* Main Image */}
                            <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden group rounded-2xl bg-white flex items-center justify-center">
                                <img
                                    src={displayImage}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                />
                                {product.featured && (
                                    <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-yellow-400 text-yellow-950 text-[10px] md:text-xs font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg z-10">
                                        ⭐ Destacado
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {(() => {
                                const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean);
                                if (allImages.length > 1) {
                                    return (
                                        <div className="mt-4">
                                            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                {allImages.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setDisplayImage(img)}
                                                        className={`flex-shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${displayImage === img ? 'border-[#44b6da] ring-2 ring-[#44b6da]/20' : 'border-slate-100 hover:border-slate-300'}`}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`${product.name} ${idx + 1}`}
                                                            className="w-full h-full object-contain bg-white"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>

                        {/* Info Section */}
                        <div className="p-4 md:p-8 lg:p-12 flex flex-col h-full bg-white relative">
                            {/* Decorative line */}
                            <div className="absolute top-10 left-0 w-1 h-32 bg-gradient-to-b from-[#44b6da] to-transparent rounded-r-full lg:block hidden"></div>

                            <div className="mb-auto">
                                {categoryName ? (
                                    <Link
                                        to={`/productos?category=${product.category_id}`}
                                        className="text-[10px] md:text-xs font-bold text-[#44b6da] tracking-widest uppercase mb-1.5 md:mb-3 block hover:text-[#1e3857] transition-colors"
                                    >
                                        {categoryName}
                                    </Link>
                                ) : (
                                    <span className="text-[10px] md:text-xs font-bold text-[#44b6da] tracking-widest uppercase mb-1.5 md:mb-3 block">
                                        Detalle del Producto
                                    </span>
                                )}
                                <h1 className="text-xl md:text-3xl lg:text-5xl font-black text-[#1e3857] mb-2 md:mb-4 tight-leading tracking-tight leading-tight">
                                    {product.name}
                                </h1>
                                {product.sku && (
                                    <p className="text-[10px] md:text-xs text-slate-400 font-mono mb-4 md:mb-6 bg-slate-50 inline-block px-2 py-1 rounded">
                                        SKU: <span className="text-slate-600 select-all font-semibold">{product.sku}</span>
                                    </p>
                                )}

                                <div className="flex flex-col mb-5 md:mb-8 p-3 md:p-6 bg-slate-50/50 rounded-xl md:rounded-2xl border border-slate-100">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl md:text-4xl font-black text-[#1e3857] tracking-tight">
                                            ${displayPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    {product.min_quantity && product.min_quantity > 1 && (
                                        <span className="text-[10px] md:text-xs font-bold text-[#44b6da] mt-1 uppercase tracking-wide">
                                            Mínimo: {product.min_quantity} {product.min_quantity_unit || 'unidades'}
                                        </span>
                                    )}
                                    <div className="mt-3 md:mt-4 flex items-center gap-2">
                                        {displayStock > 0 ? (
                                            <span className="text-xs md:text-sm font-bold text-green-700 bg-green-100/50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 border border-green-200">
                                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                Disponible
                                            </span>
                                        ) : (
                                            <span className="text-xs md:text-sm font-bold text-red-700 bg-red-100/50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 border border-red-200">
                                                <AlertCircle className="w-3 h-3" />
                                                Agotado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {product.description && (
                                    <p className="text-slate-600 leading-normal md:leading-relaxed mb-5 md:mb-8 text-sm md:text-lg font-light">
                                        {product.description}
                                    </p>
                                )}

                                {/* Variants Selection */}
                                {hasVariants && (
                                    <div className="mb-5 md:mb-8 animate-fade-in-up">
                                        <h3 className="text-xs md:text-sm font-bold text-[#1e3857] mb-2 md:mb-4 uppercase tracking-wide flex items-center gap-2">
                                            {product.variant_type || 'Opciones'}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
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
                                                        relative px-3 py-1.5 md:px-5 md:py-3 rounded-lg md:rounded-xl border-2 text-[10px] md:text-sm font-bold transition-all duration-200 flex flex-col items-center min-w-[70px] md:min-w-[90px]
                                                        ${isOutOfStock
                                                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                                                : selectedVariant?.id === variant.id
                                                                    ? 'border-[#1e3857] bg-[#1e3857] text-white shadow-lg shadow-[#1e3857]/20 transform scale-105'
                                                                    : 'border-slate-100 text-slate-500 bg-white hover:border-[#44b6da] hover:text-[#44b6da]'
                                                            }
                                                    `}
                                                    >
                                                        <span>{variant.name}</span>
                                                        {isOutOfStock ? (
                                                            <span className="text-[9px] md:text-[10px] text-red-400 font-bold mt-0.5">Agotado</span>
                                                        ) : (
                                                            variant.price > 0 && variant.price !== product.price && (
                                                                <span className={`text-[9px] md:text-[10px] font-mono mt-0.5 ${selectedVariant?.id === variant.id ? 'text-white/80' : 'text-slate-400'}`}>${variant.price.toFixed(2)}</span>
                                                            )
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selection */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="mb-5 md:mb-8 animate-fade-in-up [animation-delay:0.1s]">
                                        <h3 className="text-xs md:text-sm font-bold text-[#1e3857] mb-2 md:mb-4 uppercase tracking-wide">
                                            Color: <span className="text-[#44b6da] font-bold ml-1">{activeColor}</span>
                                        </h3>
                                        <div className="flex flex-wrap gap-2 md:gap-3">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setActiveColor(color)}
                                                    className={`
                                                        px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold border-2 transition-all duration-200
                                                        ${activeColor === color
                                                            ? 'border-[#44b6da] bg-[#44b6da]/10 text-[#1e3857] shadow-sm'
                                                            : 'border-slate-100 text-slate-500 bg-white hover:border-slate-300'
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

                                {/* Quantity Selector */}
                                <div className="mb-5 md:mb-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 md:gap-4">
                                        <div className="flex items-center gap-0 border-2 border-slate-100 rounded-lg md:rounded-xl bg-white overflow-hidden p-1 shadow-sm w-fit">
                                            <button
                                                onClick={() => setQuantity(Math.max(product.min_quantity || 1, (typeof quantity === 'number' ? quantity : 1) - 1))}
                                                disabled={(typeof quantity === 'number' ? quantity : 1) <= (product.min_quantity || 1)}
                                                className="w-9 h-9 md:w-12 md:h-10 rounded-md md:rounded-lg bg-transparent text-slate-400 hover:bg-slate-50 hover:text-[#1e3857] font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent text-lg"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        setQuantity('' as any);
                                                        return;
                                                    }
                                                    const num = parseInt(val);
                                                    if (!isNaN(num) && num >= 0) {
                                                        setQuantity(num);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    let val = typeof quantity === 'number' ? quantity : parseInt(quantity as any) || 0;
                                                    const minQty = product.min_quantity || 1;
                                                    if (val < minQty) val = minQty;
                                                    if (displayStock > 0 && val > displayStock) val = displayStock;
                                                    if (val > 9999) val = 9999;
                                                    setQuantity(val);
                                                }}
                                                className="w-12 md:w-16 text-center text-base md:text-lg font-mono font-bold text-[#1e3857] bg-transparent outline-none border-x border-slate-100 h-6"
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(displayStock, (typeof quantity === 'number' ? quantity : 1) + 1))}
                                                disabled={(typeof quantity === 'number' ? quantity : 1) >= displayStock}
                                                className="w-9 h-9 md:w-12 md:h-10 rounded-md md:rounded-lg bg-transparent text-slate-400 hover:bg-slate-50 hover:text-[#1e3857] font-bold transition-all flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent text-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs md:text-sm font-medium text-slate-400">
                                            {product.min_quantity_unit || 'unidades'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex flex-col gap-3 md:gap-4">
                                <Button
                                    size="lg"
                                    className={`w-full text-sm md:text-lg py-3.5 md:py-5 h-auto shadow-xl shadow-[#1e3857]/20 transition-all duration-300 font-bold rounded-xl md:rounded-2xl ${isAdding ? 'bg-green-600 hover:bg-green-700 cursor-default scale-95' : 'bg-[#1e3857] hover:bg-[#0f172a] hover:shadow-[#1e3857]/40 hover:-translate-y-1'}`}
                                    onClick={handleAddToCart}
                                    disabled={isAdding || displayStock === 0}
                                >
                                    {isAdding ? (
                                        <>
                                            <Check className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                                            <span>¡Agregado al Carrito!</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                                            <span>{displayStock === 0 ? 'Producto Agotado' : 'Agregar al Carrito'}</span>
                                        </>
                                    )}
                                </Button>

                                {product.is_customizable && (
                                    <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#1e3857] bg-[#f0f9ff] py-3 md:py-4 rounded-xl md:rounded-2xl border border-[#e0f2fe]">
                                        <div className="flex items-center gap-2 font-bold">
                                            <AlertCircle className="w-4 h-4 text-[#44b6da]" />
                                            <span>Producto Personalizable</span>
                                        </div>
                                        {product.customization_price && product.customization_price > 0 && (
                                            <span className="text-[10px] md:text-xs text-slate-500">
                                                Costo adicional desde: <span className="font-bold text-[#1e3857]">${product.customization_price.toFixed(2)}</span> / unidad
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Footer */}
                    <div className="bg-[#f8fafc] border-t border-slate-100 p-6 md:p-8 lg:p-10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { icon: Truck, title: "Envíos", desc: "A todo el país" },
                                { icon: ShieldCheck, title: "Garantía", desc: "Calidad 100%" },
                                { icon: Phone, title: "Soporte", desc: "Expertos listos" },
                                { icon: Check, title: "Mayorista", desc: "Precios especiales" },
                            ].map((feature, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-[#44b6da] shrink-0">
                                        <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1e3857] text-xs md:text-sm">{feature.title}</h4>
                                        <p className="text-[10px] md:text-xs text-slate-500 mt-1">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div >

                {/* Related Products Section */}
                {
                    relatedProducts.length > 0 && (
                        <div className="mt-10 md:mt-24 mb-8 md:mb-12 animate-fade-in-up">
                            <h2 className="text-lg md:text-2xl font-black text-[#1e3857] mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
                                <span className="bg-[#e0f2fe] text-[#1e3857] p-2 md:p-2.5 rounded-lg md:rounded-xl"><ShoppingBag size={16} className="md:w-6 md:h-6" /></span>
                                Productos Relacionados
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                {relatedProducts.map((related) => (
                                    <div
                                        key={related.id}
                                        onClick={() => {
                                            navigate(`/producto/${related.id}`);
                                            window.scrollTo(0, 0);
                                        }}
                                        className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col hover:-translate-y-2 cursor-pointer"
                                    >
                                        <div className="aspect-[4/3] relative overflow-hidden bg-white">
                                            <img
                                                src={related.image_url}
                                                alt={related.name}
                                                className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="font-bold text-[#1e3857] mb-2 group-hover:text-[#44b6da] transition-colors line-clamp-1">{related.name}</h3>
                                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1 font-light leading-relaxed">{related.description}</p>
                                            <div className="mt-auto flex items-center justify-between font-bold">
                                                <span className="text-[#1e3857] text-lg">${related.price.toFixed(2)}</span>
                                                <span className="text-xs text-[#44b6da] bg-[#e0f2fe] px-3 py-1.5 rounded-full group-hover:bg-[#44b6da] group-hover:text-white transition-colors">Ver Detalles</span>
                                            </div>
                                        </div>
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
