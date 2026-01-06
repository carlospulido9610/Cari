import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { submitContactRequest } from '../src/services/supabaseClient';

interface ContactSectionProps {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      onError("Por favor complete todos los campos requeridos.");
      setLoading(false);
      return;
    }

    const success = await submitContactRequest(formData);

    if (success) {
      onSuccess("¡Mensaje enviado! Nos pondremos en contacto en breve.");
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } else {
      onError("Algo salió mal. Por favor intente de nuevo.");
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-24 bg-brand-ivory relative overflow-hidden">
      {/* Background Micro Details */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-brand-ink/5" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-brand-ink/5" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="mb-20 text-center opacity-0 animate-reveal" style={{ animationDelay: '0.1s' }}>

          <h2 className="text-4xl md:text-6xl font-medium text-brand-gold display-font mb-4">
            Hablemos de su <span className="font-bold">visión</span>
          </h2>
          <p className="text-brand-ink/40 font-medium text-lg">Conectamos su proyecto con la excelencia técnica que su marca merece.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-brand-ink/5 rounded-sm overflow-hidden bg-white shadow-2xl shadow-brand-ink/5 opacity-0 animate-reveal" style={{ animationDelay: '0.2s' }}>

          {/* Info Sidebar - Industrial Luxury Theme */}
          <div className="lg:col-span-4 bg-brand-ink p-10 md:p-16 text-brand-ivory flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-ink to-brand-ink/90 z-0"></div>

            <div className="relative z-10 space-y-12">
              <div>
                <h3 className="text-sm uppercase tracking-wider font-semibold text-white/60 mb-8">Información de Contacto</h3>
                <div className="space-y-10">
                  <div className="group flex items-start space-x-6">
                    <div className="w-px h-8 bg-brand-accent/30 group-hover:bg-brand-accent transition-colors"></div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide font-semibold text-white/50">Teléfono</p>
                      <p className="text-lg font-semibold text-white">+58 414 792 69 34</p>
                    </div>
                  </div>
                  <div className="group flex items-start space-x-6">
                    <div className="w-px h-8 bg-brand-accent/30 group-hover:bg-brand-accent transition-colors"></div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide font-semibold text-white/50">Email</p>
                      <p className="text-lg font-semibold text-white">coimpor.es@gmail.com</p>
                    </div>
                  </div>
                  <div className="group flex items-start space-x-6">
                    <div className="w-px h-8 bg-brand-accent/30 group-hover:bg-brand-accent transition-colors"></div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide font-semibold text-white/50">Ubicación</p>
                      <p className="text-base font-medium text-white/90 leading-relaxed">
                        Torre Insbanca, Avenida Urdaneta.<br />Caracas, Venezuela.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced WhatsApp Integration */}
              <div className="pt-12 border-t border-brand-ivory/10">
                <p className="text-xs uppercase tracking-wide font-semibold text-white/40 mb-6">Asesoría Inmediata</p>
                <a
                  href="https://wa.me/584147926934"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:border-[#25D366] transition-all duration-500">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wider group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form - Minimal Editorial */}
          <div className="lg:col-span-8 bg-white p-10 md:p-20">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-wide font-semibold text-brand-ink/60">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-brand-ink placeholder:text-brand-ink/30 focus:border-brand-ink outline-none transition-colors text-base font-medium rounded-xl"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-wide font-semibold text-brand-ink/60">Email de Contacto *</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-brand-ink placeholder:text-brand-ink/30 focus:border-brand-ink outline-none transition-colors text-base font-medium rounded-xl"
                    placeholder="empresa@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-wide font-semibold text-brand-ink/60">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-brand-ink placeholder:text-brand-ink/30 focus:border-brand-ink outline-none transition-colors text-base font-medium tabular-nums rounded-xl"
                    placeholder="+58 (000) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-xs uppercase tracking-wide font-semibold text-brand-ink/60">Organización</label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-white border border-brand-ink/10 py-3 px-4 text-brand-ink placeholder:text-brand-ink/30 focus:border-brand-ink outline-none transition-colors text-base font-medium rounded-xl"
                    placeholder="Nombre de la marca"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs uppercase tracking-wide font-semibold text-brand-ink/60">Mensaje / Requerimiento *</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-brand-ink/10 p-6 text-brand-ink placeholder:text-brand-ink/30 focus:border-brand-ink outline-none transition-colors text-base font-medium rounded-xl resize-none"
                  placeholder="Detalles sobre su proyecto o duda específica..."
                  required
                ></textarea>
              </div>

              <div className="pt-8">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full md:w-auto px-12 py-4 text-sm uppercase tracking-wider font-semibold bg-brand-ink text-white hover:translate-y-[-2px] transition-all shadow-lg"
                >
                  Confirmar Envío
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section >
  );
};