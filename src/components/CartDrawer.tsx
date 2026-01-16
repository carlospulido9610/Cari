import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck, Store, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/Button';

type DeliveryMethod = 'pickup' | 'shipping';
type ShippingZone = 'national' | 'capital';
type ShippingAgency = 'MRW' | 'ZOOM' | 'Tealca' | 'Motorizado';

export const CartDrawer: React.FC = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showValidationErrors, setShowValidationErrors] = React.useState(false);
    const [validationError, setValidationError] = React.useState<string | null>(null);

    // Delivery options
    const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>('pickup');
    const [shippingZone, setShippingZone] = React.useState<ShippingZone>('national');
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
        let isValid = true;
        if (!customerName.trim() || !customerPhone.trim()) {
            isValid = false;
        }
        if (deliveryMethod === 'shipping') {
            if (!shippingAddress.trim() || !shippingCity.trim() || !shippingName.trim() || !shippingCedula.trim() || !shippingPhone.trim()) {
                isValid = false;
            }
        }

        if (!isValid) {
            setShowValidationErrors(true);
            setValidationError('Debes agregar tus datos para proceder con el pedido.');
            setTimeout(() => setValidationError(null), 4000);
            return false;
        }
        return true;
    };

    const handleWhatsAppOrder = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
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

        // Save to Supabase (Background)
        const { submitQuoteRequest } = await import('../services/supabaseClient');

        // Build shipping info for specifications
        let shippingInfo = '';
        if (deliveryMethod === 'shipping') {
            const zoneLabel = shippingZone === 'national' ? 'NACIONAL' : 'CCS (Capital)';
            shippingInfo = `\nENVIO: ${zoneLabel} - ${shippingAgency}\nDireccion: ${shippingAddress}\nCiudad: ${shippingCity}\nNombre: ${shippingName}\nCI: ${shippingCedula}\nTel: ${shippingPhone}`;
        } else {
            shippingInfo = '\nENTREGA: Retiro en tienda';
        }

        const phoneNumber = "584147926934"; // Real company number

        // Build WhatsApp message
        let message = `Hola! Nuevo Pedido *#${orderId}*\n`;
        message += `Total: *$${orderTotal}* (${items.length} items)\n\n`;
        message += `Cliente: ${customerName}\n`;
        message += `Tel: ${customerPhone}\n`;

        if (deliveryMethod === 'shipping') {
            const zoneLabel = shippingZone === 'national' ? 'NACIONAL' : 'DISTRITO CAPITAL';
            message += `\n--- DATOS DE ENVIO (${zoneLabel}) ---\n`;
            message += `Agencia/Método: ${shippingAgency}\n`;
            message += `Direccion: ${shippingAddress}\n`;
            message += `Ciudad: ${shippingCity}\n`;
            message += `Destinatario: ${shippingName}\n`;
            message += `Cedula: ${shippingCedula}\n`;
            message += `Tel Envio: ${shippingPhone}\n`;
        } else {
            message += `\nEntrega: Retiro en tienda\n`;
        }

        // --- OPEN WHATSAPP IMMEDIATELY ---
        // We open it here to avoid browser blocking, as this is the result of a user click.
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        // We store the window reference to check if it opened
        window.open(url, '_blank');

        // Fire and forget the database save so we don't wait for it
        submitQuoteRequest({
            customer_name: customerName,
            phone: customerPhone,
            email: 'whatsapp@order.com',
            quantity: items.length,
            specifications: `PEDIDO #${orderId}\nITEMS: ${itemsSummary}\nTOTAL: $${orderTotal}${shippingInfo}`,
            product_name: `Pedido #${orderId}`,
            items: items
        }).then(() => {
            console.log("Order saved to database");
        }).catch(err => {
            console.error("Error saving order to database", err);
        });

        setIsCartOpen(false);
        setIsSubmitting(false);
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

                {/* Header - Compact */}
                <div className="px-4 py-3 border-b border-brand-ink/5 flex items-center justify-between bg-brand-ivory relative z-10 w-full">
                    <span className="text-sm font-bold text-brand-ink">
                        Carrito <span className="text-brand-accent">({items.length})</span>
                    </span>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-ink/5 transition-colors"
                        aria-label="Cerrar carrito"
                    >
                        <X className="w-5 h-5 text-brand-ink" />
                    </button>
                </div>

                {/* Scrollable Content - Products + Form unified */}
                <div className="flex-1 overflow-y-auto w-full">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <h3 className="text-brand-ink/20 font-medium text-xl display-font mb-4">La colección está vacía</h3>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent hover:text-brand-ink transition-colors border-b border-brand-accent pb-1"
                            >
                                Explorar Catálogo
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {/* Compact Products List */}
                            <div className="space-y-2">
                                {items.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="group flex items-center gap-3 p-2 bg-white rounded-xl border border-brand-ink/5 hover:border-brand-ink/10 transition-colors">
                                        {/* Small Image */}
                                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-brand-ink/[0.02]">
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-brand-ink/10">
                                                    <ShoppingBag className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-brand-ink text-xs truncate">{item.productName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-brand-ink tabular-nums">${item.price.toFixed(2)}</span>
                                                {item.selectedVariant && (
                                                    <span className="text-[8px] uppercase text-brand-ink/40 bg-brand-ink/5 px-1.5 py-0.5 rounded">{item.selectedVariant.name}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity + Delete */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center border border-brand-ink/10 h-7 rounded-lg overflow-hidden">
                                                <button
                                                    className="w-6 h-full flex items-center justify-center text-brand-ink/30 hover:text-brand-ink hover:bg-brand-ink/5 text-xs"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.name, item.selectedColor)}
                                                >−</button>
                                                <span className="text-[10px] font-bold text-brand-ink w-6 text-center tabular-nums">{item.quantity}</span>
                                                <button
                                                    className="w-6 h-full flex items-center justify-center text-brand-ink/30 hover:text-brand-ink hover:bg-brand-ink/5 text-xs"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant?.name, item.selectedColor)}
                                                >+</button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId, item.selectedVariant?.name, item.selectedColor)}
                                                className="w-6 h-6 flex items-center justify-center text-brand-ink/20 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Subtotal inline */}
                            <div className="flex justify-between items-center py-3 border-t border-brand-ink/5">
                                <span className="text-xs text-brand-ink/50">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
                                <span className="text-xl font-bold text-brand-ink tabular-nums">${cartTotal.toFixed(2)}</span>
                            </div>

                            {/* Order Form */}
                            <div className="space-y-10">
                                {/* Personal Info */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink border-b border-brand-ink/10 pb-2">Información de Enlace</h4>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            className={`w-full bg-white border py-3 px-4 text-sm focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 rounded-xl ${showValidationErrors && !customerName ? 'border-red-500' : 'border-brand-ink/10'}`}
                                            placeholder="Nombre del Solicitante"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                        <input
                                            type="tel"
                                            className={`w-full bg-white border py-3 px-4 text-sm focus:border-brand-ink outline-none transition-colors placeholder:text-brand-ink/30 tabular-nums rounded-xl ${showValidationErrors && !customerPhone ? 'border-red-500' : 'border-brand-ink/10'}`}
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
                                            Envío / Delivery
                                        </button>
                                    </div>

                                    {deliveryMethod === 'shipping' && (
                                        <div className="pt-6 space-y-4 animate-reveal">
                                            <div className="flex bg-brand-ink/[0.02] p-1 rounded-xl border border-brand-ink/5">
                                                <button
                                                    onClick={() => {
                                                        setShippingZone('national');
                                                        setShippingAgency('MRW');
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${shippingZone === 'national' ? 'bg-white shadow-sm text-brand-ink' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
                                                >
                                                    Nacional
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShippingZone('capital');
                                                        setShippingAgency('Motorizado');
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${shippingZone === 'capital' ? 'bg-white shadow-sm text-brand-ink' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
                                                >
                                                    Distrito Capital
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <h5 className="text-[9px] uppercase tracking-widest font-bold text-brand-accent">
                                                    {shippingZone === 'national' ? 'Agencia de Encomienda' : 'Método de Entrega'}
                                                </h5>
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
                                                    {shippingZone === 'national' ? (
                                                        <>
                                                            <option value="MRW">MRW</option>
                                                            <option value="ZOOM">ZOOM</option>
                                                        </>
                                                    ) : (
                                                        <option value="Motorizado">Motorizado</option>
                                                    )}
                                                </select>
                                                <input
                                                    type="text"
                                                    className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl ${showValidationErrors && !shippingCity ? 'border-red-500' : 'border-brand-ink/10'}`}
                                                    placeholder={shippingZone === 'national' ? "Ciudad Destino" : "Zona / Municipio"}
                                                    value={shippingCity}
                                                    onChange={(e) => setShippingCity(e.target.value)}
                                                />
                                            </div>
                                            {shippingZone === 'national' ? (
                                                <input
                                                    type="text"
                                                    className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl ${showValidationErrors && !shippingAddress ? 'border-red-500' : 'border-brand-ink/10'}`}
                                                    placeholder="Dirección de Agencia"
                                                    value={shippingAddress}
                                                    onChange={(e) => setShippingAddress(e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl ${showValidationErrors && !shippingAddress ? 'border-red-500' : 'border-brand-ink/10'}`}
                                                    placeholder="Dirección de entrega"
                                                    value={shippingAddress}
                                                    onChange={(e) => setShippingAddress(e.target.value)}
                                                />
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none disabled:opacity-30 rounded-xl ${showValidationErrors && !shippingName ? 'border-red-500' : 'border-brand-ink/10'}`}
                                                    placeholder="Destinatario"
                                                    value={shippingName}
                                                    onChange={(e) => setShippingName(e.target.value)}
                                                    disabled={sameAsCustomer}
                                                />
                                                <input
                                                    type="text"
                                                    className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none rounded-xl ${showValidationErrors && !shippingCedula ? 'border-red-500' : 'border-brand-ink/10'}`}
                                                    placeholder="ID / Cédula"
                                                    value={shippingCedula}
                                                    onChange={(e) => setShippingCedula(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Cost Summary */}
                                <div className="bg-brand-ink/[0.02] p-4 rounded-2xl border border-brand-ink/5 space-y-3">
                                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/40 mb-3">Resumen de Costos</h4>

                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-brand-ink/60">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
                                        <span className="font-bold text-brand-ink">${cartTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Delivery */}
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-brand-accent" />
                                            <span className="text-brand-ink/60">
                                                {deliveryMethod === 'pickup' ? 'Retiro en Sede' : 'Envío'}
                                            </span>
                                        </div>
                                        {deliveryMethod === 'pickup' ? (
                                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">GRATIS</span>
                                        ) : (
                                            <span className="text-[10px] text-orange-500 font-medium">Por confirmar</span>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-dashed border-brand-ink/10 my-2" />

                                    {/* Total */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-brand-ink">TOTAL</span>
                                        <span className="text-2xl font-black text-brand-ink tracking-tighter display-font">
                                            ${cartTotal.toFixed(2)}
                                        </span>
                                    </div>
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

                {/* Custom Toast Notification inside Sidebar? Or Root? 
                    If we put it here, it covers the sidebar bottom. 
                    Structure: Sidebar (absolute) -> Content (flex-1)
                    Toast should be absolute to Sidebar or Fixed to screen.
                    Let's keep it inside Sidebar for context, nicely positioned.
                */}
                {validationError && (
                    <div className="absolute bottom-6 left-6 right-6 z-50 animate-bounce">
                        <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(239,68,68,0.2)] flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest">{validationError}</span>
                            <button onClick={() => setValidationError(null)}>
                                <X className="w-4 h-4 text-white/50 hover:text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
