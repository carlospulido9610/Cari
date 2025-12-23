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
            const { submitQuoteRequest } = await import('../../services/supabaseClient');

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
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
                {/* Header Compact */}
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
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items List Compact */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <ShoppingBag className="w-6 h-6 text-[#44b6da]" />
                            </div>
                            <h3 className="text-[#1e3857] font-bold text-base mb-1">Carrito vacío</h3>
                            <p className="text-slate-500 text-xs mb-6 max-w-[180px]">Explora nuestro catálogo.</p>
                            <Button variant="outline" size="sm" onClick={() => setIsCartOpen(false)} className="border-[#44b6da] text-[#1e3857] hover:bg-[#44b6da]/5 text-xs">
                                Ver Productos
                            </Button>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="relative flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                {/* Delete Button Absolute */}
                                <button
                                    onClick={() => removeFromCart(item.productId, item.selectedVariant?.name, item.selectedColor)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors p-1"
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

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-[#1e3857]">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>

                                        <div className="flex items-center bg-slate-50 rounded border border-slate-200 h-6 shadow-sm">
                                            <button
                                                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-[#1e3857] hover:bg-white rounded-l transition-colors"
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.name, item.selectedColor)}
                                            >
                                                -
                                            </button>
                                            <span className="text-[10px] font-bold text-[#1e3857] w-6 text-center">{item.quantity}</span>
                                            <button
                                                className="w-6 h-full flex items-center justify-center text-slate-400 hover:text-[#1e3857] hover:bg-white rounded-r transition-colors"
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
                    <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20 max-h-[60vh] overflow-y-auto">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-slate-500 text-xs font-medium">Total Estimado</span>
                            <span className="text-xl font-black text-[#1e3857] leading-none">${cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Customer Basic Info - Compact Row */}
                        <div className="mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <h4 className="text-xs font-bold text-[#1e3857] mb-2 flex items-center gap-2">
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

                        {/* Delivery Method Selector - Compact */}
                        <div className="mb-3">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('pickup')}
                                    className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'pickup'
                                        ? 'border-[#44b6da] bg-[#44b6da]/10 text-[#1e3857]'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Store className="w-4 h-4" />
                                    <span className="text-xs font-bold">Retiro</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('shipping')}
                                    className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${deliveryMethod === 'shipping'
                                        ? 'border-[#44b6da] bg-[#44b6da]/10 text-[#1e3857]'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Truck className="w-4 h-4" />
                                    <span className="text-xs font-bold">Envío</span>
                                </button>
                            </div>
                        </div>

                        {/* Shipping Form */}
                        {deliveryMethod === 'shipping' && (
                            <div className="mb-4 bg-orange-50/50 p-3 rounded-lg border border-orange-100 animate-fade-in">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-orange-800">Datos de Envío</h4>

                                    {/* Redundancy Fix */}
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={sameAsCustomer}
                                                onChange={(e) => setSameAsCustomer(e.target.checked)}
                                            />
                                            {sameAsCustomer ? (
                                                <CheckSquare className="w-3.5 h-3.5 text-[#44b6da]" />
                                            ) : (
                                                <Square className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Mismos datos</span>
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857]"
                                                value={shippingAgency}
                                                onChange={(e) => setShippingAgency(e.target.value as ShippingAgency)}
                                            >
                                                <option value="MRW">MRW</option>
                                                <option value="ZOOM">ZOOM</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857]"
                                                placeholder="Ciudad"
                                                value={shippingCity}
                                                onChange={(e) => setShippingCity(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857]"
                                        placeholder="Dirección Agencia"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857] disabled:bg-slate-100 disabled:text-slate-400"
                                            placeholder="Destinatario"
                                            value={shippingName}
                                            onChange={(e) => setShippingName(e.target.value)}
                                            disabled={sameAsCustomer}
                                        />
                                        <input
                                            type="tel"
                                            className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857] disabled:bg-slate-100 disabled:text-slate-400"
                                            placeholder="Teléfono Envío"
                                            value={shippingPhone}
                                            onChange={(e) => setShippingPhone(e.target.value)}
                                            disabled={sameAsCustomer}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs outline-none focus:border-orange-400 text-[#1e3857]"
                                        placeholder="Cédula"
                                        value={shippingCedula}
                                        onChange={(e) => setShippingCedula(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleWhatsAppOrder}
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
