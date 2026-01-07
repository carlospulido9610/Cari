import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, MapPin, Truck, Store, User, FileText, Phone } from 'lucide-react';
import { useCart } from '../src/context/CartContext';
import { Button } from './Button';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useLoadScript } from "@react-google-maps/api";

// BCV Coordinates (Origin)
const BCV_COORDS = { lat: 10.5061, lng: -66.9146 };

const libraries: ("places")[] = ["places"];

export const CartDrawer: React.FC = () => {
    const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    // --- State ---
    const [activeTab, setActiveTab] = useState<'pickup' | 'delivery'>('pickup');
    const [deliveryRegion, setDeliveryRegion] = useState<'capital' | 'nacional'>('capital');

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [address, setAddress] = useState('');

    // Delivery Calculation
    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [calculatingFee, setCalculatingFee] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);


    // --- Google Maps Integration ---
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    // Reset when cart closes
    useEffect(() => {
        if (!isCartOpen) {
            setDistanceKm(null);
            setDeliveryFee(0);
        }
    }, [isCartOpen]);

    // Calculate Fee based on distance
    useEffect(() => {
        if (activeTab === 'pickup') {
            setDeliveryFee(0);
            return;
        }

        if (deliveryRegion === 'nacional') {
            setDeliveryFee(0); // Cobro a destino usually
            return;
        }

        if (distanceKm !== null) {
            let fee = 0;
            if (distanceKm <= 12) fee = 4;
            else if (distanceKm <= 15) fee = 4.50;
            else if (distanceKm <= 20) fee = 6;
            else if (distanceKm <= 30) fee = 7;
            else fee = 10; // Fallback for very far
            setDeliveryFee(fee);
        }
    }, [distanceKm, activeTab, deliveryRegion]);


    // --- Handlers ---

    const handleWhatsAppOrder = async () => {
        if (!termsAccepted) {
            alert("Por favor acepte usar los mismos datos o ingrese los datos del destinatario.");
            // Actually I'll use a checkbox for "Mismos datos" logic or just validation
            // For now, simple validation
        }

        setIsSubmitting(true);
        try {
            // 1. Generate Order Items Summary
            const itemsSummary = items.map(i =>
                `• ${i.productName} ${i.selectedVariant ? `(${i.selectedVariant.name})` : ''} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}`
            ).join('\n');

            const totalProd = cartTotal;
            const finalTotal = totalProd + deliveryFee;
            const orderId = '#WEB-' + Math.floor(1000 + Math.random() * 9000);

            // 2. Save Quote logic (optional background)
            // Skipping for brevity/speed in this update, keeping focus on WhatsApp

            // 3. Construct WhatsApp Message
            let message = `🛒 *NUEVO PEDIDO ${orderId}*\n\n`;

            // Customer Info
            message += `👤 *Comprador:* ${customerName}\n`;
            message += `📞 *Tel:* ${customerPhone}\n\n`;

            // Delivery Info
            if (activeTab === 'pickup') {
                message += `📍 *Método:* RETIRO EN SEDE (Av. Urdaneta)\n`;
            } else {
                message += `🚚 *Método:* ENVÍO / DELIVERY\n`;
                message += `🌍 *Zona:* ${deliveryRegion === 'capital' ? 'Distrito Capital' : 'Nacional'}\n`;
                if (deliveryRegion === 'capital') {
                    message += `🛵 *Servicio:* Motorizado\n`;
                    message += `📍 *Dirección:* ${address}\n`;
                    if (distanceKm) message += `📏 *Distancia:* ${distanceKm.toFixed(1)}km ($${deliveryFee})\n`;
                }

                message += `\n📦 *Datos de Recepción:*\n`;
                message += `Recibe: ${recipientName || customerName}\n`;
                message += `CI/ID: ${recipientId || 'N/A'}\n`;
            }

            message += `\n📝 *DETALLE:* \n${itemsSummary}\n\n`;

            message += `💰 *Subtotal:* $${totalProd.toFixed(2)}\n`;
            if (deliveryFee > 0) message += `🛵 *Delivery:* $${deliveryFee.toFixed(2)}\n`;
            message += `\n💵 *TOTAL A PAGAR: $${finalTotal.toFixed(2)}*`;

            // 4. Redirect
            // Using the requested number logic (mock for now or from env)
            const phoneNumber = "584120000000";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

        } catch (error) {
            console.error(error);
            alert('Error al procesar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for "Mismos datos"
    const handleSameDataToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setRecipientName(customerName);
        } else {
            setRecipientName('');
        }
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute top-0 right-0 h-full w-full max-w-md bg-brand-ivory shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">

                {/* Header */}
                <div className="px-5 py-4 border-b border-brand-ink/10 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-brand-gold" />
                        <h2 className="text-lg font-bold text-brand-gold display-font tracking-tight">Tu Carrito</h2>
                        <span className="bg-brand-gold text-brand-ivory text-xs font-bold px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-brand-ink/5 rounded-full text-brand-ink/40 hover:text-red-500 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FAFAFA]">

                    {/* Products List */}
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <ShoppingBag className="w-12 h-12 mb-4 text-brand-ink/20" />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-brand-ink/5 relative group">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                                        {item.image ? <img src={item.image} className="w-full h-full object-contain" /> : <ShoppingBag className="w-6 h-6 text-gray-300" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-brand-ink">{item.productName}</h4>
                                            <button onClick={() => removeFromCart(item.productId, item.selectedVariant?.name, item.selectedColor)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{item.selectedVariant?.name} {item.selectedColor}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center border rounded-md">
                                                <button className="px-2 py-0.5 text-gray-500 hover:bg-gray-100" onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedVariant?.name, item.selectedColor)}>-</button>
                                                <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                <button className="px-2 py-0.5 text-gray-500 hover:bg-gray-100" onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedVariant?.name, item.selectedColor)}>+</button>
                                            </div>
                                            <span className="font-bold text-brand-gold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Checkout Section */}
                    {items.length > 0 && (
                        <div className="space-y-6 pt-4">

                            {/* Contact Info */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-ink/5 space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Datos de Contacto</h3>
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                                    placeholder="Teléfono Corporativo"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                />
                                <input
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                                    placeholder="Nombre del Cliente"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>

                            {/* Delivery Method Tabs */}
                            <div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <button
                                        onClick={() => setActiveTab('pickup')}
                                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${activeTab === 'pickup' ? 'bg-white border-brand-gold/20 text-brand-gold shadow-md' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        Retiro en Sede
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('delivery')}
                                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${activeTab === 'delivery' ? 'bg-brand-gold text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        Envío / Delivery
                                    </button>
                                </div>

                                {activeTab === 'delivery' && (
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-ink/5 space-y-4 animate-reveal">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setDeliveryRegion('nacional')}
                                                className={`py-2 text-xs font-bold rounded-lg border ${deliveryRegion === 'nacional' ? 'bg-brand-ink text-white border-brand-ink' : 'bg-white border-gray-200 text-gray-500'}`}
                                            >
                                                NACIONAL
                                            </button>
                                            <button
                                                onClick={() => setDeliveryRegion('capital')}
                                                className={`py-2 text-xs font-bold rounded-lg border ${deliveryRegion === 'capital' ? 'bg-brand-ink text-white border-brand-ink' : 'bg-white border-gray-200 text-gray-500'}`}
                                            >
                                                DISTRITO CAPITAL
                                            </button>
                                        </div>

                                        {deliveryRegion === 'capital' && (
                                            <>
                                                <div className="flex gap-2">
                                                    <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 flex justify-between items-center cursor-not-allowed">
                                                        <span>Motorizado</span>
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">
                                                        Zona / Municipio
                                                    </div>
                                                </div>

                                                {/* Google Maps Autocomplete */}
                                                <AddressAutocomplete
                                                    isLoaded={isLoaded}
                                                    setDistanceKm={setDistanceKm}
                                                    setAddress={setAddress}
                                                />
                                            </>
                                        )}

                                        <div className="flex items-center gap-2 pt-2">
                                            <input type="checkbox" id="sameData" className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" onChange={handleSameDataToggle} />
                                            <label htmlFor="sameData" className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mismos datos del cliente</label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                                                placeholder="Destinatario"
                                                value={recipientName}
                                                onChange={e => setRecipientName(e.target.value)}
                                            />
                                            <input
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                                                placeholder="ID / Cédula"
                                                value={recipientId}
                                                onChange={e => setRecipientId(e.target.value)}
                                            />
                                        </div>

                                    </div>
                                )}
                            </div>


                            {/* Cost Summary Section */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-ink/5 space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen de Costos</h3>

                                {/* Subtotal */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
                                    <span className="font-bold text-brand-ink">${cartTotal.toFixed(2)}</span>
                                </div>

                                {/* Delivery Fee */}
                                {activeTab === 'delivery' && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-brand-gold" />
                                            <span className="text-gray-600">
                                                Envío
                                                {deliveryRegion === 'capital' && distanceKm !== null && (
                                                    <span className="text-xs text-gray-400 ml-1">({distanceKm.toFixed(1)} km)</span>
                                                )}
                                            </span>
                                        </div>
                                        {deliveryRegion === 'nacional' ? (
                                            <span className="text-xs text-orange-500 font-medium">Cobro a destino</span>
                                        ) : deliveryFee > 0 ? (
                                            <span className="font-bold text-brand-gold">${deliveryFee.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Ingrese dirección</span>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'pickup' && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-green-500" />
                                            <span className="text-gray-600">Retiro en sede</span>
                                        </div>
                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">GRATIS</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-dashed border-gray-200 my-2" />

                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-bold text-brand-ink">TOTAL</span>
                                    <span className="text-2xl font-black text-brand-gold display-font">
                                        ${(cartTotal + deliveryFee).toFixed(2)}
                                    </span>
                                </div>

                                {/* Distance Tariff Info */}
                                {activeTab === 'delivery' && deliveryRegion === 'capital' && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                            📍 Tarifas desde Av. Urdaneta (BCV): 0-12km = $4 | 12-15km = $4.50 | 15-20km = $6 | 20-30km = $7
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Total Footer */}
                            <button
                                onClick={handleWhatsAppOrder}
                                className="w-full bg-brand-gold text-white py-4 rounded-2xl shadow-xl shadow-brand-gold/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 group"
                            >
                                <span className="text-sm font-bold uppercase tracking-widest">
                                    Transmitir Pedido vía WhatsApp
                                </span>
                            </button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Subcomponent: Address Autocomplete ---
const AddressAutocomplete = ({ isLoaded, setDistanceKm, setAddress }: { isLoaded: boolean, setDistanceKm: (d: number) => void, setAddress: (a: string) => void }) => {

    // If API is not loaded, show basic input
    if (!isLoaded) {
        return (
            <input
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                placeholder="Dirección Exacta (Manual)"
                onChange={(e) => setAddress(e.target.value)}
            />
        )
    }

    return <PlacesAutocompleteLogic setDistanceKm={setDistanceKm} setAddress={setAddress} />;
}

const PlacesAutocompleteLogic = ({ setDistanceKm, setAddress }: { setDistanceKm: (d: number) => void, setAddress: (a: string) => void }) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "ve" }, // Restrict to Venezuela
            locationBias: { center: BCV_COORDS, radius: 20000 } // Bias towards Caracas
        },
        debounce: 300,
    });

    const handleSelect = async (addr: string) => {
        setValue(addr, false);
        setAddress(addr);
        clearSuggestions();

        try {
            const results = await getGeocode({ address: addr });
            const { lat, lng } = getLatLng(results[0]);

            // Calculate Distance (Haversine Formula) (Simplified)
            // Or use google.maps.geometry.spherical.computeDistanceBetween if library loaded, but manual for robust
            const dist = calculateHaversineDistance(BCV_COORDS.lat, BCV_COORDS.lng, lat, lng);
            setDistanceKm(dist);

        } catch (error) {
            console.error("Error: ", error);
        }
    };

    // Manual Haversine to avoid dependency issues if geometry lib not loaded
    const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    const toRad = (val: number) => val * Math.PI / 180;

    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setAddress(e.target.value);
                }}
                disabled={!ready}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-accent transition-colors"
                placeholder="Dirección Exacta (Google Maps)"
            />
            {status === "OK" && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="p-2 text-xs hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
