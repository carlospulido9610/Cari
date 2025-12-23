import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../src/context/CartContext';
import { Button } from './Button';

export const CartDrawer: React.FC = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    if (!isCartOpen) return null;

    const handleWhatsAppOrder = async () => {
        setIsSubmitting(true);
        try {
            // 1. Generate Order Items Summary
            const itemsSummary = items.map(i =>
                `• ${i.productName} ${i.selectedVariant ? `(${i.selectedVariant.name})` : ''} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}\n   Foto: ${i.image || 'N/A'}`
            ).join('\n\n');

            const orderTotal = cartTotal.toFixed(2);
            const orderId = '#WEB-' + Math.floor(1000 + Math.random() * 9000); // Simple ID

            // 2. Save Quote to Supabase (Background Process)
            import('../services/supabaseClient').then(({ submitQuoteRequest }) => {
                submitQuoteRequest({
                    customer_name: customerName,
                    phone: customerPhone,
                    email: 'whatsapp@order.com', // Placeholder
                    quantity: items.length,
                    specifications: `PEDIDO ${orderId}\n\nITEMS:\n${itemsSummary}\n\nTOTAL: $${orderTotal}`,
                    product_name: `Pedido Web ${orderId}`
                }).catch(err => console.error('Error saving order to DB:', err));
            });

            // 3. Construct WhatsApp Message
            const message = `👋 Hola! Nuevo Pedido Web *${orderId}*\n\n` +
                `👤 *Cliente:* ${customerName}\n` +
                `📞 *Tel:* ${customerPhone}\n\n` +
                `🛒 *RESUMEN DEL PEDIDO:*\n\n` +
                items.map(i =>
                    `📦 *${i.productName}*\n` +
                    `${i.selectedVariant ? `   Variante: ${i.selectedVariant.name}\n` : ''}` +
                    `   Cant: ${i.quantity} x $${i.price}\n` +
                    `   🖼️ Foto: ${i.image || 'Sin foto'}`
                ).join('\n\n') +
                `\n\n💰 *TOTAL ESTIMADO: $${orderTotal}*`;

            // 4. Redirect
            const phoneNumber = "584120000000"; // TODO: Replace with real number
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

        } catch (error) {
            console.error(error);
            alert('Hubo un error al generar el enlace de WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#44b6da]" />
                        <h2 className="text-base font-bold text-[#1e3857]">Tu Carrito</h2>
                        <span className="bg-[#1e3857] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md shadow-[#1e3857]/20">
                            {items.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-[#1e3857] transition-all"
                        aria-label="Cerrar carrito"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <ShoppingBag className="w-6 h-6 text-[#44b6da]" />
                            </div>
                            <h3 className="text-[#1e3857] font-bold text-base mb-1">Carrito vacío</h3>
                            <p className="text-slate-500 text-xs mb-6 max-w-[180px]">Agrega productos para cotizar.</p>
                            <Button variant="outline" size="sm" onClick={() => setIsCartOpen(false)} className="border-[#44b6da] text-[#1e3857] hover:bg-[#44b6da]/5 text-xs">
                                Ver Productos
                            </Button>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="relative flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                {/* Delete Button (Absolute) */}
                                <button
                                    onClick={() => removeFromCart(item.productId, item.selectedVariant?.name, item.selectedColor)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
                                    aria-label="Eliminar"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Image */}
                                <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {/* Top: Name & Variants */}
                                    <div className="pr-6 mb-1">
                                        <h4 className="font-bold text-[#1e3857] text-xs leading-tight truncate">{item.productName}</h4>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {item.selectedVariant && (
                                                <span className="text-[9px] uppercase font-bold text-[#44b6da] bg-[#44b6da]/5 px-1.5 py-px rounded">
                                                    {item.selectedVariant.name}
                                                </span>
                                            )}
                                            {item.selectedColor && (
                                                <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-px rounded flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {item.selectedColor}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom: Price & Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-black text-[#1e3857]">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>

                                        <div className="flex items-center bg-slate-50 rounded border border-slate-200 h-6 shadow-sm">
                                            <button
                                                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-[#1e3857] hover:bg-white rounded-l transition-all"
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.name, item.selectedColor)}
                                            >
                                                -
                                            </button>
                                            <span className="text-[10px] font-bold text-[#1e3857] w-6 text-center">{item.quantity}</span>
                                            <button
                                                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-[#1e3857] hover:bg-white rounded-r transition-all"
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant?.name, item.selectedColor)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-slate-500 text-xs font-medium">Total Estimado</span>
                            <span className="text-xl font-black text-[#1e3857] leading-none">${cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Customer Form for WhatsApp Order - Compact */}
                        <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold text-[#1e3857] uppercase tracking-wide mb-2 flex items-center gap-2">
                                <span className="w-1 h-3 bg-[#44b6da] rounded-full"></span>
                                Datos de Contacto
                            </h4>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-[#44b6da] text-[#1e3857]"
                                        placeholder="Nombre"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs outline-none focus:border-[#44b6da] text-[#1e3857]"
                                        placeholder="Teléfono"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!customerName.trim() || !customerPhone.trim()) {
                                    alert('Nombre y Teléfono requeridos.');
                                    return;
                                }
                                handleWhatsAppOrder();
                            }}
                            disabled={isSubmitting}
                            className={`w-full py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10 ${isSubmitting
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]'
                                }`}
                        >
                            {isSubmitting ? '...' : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    Pedir por WhatsApp
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
