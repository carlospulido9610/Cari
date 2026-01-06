import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck, Store, CheckSquare, Square } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/Button';

type DeliveryMethod = 'pickup' | 'shipping';
type ShippingAgency = 'MRW' | 'ZOOM';

export const CartDrawer: React.FC = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Delivery options
    const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>('pickup');
    const [shippingAgency, setShippingAgency] = React.useState<ShippingAgency>('MRW');
    const [shippingAddress, setShippingAddress] = React.useState('');
    const [shippingCity, setShippingCity] = React.useState('');
    const [shippingName, setShippingName] = React.useState('');
    const [shippingCedula, setShippingCedula] = React.useState('');
    const [shippingPhone, setShippingPhone] = React.useState('');

    // Fix redundancy: Checkbox to reuse customer data
    const [sameAsCustomer, setSameAsCustomer] = React.useState(false);

    // Sync shipping data if checkbox is checked
    useEffect(() => {
        if (sameAsCustomer) {
            setShippingName(customerName);
            setShippingPhone(customerPhone);
        }
    }, [sameAsCustomer, customerName, customerPhone]);

    if (!isCartOpen) return null;

    const validateForm = (): boolean => {
        if (!customerName.trim() || !customerPhone.trim()) {
            alert('Por favor, ingresa tu Nombre y Teléfono.');
            return false;
        }
        if (deliveryMethod === 'shipping') {
            if (!shippingAddress.trim() || !shippingCity.trim() || !shippingName.trim() || !shippingCedula.trim() || !shippingPhone.trim()) {
                alert('Por favor, completa todos los datos de envío.');
                return false;
            }
        }
        return true;
    };

    const handleWhatsAppOrder = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const orderTotal = cartTotal.toFixed(2);
            // Simple order ID: Letter + 4 digits
            const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
            const letter = letters[Math.floor(Math.random() * letters.length)];
            const orderId = letter + Math.floor(1000 + Math.random() * 9000);

            // Generate items summary with SKU
            const itemsSummary = items.map(i => {
                const skuPart = i.sku || i.selectedVariant?.sku || 'SIN-SKU';
                return `${i.productName} (${skuPart}) x${i.quantity}`;
            }).join(', ');

            // Save to Supabase
            const { submitQuoteRequest } = await import('../services/supabaseClient');

            // Build shipping info for specifications
            let shippingInfo = '';
            if (deliveryMethod === 'shipping') {
                shippingInfo = `\nENVIO: ${shippingAgency}\nDireccion Agencia: ${shippingAddress}\nCiudad: ${shippingCity}\nNombre Destinatario: ${shippingName}\nCedula: ${shippingCedula}\nTelefono: ${shippingPhone}`;
            } else {
                shippingInfo = '\nENTREGA: Retiro en tienda';
            }

            await submitQuoteRequest({
                customer_name: customerName,
                phone: customerPhone,
                email: 'whatsapp@order.com',
                quantity: items.length,
                specifications: `PEDIDO #${orderId}\nITEMS: ${itemsSummary}\nTOTAL: $${orderTotal}${shippingInfo}`,
                product_name: `Pedido #${orderId}`,
                items: items
            });

            // Build WhatsApp message
            let message = `Hola! Nuevo Pedido *#${orderId}*\n`;
            message += `Total: *$${orderTotal}* (${items.length} items)\n\n`;
            message += `Cliente: ${customerName}\n`;
            message += `Tel: ${customerPhone}\n`;

            if (deliveryMethod === 'shipping') {
                message += `\n--- DATOS DE ENVIO ---\n`;
                message += `Agencia: ${shippingAgency}\n`;
                message += `Direccion: ${shippingAddress}\n`;
                message += `Ciudad: ${shippingCity}\n`;
                message += `Destinatario: ${shippingName}\n`;
                message += `Cedula: ${shippingCedula}\n`;
                message += `Tel Envio: ${shippingPhone}\n`;
            } else {
                message += `\nEntrega: Retiro en tienda\n`;
            }

            const phoneNumber = "584147926934"; // Real company number
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

            setIsCartOpen(false);

        } catch (error) {
            console.error(error);
            alert('Hubo un error al procesar. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Overlay - Deep contrast blur */}
            <div
                className="absolute inset-0 bg-brand-ink/40 backdrop-blur-md transition-opacity duration-700"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar - Premium Editorial Panel */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-brand-ivory shadow-[0_0_80px_rgba(0,0,0,0.1)] flex flex-col transform transition-transform duration-700 ease-in-out animate-slide-in-right">

                {/* Header - Minimal Luxury */}
                <div className="px-8 py-8 border-b border-brand-ink/5 flex items-center justify-between bg-brand-ivory relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-brand-accent tabular-nums">
                                [{items.length}]
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-ink/10 hover:border-brand-ink transition-colors"
                    >
                        <X className="w-4 h-4 text-brand-ink" />
                    </button>
                </div>

                {/* Items List - High-End Layout */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <h3 className="text-brand-ink/20 font-medium text-xl display-font mb-4">La colección está vacía</h3>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent hover:text-brand-ink transition-colors border-b border-brand-accent pb-1"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="group relative flex gap-6 pb-8 border-b border-brand-ink/5 last:border-0">
                                {/* Delete Button */}
                                <button
                                    onClick={() => removeFromCart(item.productId, item.selectedVariant?.name, item.selectedColor)}
                                    className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 text-brand-ink/20 hover:text-red-500 transition-all duration-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>

                                {/* Image - Editorial Frame */}
                                <div className="w-24 h-24 bg-white border border-brand-ink/5 overflow-hidden flex-shrink-0 relative group-hover:border-brand-accent/30 transition-colors duration-500">
                                    {item.image ? (
                                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brand-ink/5">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col pt-1">
                                    <h4 className="font-medium text-brand-ink text-sm tracking-tight display-font mb-2">{item.productName}</h4>

                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {item.selectedVariant && (
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40">
                                                Var: {item.selectedVariant.name}
                                            </span>
                                        )}
                                        {item.selectedColor && (
                                            <span className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 flex items-center gap-2">
                                                Col: {item.selectedColor}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-sm font-bold text-brand-ink tabular-nums">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>

                                        <div className="flex items-center border border-brand-ink/10 h-8 rounded-xl overflow-hidden">
                                            <button
                                                className="w-8 h-full flex items-center justify-center text-brand-ink/30 hover:text-brand-ink hover:bg-brand-ink/5 transition-colors"
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.name, item.selectedColor)}
                                            >
                                                -
                                            </button>
                                            <span className="text-[10px] font-bold text-brand-ink w-8 text-center tabular-nums">{item.quantity}</span>
                                            <button
                                                className="w-8 h-full flex items-center justify-center text-brand-ink/30 hover:text-brand-ink hover:bg-brand-ink/5 transition-colors"
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

                {/* Checkout Summary - Clean Form */}
                {items.length > 0 && (
                    <div className="p-8 bg-white border-t border-brand-ink/5 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20 overflow-y-auto max-h-[60vh]">
                        <div className="flex justify-between items-baseline mb-10">
                            <span className="text-[10px] font-bold text-brand-ink/40">Total</span>
                            <span className="text-4xl font-semibold text-brand-ink tracking-tighter display-font tabular-nums">${cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Order Form */}
                        <div className="space-y-10">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink border-b border-brand-ink/10 pb-2">Información de Enlace</h4>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-sm focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 rounded-xl"
                                        placeholder="Nombre del Solicitante"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                    <input
                                        type="tel"
                                        className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-sm focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 tabular-nums rounded-xl"
                                        placeholder="Teléfono Corporativo"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`flex-1 py-4 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-full ${deliveryMethod === 'pickup' ? 'border-brand-ink bg-brand-ink text-brand-ivory' : 'border-brand-ink/10 text-brand-ink/40 bg-white'}`}
                                    >
                                        Retiro en Sede
                                    </button>
                                    <button
                                        onClick={() => setDeliveryMethod('shipping')}
                                        className={`flex-1 py-4 text-[10px] uppercase tracking-widest font-bold border transition-all rounded-full ${deliveryMethod === 'shipping' ? 'border-brand-ink bg-brand-ink text-brand-ivory' : 'border-brand-ink/10 text-brand-ink/40 bg-white'}`}
                                    >
                                        Envío Nacional
                                    </button>
                                </div>

                                {deliveryMethod === 'shipping' && (
                                    <div className="pt-6 space-y-4 animate-reveal">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-[9px] uppercase tracking-widest font-bold text-brand-accent">Logística de Envío</h5>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={sameAsCustomer}
                                                    onChange={(e) => setSameAsCustomer(e.target.checked)}
                                                />
                                                <div className={`w-3.5 h-3.5 border border-brand-ink/20 flex items-center justify-center transition-colors ${sameAsCustomer ? 'bg-brand-ink border-brand-ink' : ''}`}>
                                                    {sameAsCustomer && <X className="w-2.5 h-2.5 text-brand-ivory" />}
                                                </div>
                                                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/30">Mismos datos</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none rounded-xl"
                                                value={shippingAgency}
                                                onChange={(e) => setShippingAgency(e.target.value as ShippingAgency)}
                                            >
                                                <option value="MRW">MRW</option>
                                                <option value="ZOOM">ZOOM</option>
                                            </select>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl"
                                                placeholder="Ciudad"
                                                value={shippingCity}
                                                onChange={(e) => setShippingCity(e.target.value)}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl"
                                            placeholder="Dirección Detallada de Agencia"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none disabled:opacity-30 rounded-xl"
                                                placeholder="Destinatario"
                                                value={shippingName}
                                                onChange={(e) => setShippingName(e.target.value)}
                                                disabled={sameAsCustomer}
                                            />
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none rounded-xl"
                                                placeholder="ID / Cédula"
                                                value={shippingCedula}
                                                onChange={(e) => setShippingCedula(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submission */}
                            <button
                                onClick={handleWhatsAppOrder}
                                disabled={isSubmitting}
                                className="w-full py-6 bg-brand-ink text-brand-ivory text-[10px] uppercase tracking-[0.5em] font-bold hover:translate-y-[-2px] transition-all disabled:opacity-50 shadow-2xl shadow-brand-ink/20 rounded-full"
                            >
                                {isSubmitting ? 'Procesando Transmisión...' : 'Transmitir Pedido vía WhatsApp'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
