import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck, Store, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/Button';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";


type DeliveryMethod = 'pickup' | 'shipping';
type ShippingZone = 'national' | 'capital';
type ShippingAgency = 'MRW' | 'ZOOM' | 'Tealca' | 'Motorizado';

// BCV Coordinates (Origin for distance calculation)
const BCV_COORDS = { lat: 10.5061, lng: -66.9146 };
const libraries: ("places")[] = ["places"];

// Calculate delivery fee based on distance (Driving Distance)
const calculateDeliveryFeeFromDistance = (distanceKm: number): { fee: number; distanceRange: string } => {
    if (distanceKm <= 12) return { fee: 4, distanceRange: '0-12km' };
    if (distanceKm <= 15) return { fee: 5, distanceRange: '12-15km' };
    if (distanceKm <= 20) return { fee: 6, distanceRange: '15-20km' };
    if (distanceKm <= 30) return { fee: 7, distanceRange: '20-30km' };
    return { fee: 10, distanceRange: '+30km' };
};

// Legacy zone-based calculation (fallback)
const calculateDeliveryFee = (zona: string): { fee: number; distanceRange: string } => {
    // Based on common zones in Caracas from BCV (Av. Urdaneta)
    const zonaLower = zona.toLowerCase().trim();

    // Near zones (0-12km) - $4
    const nearZones = ['centro', 'catia', 'el silencio', 'san martin', 'la candelaria', 'sabana grande', 'chacao', 'altamira', 'los palos grandes', 'bello monte', 'las mercedes', 'chuao', 'el rosal', 'campo alegre', 'santa fe', 'colinas de bello monte', 'la castellana', 'los ruices', 'horizonte', 'la california', 'montalban', 'ruiz pineda', 'caricuao', 'el cementerio', 'el paraiso', 'santa monica', 'los chaguaramos', 'san bernardino', 'la florida'];

    // Medium zones (12-15km) - $5
    const mediumZones = ['petare', 'filas de mariche', 'baruta', 'el hatillo', 'valle de la pascua', 'coche', 'antimano', 'la vega', 'el junquito', 'el junko', 'mamera', 'macarao', 'los teques'];

    // Far zones (15-20km) - $6
    const farZones = ['guarenas', 'guatire', 'higuerote', 'san antonio de los altos', 'carrizal'];

    // Very far zones (20-30km) - $7
    const veryFarZones = ['charallave', 'ocumare', 'cua', 'tuy', 'valles del tuy'];

    for (const z of nearZones) {
        if (zonaLower.includes(z)) return { fee: 4, distanceRange: '0-12km' };
    }
    for (const z of mediumZones) {
        if (zonaLower.includes(z)) return { fee: 5, distanceRange: '12-15km' };
    }
    for (const z of farZones) {
        if (zonaLower.includes(z)) return { fee: 6, distanceRange: '15-20km' };
    }
    for (const z of veryFarZones) {
        if (zonaLower.includes(z)) return { fee: 7, distanceRange: '20-30km' };
    }

    // Default for unknown zones
    return { fee: 5, distanceRange: 'Estándar' };
};

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


    // --- Google Maps Integration ---
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
    const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number, lng: number } | null>(null);
    const [calculatingDistance, setCalculatingDistance] = React.useState(false);

    // Use Google Maps Distance Matrix Service for accurate driving distance
    useEffect(() => {
        if (!isLoaded || !selectedLocation) return;

        // Don't calculate if we don't have the window.google object yet
        if (!window.google || !window.google.maps) return;

        setCalculatingDistance(true);

        const service = new window.google.maps.DistanceMatrixService();

        service.getDistanceMatrix(
            {
                origins: [BCV_COORDS],
                destinations: [selectedLocation],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
            },
            (response, status) => {
                setCalculatingDistance(false);

                if (status === "OK" && response && response.rows[0].elements[0].status === "OK") {
                    const distanceInMeters = response.rows[0].elements[0].distance.value;
                    const distanceInKm = distanceInMeters / 1000;
                    console.log(`Driving Distance calculated: ${distanceInKm} km`);
                    setDistanceKm(distanceInKm);
                } else {
                    console.error("Distance Matrix failed or no route found:", status);
                    // Fallback to Haversine if API fails (e.g., billing issues)
                    // Simple Haversine implementation inline
                    if (selectedLocation) {
                        const R = 6371; // km
                        const dLat = (selectedLocation.lat - BCV_COORDS.lat) * Math.PI / 180;
                        const dLon = (selectedLocation.lng - BCV_COORDS.lng) * Math.PI / 180;
                        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(BCV_COORDS.lat * Math.PI / 180) * Math.cos(selectedLocation.lat * Math.PI / 180) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        console.warn("Falling back to linear distance:", R * c);
                        setDistanceKm(R * c);
                    }
                }
            }
        );

    }, [isLoaded, selectedLocation]);

    const handleLocationSelect = useCallback((loc: { lat: number, lng: number, address?: string }) => {
        setSelectedLocation({ lat: loc.lat, lng: loc.lng });
        // Distance calculation is triggered by useEffect
    }, []);

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
        const win = window.open(url, '_blank');

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
                                                        <option value="Tealca">Tealca</option>
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
                                            <div className="space-y-4">
                                                <AddressAutocomplete
                                                    isLoaded={isLoaded}
                                                    setAddress={setShippingAddress}
                                                    onLocationSelect={handleLocationSelect}
                                                    hasError={showValidationErrors && !shippingAddress}
                                                />
                                                <MapPicker
                                                    isLoaded={isLoaded}
                                                    selectedLocation={selectedLocation}
                                                    onLocationSelect={handleLocationSelect}
                                                />
                                                {/* Hidden input to keep state sync if needed or just rely on AddressAutocomplete updating parent state via prop */}
                                            </div>
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
                            {(() => {
                                let deliveryFee = 0;
                                let distanceRange = '';
                                let deliveryInfo = { fee: 0, distanceRange: '' };

                                if (deliveryMethod === 'shipping' && shippingZone === 'capital') {
                                    if (distanceKm !== null) {
                                        const calc = calculateDeliveryFeeFromDistance(distanceKm);
                                        deliveryFee = calc.fee;
                                        distanceRange = calc.distanceRange;
                                        deliveryInfo = { fee: deliveryFee, distanceRange };
                                    } else if (shippingCity) {
                                        // Fallback to manual city entry
                                        deliveryInfo = calculateDeliveryFee(shippingCity);
                                        deliveryFee = deliveryInfo.fee;
                                        distanceRange = deliveryInfo.distanceRange;
                                    }
                                }
                                const finalTotal = cartTotal + deliveryFee;

                                return (
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
                                                    {deliveryMethod === 'shipping' && shippingZone === 'capital' && calculatingDistance && (
                                                        <span className="text-[10px] text-brand-ink/40 ml-1 italic">Calculando...</span>
                                                    )}
                                                    {deliveryMethod === 'shipping' && shippingZone === 'capital' && !calculatingDistance && deliveryInfo.distanceRange && (
                                                        <span className="text-[10px] text-brand-ink/40 ml-1">({deliveryInfo.distanceRange})</span>
                                                    )}
                                                </span>
                                            </div>
                                            {deliveryMethod === 'pickup' ? (
                                                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">GRATIS</span>
                                            ) : shippingZone === 'national' ? (
                                                <span className="text-[10px] text-orange-500 font-medium">Cobro a destino</span>
                                            ) : deliveryFee > 0 ? (
                                                <span className="font-bold text-brand-accent">${deliveryFee.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-[10px] text-brand-ink/40">Ingrese zona</span>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-dashed border-brand-ink/10 my-2" />

                                        {/* Total */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-brand-ink">TOTAL</span>
                                            <span className="text-2xl font-black text-brand-ink tracking-tighter display-font">
                                                ${finalTotal.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Tariff Reference */}
                                        {deliveryMethod === 'shipping' && shippingZone === 'capital' && (
                                            <p className="text-[9px] text-brand-ink/30 leading-relaxed pt-2 border-t border-brand-ink/5">
                                                📍 Tarifas desde BCV: Centro $4 | Petare/Hatillo $5 | Guarenas $6 | Valles $7
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Submission */}
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

                {/* Custom Toast Notification */}
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

// --- Subcomponents ---

const MapPicker = ({ isLoaded, selectedLocation, onLocationSelect }: { isLoaded: boolean, selectedLocation: { lat: number, lng: number } | null, onLocationSelect: (loc: { lat: number, lng: number }) => void }) => {
    if (!isLoaded) return <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />;

    return (
        <GoogleMap
            mapContainerClassName="w-full h-48 rounded-xl border border-brand-ink/10"
            center={selectedLocation || BCV_COORDS}
            zoom={13}
            onClick={(e) => {
                if (e.latLng) {
                    onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
            }}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {selectedLocation && (
                <Marker
                    position={selectedLocation}
                    draggable={true}
                    onDragEnd={(e) => {
                        if (e.latLng) {
                            onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                        }
                    }}
                />
            )}
        </GoogleMap>
    );
};

const AddressAutocomplete = ({ isLoaded, setAddress, onLocationSelect, hasError }: { isLoaded: boolean, setAddress: (a: string) => void, onLocationSelect: (loc: { lat: number, lng: number, address: string }) => void, hasError?: boolean }) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "ve" },
            locationBias: { center: BCV_COORDS, radius: 20000 }
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
            onLocationSelect({ lat, lng, address: addr });
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    if (!isLoaded) {
        return (
            <input
                disabled
                className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl opacity-50"
                placeholder="Cargando mapa..."
            />
        )
    }

    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    setAddress(e.target.value);
                }}
                disabled={!ready}
                className={`w-full bg-white border py-3 px-4 text-xs focus:border-brand-ink outline-none placeholder:text-brand-ink/30 rounded-xl ${hasError ? 'border-red-500' : 'border-brand-ink/10'}`}
                placeholder="Buscar dirección en Google Maps..."
            />
            {status === "OK" && (
                <ul className="absolute z-50 w-full bg-white border border-brand-ink/10 rounded-xl mt-1 shadow-xl max-h-48 overflow-y-auto">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="p-3 text-xs hover:bg-brand-ink/5 cursor-pointer border-b border-brand-ink/5 last:border-0 text-brand-ink"
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

