import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Product, QuoteRequest } from '../../types';
import { submitQuoteRequest, fetchProducts } from '../../services/supabaseClient';
import { useCart } from '../context/CartContext';

const SERVICE_OPTIONS = [
  "Insumos y Herrajes (Suministro Mayorista)",
  "Identidad de Marca (Placas, Etiquetas, Packaging)",
  "Confección (Patronaje, Corte y Costura)",
];

interface QuotePageProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const QuotePage: React.FC<QuotePageProps> = ({
  onSuccess,
  onError
}) => {
  const [searchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('productId');
  const variantFromUrl = searchParams.get('variant');
  const { items, clearCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false); // For form submission

  // Fetch products for dropdown (Keep fetching to find product name from URL)
  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, []);

  const [formData, setFormData] = useState<QuoteRequest>({
    customer_name: '',
    email: '',
    phone: '',
    product_id: productIdFromUrl || '',
    quantity: 100,
    specifications: variantFromUrl ? `Color/Variante requerida: ${variantFromUrl}` : ''
  });

  const [selectedService, setSelectedService] = useState<string>('');

  useEffect(() => {
    if (productIdFromUrl) {
      setFormData(prev => ({
        ...prev,
        product_id: productIdFromUrl,
        specifications: variantFromUrl ? `Color/Variante requerida: ${variantFromUrl}` : prev.specifications
      }));
    }
  }, [productIdFromUrl, variantFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let submissionData: QuoteRequest = { ...formData };

    if (items.length > 0) {
      // Build detail string from cart
      const cartDetails = items.map(item =>
        `- ${item.productName} (x${item.quantity}) ${item.selectedVariant ? `[${item.selectedVariant.name}]` : ''} ${item.selectedColor ? `[Color: ${item.selectedColor}]` : ''} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const totalEst = items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2);

      submissionData = {
        ...formData,
        product_name: `Cotización de Carrito (${items.length} productos)`,
        product_id: items[0].productId,
        quantity: items.reduce((acc, i) => acc + i.quantity, 0),
        specifications: `RESUMEN DEL PEDIDO:\n${cartDetails}\n\nTOTAL ESTIMADO: $${totalEst}\n\nNOTAS ADICIONALES:\n${formData.specifications}`
      };
    } else if (productIdFromUrl) {
      const product = products.find(p => p.id === productIdFromUrl);
      submissionData = {
        ...formData,
        product_name: product?.name || 'Producto del Catálogo'
      };
    } else {
      submissionData = {
        ...formData,
        service_name: selectedService || 'Otro / Consulta General',
        product_id: undefined
      };
    }

    const success = await submitQuoteRequest(submissionData);

    if (success) {
      if (items.length > 0) clearCart(); // Clear cart if used
      onSuccess("¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.");
      setFormData({
        customer_name: '',
        email: '',
        phone: '',
        product_id: '',
        quantity: 100,
        specifications: ''
      });
      setSelectedService('');
    } else {
      onError("Error al enviar la solicitud. Por favor intente de nuevo.");
    }
    setLoading(false);
  };

  const selectedProduct = products.find(p => p.id === productIdFromUrl);

  return (
    <div className="min-h-screen bg-brand-ivory pt-40 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
      {/* Decorative background lines */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-px h-full bg-brand-ink/5" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-brand-ink/5" />
      </div>

      <div className="max-w-2xl mx-auto px-6 relative z-10">
        <div className="mb-16 text-center opacity-0 animate-reveal" style={{ animationDelay: '0.1s' }}>

          <h1 className="text-4xl md:text-6xl font-medium text-brand-ink display-font mb-4">
            Solicitar <span className="font-bold">cotización</span>
          </h1>
          <p className="text-brand-ink/40 font-light text-lg">Inicie su proyecto con nosotros. Recibirá una respuesta técnica en menos de 24h.</p>
        </div>

        <div className="bg-transparent opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-ink/30 border-b border-brand-ink/5 pb-4 display-font">Datos del Solicitante</h3>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">Nombre o Razón Social</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="Identidad corporativa o personal"
                    className="block w-full bg-transparent border-b border-brand-ink/10 py-3 text-brand-ink placeholder:text-brand-ink/20 focus:border-brand-ink outline-none transition-colors text-lg font-light"
                    value={formData.customer_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">Email de Contacto</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="corporativo@empresa.com"
                      className="block w-full bg-transparent border-b border-brand-ink/10 py-3 text-brand-ink placeholder:text-brand-ink/20 focus:border-brand-ink outline-none transition-colors text-lg font-light"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+58 (000) 000-0000"
                      className="block w-full bg-transparent border-b border-brand-ink/10 py-3 text-brand-ink placeholder:text-brand-ink/20 focus:border-brand-ink outline-none transition-colors text-lg font-light"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-brand-ink/30 border-b border-brand-ink/5 pb-4 display-font">Especificaciones del Pedido</h3>

              {items.length > 0 ? (
                <div className="bg-brand-ink/[0.02] border border-brand-ink/5 p-8 rounded-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-brand-ink/5 pb-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60">Resumen de Selección ({items.length})</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">Est. ${items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="space-y-6 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start">
                        {item.image && (
                          <div className="w-16 h-16 bg-white border border-brand-ink/5 rounded-sm overflow-hidden flex-shrink-0 p-2">
                            <img src={item.image} alt={item.productName} className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-brand-ink display-font uppercase tracking-wider">{item.productName}</p>
                          <div className="text-[10px] text-brand-ink/40 tracking-widest font-bold">
                            {item.selectedVariant && <span className="mr-3">{item.selectedVariant.name}</span>}
                            {item.selectedColor && <span>{item.selectedColor}</span>}
                          </div>
                          <p className="text-[10px] text-brand-ink/30 tabular-nums">
                            ${item.price.toFixed(2)} x {item.quantity}{item.min_quantity_unit ? ` ${item.min_quantity_unit}` : ''}
                          </p>
                        </div>
                        <div className="text-right text-xs font-bold text-brand-ink tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : productIdFromUrl ? (
                <div className="bg-brand-accent/5 border border-brand-accent/10 p-6 rounded-sm">
                  <p className="text-[10px] text-brand-accent font-bold uppercase tracking-[0.2em] mb-3">Pieza seleccionada</p>
                  <p className="text-xl font-medium text-brand-ink display-font">{selectedProduct?.name || 'Cargando producto...'}</p>
                  {selectedProduct?.sku && <p className="text-[10px] text-brand-ink/40 tracking-widest font-bold mt-2 uppercase">Ref. {selectedProduct.sku}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="service_selection" className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">Servicio Requerido</label>
                  <select
                    id="service_selection"
                    className="block w-full bg-transparent border-b border-brand-ink/10 py-3 text-brand-ink outline-none focus:border-brand-ink transition-colors text-lg font-light appearance-none"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una especialidad...</option>
                    {SERVICE_OPTIONS.map((service, idx) => (
                      <option key={idx} value={service}>{service}</option>
                    ))}
                    <option value="Otro / Selección General">Otro / Selección General</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">Cantidad Proyectada</label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    className="block w-full bg-transparent border-b border-brand-ink/10 py-3 text-brand-ink outline-none focus:border-brand-ink transition-colors text-lg font-light tabular-nums"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 display-font">
                  {items.length > 0 ? "Instrucciones de Despacho" : "Detalles del Requerimiento"}
                </label>
                <textarea
                  name="specifications"
                  rows={4}
                  placeholder={items.length > 0 ? "Indique dirección o notas especiales..." : "Detalles de composición, medidas, entregas..."}
                  className="block w-full bg-transparent border border-brand-ink/10 p-6 text-brand-ink placeholder:text-brand-ink/20 focus:border-brand-ink outline-none transition-colors text-lg font-light rounded-sm"
                  value={formData.specifications}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="pt-8">
              <Button
                type="submit"
                className="w-full py-6 text-[10px] uppercase tracking-[0.5em] font-bold bg-brand-ink text-brand-ivory hover:translate-y-[-2px] transition-all shadow-2xl shadow-brand-ink/20"
                isLoading={loading}
              >
                Confirmar Solicitud
              </Button>
              <p className="text-center text-[9px] text-brand-ink/30 uppercase tracking-[0.2em] mt-8 font-bold">
                Sujeto a validación técnica de inventario
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
