import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Product, QuoteRequest } from '../types';
import { submitQuoteRequest } from '../src/services/supabaseClient';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  products: Product[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  products,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuoteRequest>({
    customer_name: '',
    email: '',
    phone: '',
    product_id: '',
    quantity: 100,
    specifications: ''
  });

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ ...prev, product_id: selectedProduct.id }));
    }
  }, [selectedProduct]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const product = products.find(p => p.id === formData.product_id);
    const submissionData = {
      ...formData,
      product_name: product?.name || 'Pedido Personalizado'
    };

    const success = await submitQuoteRequest(submissionData);

    if (success) {
      onSuccess("¡Solicitud de cotización recibida! Enviaremos los precios en breve.");
      onClose();
      // Reset form but keep contact info for UX? No, clear for security/freshness
      setFormData({
        customer_name: '',
        email: '',
        phone: '',
        product_id: '',
        quantity: 100,
        specifications: ''
      });
    } else {
      onError("Error al enviar la cotización. Por favor intente de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2" id="modal-title">
              Solicitar Cotización
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Los precios al por mayor varían según la cantidad. Cuéntanos qué necesitas.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Detalles de Contacto</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="customer_name"
                    required
                    placeholder="Tu Nombre"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.customer_name}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Dirección de Correo"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Número de Teléfono"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Detalles del Pedido</label>
                <div className="space-y-3">
                  <select
                    name="product_id"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.product_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar Producto (Opcional)</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-slate-600 whitespace-nowrap">Cantidad:</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>

                  <textarea
                    name="specifications"
                    rows={3}
                    placeholder="Especificaciones adicionales (ej. código de color, ancho del rollo, fecha límite)"
                    className="block w-full rounded-md border-slate-300 bg-slate-50 border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.specifications}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <div className="mt-6">
                <Button type="submit" className="w-full" isLoading={loading}>
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};