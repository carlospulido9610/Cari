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
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 md:pt-24 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 py-6 px-8">
          <h2 className="text-2xl font-bold text-white">Solicitar Cotización</h2>
          <p className="text-slate-300 mt-2 text-sm">
            Complete el formulario y nos pondremos en contacto con usted a la brevedad.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 border-b pb-2">Datos de Contacto</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="Su nombre o empresa"
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                    value={formData.customer_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="correo@ejemplo.com"
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+58 414 ..."
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 border-b pb-2 pt-2">Detalles de la Solicitud</h3>

              {items.length > 0 ? (
                <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center justify-between">
                    <span>Resumen del Carrito ({items.length} productos)</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Total Est: ${items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-sm bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                        {item.image && (
                          <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded bg-slate-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.productName}</p>
                          <p className="text-slate-500 text-xs">
                            {item.selectedVariant && <span className="mr-2">{item.selectedVariant.name}</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-mono">
                            ${item.price.toFixed(2)} × {item.quantity}{item.min_quantity_unit ? ` ${item.min_quantity_unit}` : ''}
                          </div>
                          <div className="font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : productIdFromUrl ? (
                <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Producto a Cotizar</p>
                  <p className="text-slate-900 font-semibold">{selectedProduct?.name || 'Cargando producto...'}</p>
                  {selectedProduct?.sku && <p className="text-xs text-slate-500 font-mono mt-1">SKU: {selectedProduct.sku}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="service_selection" className="block text-sm font-medium text-slate-700 mb-1">Servicio de Interés</label>
                    <select
                      id="service_selection"
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un servicio...</option>
                      {SERVICE_OPTIONS.map((service, idx) => (
                        <option key={idx} value={service}>{service}</option>
                      ))}
                      <option value="Otro / Selección General">Otro / Selección General</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Cantidad Estimada</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="1"
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">{items.length > 0 ? "Instrucciones Especiales" : "Especificaciones / Mensaje Adicional"}</label>
                <textarea
                  name="specifications"
                  rows={4}
                  placeholder={items.length > 0 ? "Dirección de envío, detalles de facturación..." : "Escriba aquí los detalles específicos (colores, tamaños, fechas de entrega)..."}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                  value={formData.specifications}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full text-lg py-3" isLoading={loading}>
                Enviar Solicitud
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
