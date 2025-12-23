import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { submitContactRequest } from '../services/supabaseClient';

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
    <section id="contact" className="pb-8 md:pb-24 bg-[#fdfdfd] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#44b6da]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#1e3857]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1e3857] tracking-tight">Ponte en Contacto</h2>
          <p className="text-slate-500 mt-2 md:mt-3 text-sm md:text-lg font-light">¿Tienes una pregunta específica? Nuestro equipo está listo para ayudar.</p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0 border border-slate-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl shadow-slate-200/50 hover:shadow-xl transition-shadow duration-300">

          {/* Info Sidebar - Order 2 on mobile, order 1 on desktop */}
          <div className="order-2 lg:order-1 bg-[#1e3857] p-5 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Subtle pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#44b6da]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
              <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 tracking-wide">Información de Contacto</h3>
              <p className="text-slate-300 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed font-light">
                Completa el formulario y nuestro equipo te responderá en 24 horas.
              </p>

              <div className="space-y-4 md:space-y-8">
                <div className="flex items-start space-x-3 md:space-x-4 group">
                  <div className="p-2.5 md:p-3 bg-white/5 rounded-lg group-hover:bg-[#44b6da]/20 transition-colors">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#44b6da]" />
                  </div>
                  <div>
                    <p className="font-medium text-white/90 text-sm md:text-base">Llámanos</p>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">+58 414 792 69 34</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4 group">
                  <div className="p-2.5 md:p-3 bg-white/5 rounded-lg group-hover:bg-[#44b6da]/20 transition-colors">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#44b6da]" />
                  </div>
                  <div>
                    <p className="font-medium text-white/90 text-sm md:text-base">Envíanos un correo</p>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">coimpor.es@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4 group">
                  <div className="p-2.5 md:p-3 bg-white/5 rounded-lg group-hover:bg-[#44b6da]/20 transition-colors">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#44b6da]" />
                  </div>
                  <div>
                    <p className="font-medium text-white/90 text-sm md:text-base">Visítanos</p>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1 leading-relaxed">Torre Insbanca, Esquina de Santa Capilla a Mijares,<br />Avenida Urdaneta. Caracas, Venezuela.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="mt-6 md:mt-12 p-4 md:p-6 bg-[#44b6da]/10 rounded-xl md:rounded-2xl border border-[#44b6da]/20 relative z-10 backdrop-blur-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#44b6da]" />
                <h4 className="font-bold text-white text-base md:text-lg">Atención por WhatsApp</h4>
              </div>
              <p className="text-slate-300 text-xs mb-3 md:mb-4 leading-relaxed font-light">
                ¿Prefieres una respuesta inmediata? Escríbenos por WhatsApp.
              </p>
              <a
                href="https://wa.me/584147926934"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-medium rounded-lg transition-colors gap-2 shadow-sm text-xs md:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </a>
            </div>
          </div>

          {/* Form - Order 1 on mobile (first), order 2 on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-2 bg-white p-5 md:p-10 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="group">
                  <label htmlFor="name" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5 md:mb-2 group-focus-within:text-[#1e3857] transition-colors">Nombre Completo *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#44b6da]/20 focus:border-[#44b6da] transition-all outline-none placeholder:text-slate-400 text-sm"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5 md:mb-2 group-focus-within:text-[#1e3857] transition-colors">Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#44b6da]/20 focus:border-[#44b6da] transition-all outline-none placeholder:text-slate-400 text-sm"
                    placeholder="juan@empresa.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="group">
                  <label htmlFor="phone" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5 md:mb-2 group-focus-within:text-[#1e3857] transition-colors">Número de Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#44b6da]/20 focus:border-[#44b6da] transition-all outline-none placeholder:text-slate-400 text-sm"
                    placeholder="+58 (414) 792-6934"
                  />
                </div>
                <div className="group">
                  <label htmlFor="company" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5 md:mb-2 group-focus-within:text-[#1e3857] transition-colors">Empresa</label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#44b6da]/20 focus:border-[#44b6da] transition-all outline-none placeholder:text-slate-400 text-sm"
                    placeholder="Tu Empresa C.A."
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="message" className="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5 md:mb-2 group-focus-within:text-[#1e3857] transition-colors">Mensaje *</label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-lg md:rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#44b6da]/20 focus:border-[#44b6da] transition-all outline-none resize-none placeholder:text-slate-400 text-sm"
                  placeholder="Cuéntanos sobre los requisitos de tu proyecto..."
                  required
                ></textarea>
              </div>

              <div className="pt-2 md:pt-4 flex justify-end">
                <Button type="submit" isLoading={loading} className="w-full md:w-auto px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-base rounded-xl shadow-lg shadow-[#1e3857]/10">
                  <Send className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Enviar Mensaje
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section >
  );
};